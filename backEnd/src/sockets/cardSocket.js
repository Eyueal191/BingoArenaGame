import GameSession from "../models/GameSession.js";

const cardSocket = (io, socket) => {
  console.log("🟢 Card socket connected:", socket.id);

  // ============================
  // Reserve SINGLE card
  // ============================
  socket.on("reserve_card", async (payload) => {
    console.log("📥 reserve_card received:", payload);
    const { userId, cardNumber, gameSessionId } = payload;

    try {
      const gameSession = await GameSession.findById(gameSessionId);
      if (!gameSession) {
        console.log(`⚠️ GameSession not found: ${gameSessionId}`);
        return;
      }

      const card = gameSession.cards.find(
        (c) => Number(c.number) === Number(cardNumber)
      );
      if (!card) {
        console.log(`⚠️ Card not found: #${cardNumber} in GameSession ${gameSessionId}`);
        return;
      }

      card.reserved = true;
      card.reservedBy = userId;

      await gameSession.save();
      console.log(`[🟢 RESERVE] Card #${cardNumber} reserved by user ${userId}`);

      io.to(gameSessionId).emit("game_session_update", gameSession);
      console.log(`📤 game_session_update emitted for GameSession ${gameSessionId}`);
    } catch (err) {
      console.error(`❌ Error reserving card #${cardNumber} in GameSession ${gameSessionId}:`, err);
    }
  });

  // ============================
  // Unreserve SINGLE card
  // ============================
  socket.on("unreserve_card", async (payload) => {
    console.log("📥 unreserve_card received:", payload);
    const { userId, cardNumber, gameSessionId } = payload;

    try {
      const gameSession = await GameSession.findById(gameSessionId);
      if (!gameSession) {
        console.log(`⚠️ GameSession not found: ${gameSessionId}`);
        return;
      }

      const card = gameSession.cards.find(
        (c) => Number(c.number) === Number(cardNumber)
      );
      if (!card) {
        console.log(`⚠️ Card not found: #${cardNumber} in GameSession ${gameSessionId}`);
        return;
      }

      card.reserved = false;
      card.reservedBy = null;

      await gameSession.save();
      console.log(`[🟢 UNRESERVE] Card #${cardNumber} unreserved by user ${userId}`);

      io.to(gameSessionId).emit("game_session_update", gameSession);
      console.log(`📤 game_session_update emitted for GameSession ${gameSessionId}`);
    } catch (err) {
      console.error(`❌ Error unreserving card #${cardNumber} in GameSession ${gameSessionId}:`, err);
    }
  });

  // ============================
  // Reserve MULTIPLE cards
  // ============================
  socket.on("reserve_cards", async (payload) => {
    console.log("📥 reserve_cards received:", payload);
    const { userId, cardNumbers, gameSessionId } = payload;

    try {
      const gameSession = await GameSession.findById(gameSessionId);
      if (!gameSession) {
        console.log(`⚠️ GameSession not found: ${gameSessionId}`);
        return;
      }

      const cardsToReserve = gameSession.cards.filter((c) =>
        cardNumbers.includes(c.number)
      );

      if (!cardsToReserve.length) {
        console.log(`⚠️ No matching cards to reserve in GameSession ${gameSessionId}`);
        return;
      }

      for (const card of cardsToReserve) {
        card.reserved = true;
        card.reservedBy = userId;
      }

      await gameSession.save();
      console.log(`[🟢 RESERVE] Cards #${cardsToReserve.map(c => c.number).join(", ")} reserved by user ${userId}`);

      io.to(gameSessionId).emit("game_session_update", gameSession);
      console.log(`📤 game_session_update emitted for GameSession ${gameSessionId}`);
    } catch (err) {
      console.error(`❌ Error reserving multiple cards in GameSession ${gameSessionId}:`, err);
    }
  });

  // ============================
  // Unreserve MULTIPLE cards
  // ============================
  socket.on("unreserve_cards", async (payload) => {
    console.log("📥 unreserve_cards received:", payload);
    const { userId, cardNumbers, gameSessionId } = payload;

    try {
      if (!Array.isArray(cardNumbers) || !cardNumbers.length) {
        console.log("⚠️ Invalid cardNumbers payload:", cardNumbers);
        return;
      }

      const gameSession = await GameSession.findById(gameSessionId);
      if (!gameSession) {
        console.log(`⚠️ GameSession not found: ${gameSessionId}`);
        return;
      }

      const cardsToUnreserve = gameSession.cards.filter(
        (card) => cardNumbers.includes(card.number) && card.reserved && card.reservedBy?.toString() === userId
      );

      if (!cardsToUnreserve.length) {
        console.log(`⚠️ No matching cards to unreserve for user ${userId} in GameSession ${gameSessionId}`);
        return;
      }

      for (const card of cardsToUnreserve) {
        card.reserved = false;
        card.reservedBy = null;
      }

      await gameSession.save();
      console.log(`[🟢 UNRESERVE] Cards #${cardsToUnreserve.map(c => c.number).join(", ")} unreserved by user ${userId}`);

      io.to(gameSessionId).emit("game_session_update", gameSession);
      console.log(`📤 game_session_update emitted for GameSession ${gameSessionId}`);
    } catch (err) {
      console.error(`❌ Error unreserving multiple cards in GameSession ${gameSessionId}:`, err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Card socket disconnected:", socket.id);
  });
};
export default cardSocket;
