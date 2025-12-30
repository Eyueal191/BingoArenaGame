import GameSession from "../models/gameSession.js";
import User from "../models/User.js";
import numbersList from "../seed/numberSeed.js";
import shuffler from "../utils/shuffler.js";
import { isMarkedReallyCalled, checkBingo } from "../utils/validators.js";

const gameTimers = new Map();

const gameSocket = (io, socket) => {

  /* =========================
     JOIN GAME
  ========================= */
  socket.on("join_game", async ({ userId, bidAmount }) => {
    console.log("📥 join_game received:", { userId, bidAmount });
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log("❌ User not found:", userId);
        return socket.emit("error", { message: "User not found" });
      }

      let gameSession = await GameSession.findOne({
        status: "waiting",
        bidAmount,
      });

      // JOIN EXISTING
      if (gameSession) {
        console.log("🔍 Joining existing game session:", gameSession._id);
        await GameSession.updateOne(
          { _id: gameSession._id, "players.userId": { $ne: userId } },
          { $push: { players: { userId } } }
        );

        const updatedSession = await GameSession.findById(gameSession._id);
        const roomId = updatedSession._id.toString();

        socket.join(roomId);
        io.to(roomId).emit("game_session_update", updatedSession);
        return;
      }

      // CREATE NEW
      console.log("🆕 Creating new game session for user:", userId);
      const newSession = await GameSession.create({
        status: "waiting",
        bidAmount,
        players: [{ userId }],
        reservedCards: [],
        calledNumbers: [],
        shuffledNumbers: shuffler(numbersList),
      });

      const roomId = newSession._id.toString();
      socket.join(roomId);

      io.to(roomId).emit("game_session_update", newSession);
      socket.emit("user-update", user);

    } catch (err) {
      console.error("❌ join_game error:", err);
      socket.emit("error", { message: "Failed to join game" });
    }
  });

  /* =========================
     START COUNTDOWN
  ========================= */
  socket.on("start_count_down", async ({ userId, gameSessionId }) => {
    console.log("⏳ start_count_down received:", { userId, gameSessionId });
    try {
      await GameSession.updateOne(
        { _id: gameSessionId, "players.userId": userId },
        {
          $set: {
            countdownStarted: true,
            "players.$.status": "ready",
          },
        }
      );

      const gameSession = await GameSession.findById(gameSessionId);
      const roomId = gameSession._id.toString();
      io.to(roomId).emit("game_session_update", gameSession);

      const allReady = gameSession.players.every(p => p.status === "ready");
      if (!allReady) return;

      let count = 45;
      console.log("⏱ Countdown started for room:", roomId);

      const timer = setInterval(async () => {
        io.to(roomId).emit("count_down_update", count--);
        console.log("⏳ Countdown update:", count + 1);

        if (count < 0) {
          clearInterval(timer);
          console.log("✅ Countdown finished for room:", roomId);
          io.to(roomId).emit("count_down_finished");

          await GameSession.updateOne(
            { _id: gameSessionId },
            { $set: { countdownStarted: false } }
          );
        }
      }, 1000);

    } catch (err) {
      console.error("❌ countdown error:", err);
      socket.emit("error", { message: "Countdown failed" });
    }
  });

  /* =========================
     GAME START
  ========================= */
  socket.on("game_start", async ({ gameSessionId }) => {
    console.log("🚀 game_start received for session:", gameSessionId);
    try {
      const gameSession = await GameSession.findById(gameSessionId);
      if (!gameSession || gameSession.status === "ongoing") return;

      await GameSession.updateOne(
        { _id: gameSessionId },
        {
          $set: {
            status: "ongoing",
            calledNumbers: [],
            shuffledNumbers: gameSession.shuffledNumbers?.length
              ? gameSession.shuffledNumbers
              : shuffler(numbersList),
          },
        }
      );

      const roomId = gameSessionId.toString();
      socket.join(roomId);

      const updatedSession = await GameSession.findById(gameSessionId);
      io.to(roomId).emit("game_session_update", updatedSession);
      console.log("🎯 Game started for room:", roomId);

      let index = 0;
      if (gameTimers.has(roomId)) {
        clearInterval(gameTimers.get(roomId));
        gameTimers.delete(roomId);
      }

      const timer = setInterval(async () => {
        if (index >= updatedSession.shuffledNumbers.length) {
          clearInterval(timer);
          gameTimers.delete(roomId);
          console.log("🏁 All numbers called. Restarting game for room:", roomId);

          await GameSession.updateOne(
            { _id: gameSessionId },
            {
              $set: {
                status: "waiting",
                calledNumbers: [],
                shuffledNumbers: shuffler(numbersList),
              },
            }
          );

          io.to(roomId).emit("restart_game");
          return;
        }

        const number = updatedSession.shuffledNumbers[index++];
        console.log("🔢 Number called:", number);
        await GameSession.updateOne(
          { _id: gameSessionId },
          { $push: { calledNumbers: number } }
        );

        io.to(roomId).emit("called_number", number);
      }, 5000);

      gameTimers.set(roomId, timer);

    } catch (err) {
      console.error("❌ game_start error:", err);
      socket.emit("error", { message: "Failed to start game" });
    }
  });

  /* =========================
     GAME END
  ========================= */
  socket.on("game_end", async ({ userId, gameSessionId, cardNumber, markedNumbers }) => {
    console.log("🏆 game_end received:", { userId, gameSessionId, cardNumber });
    try {
      const gameSession = await GameSession.findById(gameSessionId);
      if (!gameSession || gameSession.status === "completed") return;

      if (
        !isMarkedReallyCalled(markedNumbers, gameSession.calledNumbers) ||
        !checkBingo(markedNumbers)
      ) {
        console.log("❌ Invalid bingo claim by user:", userId);
        return socket.emit("error", { message: "Invalid bingo claim" });
      }

      const winner = await User.findById(userId).select("_id name");
      if (!winner) return;

      const roomId = gameSessionId.toString();
      if (gameTimers.has(roomId)) {
        clearInterval(gameTimers.get(roomId));
        gameTimers.delete(roomId);
      }

      await GameSession.updateOne(
        { _id: gameSessionId },
        {
          $set: {
            winner: winner._id,
            winnerCard: cardNumber,
            status: "completed",
            endTime: new Date(),
          },
        }
      );

      console.log("🏅 Winner:", winner.name, "Card:", cardNumber);
      io.to(roomId).emit("game_ended", {
        winnerId: winner._id.toString(),
        winnerName: winner.name,
        winningCard: cardNumber,
      });

    } catch (err) {
      console.error("❌ game_end error:", err);
      socket.emit("error", { message: "Game end failed" });
    }
  });
};
export default gameSocket;
