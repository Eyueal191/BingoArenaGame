// src/context/Socket.jsx
import { createContext, useEffect, useCallback, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../service/Socket";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ===========================
// ZUSTAND STORE
// ===========================
export const useSocketStore = create(
  persist(
    (set) => ({
      bidAmount: 10,
      gameSession: null,
      winner: null,
      user: null,
      countDown: 45,
      winnerInfo: { winnerName: null, winnerCardNumber: null },
      targetedChatHistory: [],
      setBidAmount: (bidAmount) => set({ bidAmount }),
      setGameSession: (gameSession) => set({ gameSession }),
      setWinner: (winner) => set({ winner }),
      setUser: (user) => set({ user }),
      setCountDown: (countDown) => set({ countDown }),
      setTargetedChatHistory: (history) =>
        set({ targetedChatHistory: history }),
    }),
    {
      name: "socket-store",
      storage: sessionStorage,
    }
  )
);


// ===========================
// REACT CONTEXT
// ===========================
export const SocketContext = createContext(null);

export const SocketContextProvider = ({ children }) => {
  const {
    bidAmount,
    gameSession,
    user,
    winner,
    countDown,
    targetedChatHistory,
    setBidAmount,
    setGameSession,
    setWinner,
    setUser,
    setCountDown,
    setTargetedChatHistory,
  } = useSocketStore();

  const userId = localStorage.getItem("userId");

  // ---------------- CALLED NUMBERS STATE ----------------
  const [calledNumbersList, setCalledNumbersList] = useState([]);
  const [lastCalledNumber, setLastCalledNumber] = useState(null);
const [goToCountDown, setGoToCountDown] = useState(false);

useEffect(() => {
  if (!gameSession?.cards) return;

  const hasMyReservedCard = gameSession.cards.some(
    card => card.reserved && card.reservedBy === userId
  );

  const hasOtherReservedCard = gameSession.cards.some(
    card => card.reserved && card.reservedBy !== userId
  );

  setGoToCountDown(hasMyReservedCard && hasOtherReservedCard);
}, [gameSession, userId]);
  const addCalledNumberToList = (number) => {
    setCalledNumbersList((prev) => {
      const exists = prev.some(
        (n) => n.letter === number.letter && n.number === number.number
      );
      if (exists) return prev;
      setLastCalledNumber(number);
      console.log("🟢 Number added to calledNumbersList:", number);
      return [...prev, number];
    });
  };

  const resetCalledNumbers = () => {
    setCalledNumbersList([]);
    setLastCalledNumber(null);
    console.log("🟡 Called numbers reset");
  };

  // ---------------- JOIN GAME ----------------
  const joinGame = useCallback(
    (bid) => {
      if (!userId || !bid) return;
      console.log("📤 Emitting join_game:", { userId, bidAmount: bid });
      socket.emit("join_game", { userId, bidAmount: bid });
    },
    [userId]
  );

  // ---------------- CARD ACTIONS ----------------
  const reserveSingleCard = (cardNumber) => {
    console.log("📤 Emitting reserve_card:", { userId, cardNumber });
    socket.emit("reserve_card", { userId, cardNumber, gameSessionId:gameSession._id});
  };

  const reserveMultipleCards = (cardNumbers) => {
    if (!cardNumbers.length) return;
    console.log("📤 Emitting reserve_cards:", { userId, cardNumbers, gameSessionId:gameSession._id });
    socket.emit("reserve_cards", { userId, cardNumbers });
  };

  const unreserveSingleCard = (cardNumber) => {
    console.log("📤 Emitting unreserve_card:", { userId, cardNumber, gameSessionId:gameSession._id });
    socket.emit("unreserve_card", { userId, cardNumber,gameSessionId:gameSession._id });
  };

  const unreserveMultipleCards = (cardNumbers) => {
    if (!cardNumbers.length) return;
    console.log("📤 Emitting unreserve_cards:", { userId, cardNumbers,  });
    socket.emit("unreserve_cards", { userId, cardNumbers });
  };

  // ---------------- GAME FLOW ----------------
  const startCountDown = (uid, sessionId) => {
    if (!uid || !sessionId) return;
    console.log("📤 Emitting start_count_down:", { userId: uid, gameSessionId: sessionId });
    socket.emit("start_count_down", { userId: uid, gameSessionId: sessionId });
  };

  const startGame = (uid, sessionId) => {
    if (!uid || !sessionId) return;
    console.log("📤 Emitting game_start:", { userId: uid, gameSessionId: sessionId });
    socket.emit("game_start", { userId: uid, gameSessionId: sessionId });
  };

  const endGame = ( userId, gameSessionId, cardNumber, markedNumbers) => {
    console.log("📤 Emitting game_end:", { userId, gameSessionId, cardNumber, markedNumbers });
    socket.emit("game_end", {  userId, gameSessionId, cardNumber, markedNumbers });
  };

  // ---------------- CLEAR GAME DATA ----------------
  const clearGameData = () => {
    sessionStorage.removeItem("socket-store");
    setGameSession(null);
    setWinner(null);
    setUser(null);
    setCountDown(10);
    setTargetedChatHistory([]);
    resetCalledNumbers();
    console.log("🟡 Game data cleared");
  };

  // ---------------- CHAT HISTORY ----------------
  const getChatHistory = (playerId, coplayerId) => {
    console.log("📤 Emitting get_chat_history:", { playerId, coplayerId });
    socket.emit("get_chat_history", { playerId, coplayerId });
  };

  // ---------------- AUTO JOIN ----------------
  useEffect(() => {
    console.log("🟢 Connecting socket...");
    connectSocket();
    if (bidAmount) joinGame(bidAmount);
    return () => {
      console.log("🔴 Disconnecting socket...");
      disconnectSocket();
    };
  }, [bidAmount, joinGame]);

  // ---------------- SOCKET LISTENERS ----------------
  useEffect(() => {
    const logAndSet = (eventName, setter) => (data) => {
      console.log(`📥 ${eventName} received:`, data);
      setter(typeof data === "object" ? { ...data } : data);
    };

    socket.on("game_session_update", logAndSet("game_session_update", setGameSession));
    socket.on("user_update", logAndSet("user_update", setUser));
    socket.on("count_down_update", logAndSet("count_down_update", setCountDown));
    socket.on("count_down_finished", () => {
      console.log("📥 count_down_finished received");
      setCountDown(0);
    });
    socket.on("called_number", (number) => {
      console.log("📥 called_number received:", number);
      addCalledNumberToList(number);
    });
    socket.on("game_ended", logAndSet("game_ended", setWinner));
    socket.on("targetedChatHistory_updated", logAndSet("targetedChatHistory_updated", setTargetedChatHistory));

    return () => {
      socket.off("game_session_update");
      socket.off("user_update");
      socket.off("count_down_update");
      socket.off("count_down_finished");
      socket.off("called_number");
      socket.off("game_ended");
      socket.off("targetedChatHistory_updated");
    };
  }, [setGameSession, setUser, setWinner, setCountDown, setTargetedChatHistory]);

  return (
    <SocketContext.Provider
      value={{
        bidAmount,
        setBidAmount,
        gameSession,
        winner,
        user,
        countDown,
        lastCalledNumber,
        calledNumbersList,
        targetedChatHistory,
        joinGame,
        startGame,
        endGame,
        startCountDown,
        reserveSingleCard,
        reserveMultipleCards,
        unreserveSingleCard,
        unreserveMultipleCards,
        addCalledNumberToList,
        resetCalledNumbers,
        clearGameData,
        getChatHistory,
        goToCountDown
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
