// src/components/PlayCard.jsx
import React, { useState, useContext, useEffect } from "react";
import { isMarkedReallyCalled, checkBingo } from "../utils/validators.js";
import { SocketContext } from "../context/Socket";
import toast from "react-hot-toast";
import { Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PlayCard({ card }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const { calledNumbersList, winner, endGame, gameSession } = useContext(SocketContext);

  if (!card?.numbers) return null;

  const { B, I, N, G, O } = card.numbers;

  // ---------------- MARKED NUMBERS STATE ----------------
  const [markedNumbers, setMarkedNumbers] = useState({
    B: [], I: [], N: [], G: [], O: [],
  });

  // ---------------- MARK/UNMARK CELL ----------------
  const markCell = (column, value, row, col) => {
    setMarkedNumbers((prev) => {
      const alreadyMarked = prev[column].some((cell) => cell.value === value && cell.row === row);
      if (alreadyMarked) {
        // Unmark
        return {
          ...prev,
          [column]: prev[column].filter((cell) => !(cell.value === value && cell.row === row)),
        };
      }
      // Mark
      return {
        ...prev,
        [column]: [...prev[column], { value, row, col }],
      };
    });
  };

  // ---------------- HANDLE BINGO ----------------
  const handleBingo = () => {
    if (!isMarkedReallyCalled(markedNumbers, calledNumbersList)) {
      return toast.error("You've marked an uncalled number!");
    }
    if (!checkBingo(markedNumbers)) {
      return toast.error("No pattern matched yet.");
    }

    const gameSessionId = gameSession?._id;
    const cardNumber = card.number;
    endGame(userId, gameSessionId, cardNumber, markedNumbers);
  };

  // ---------------- NAVIGATE ON WINNER ----------------
  useEffect(() => {
    if (!winner) return;
    if (winner.winnerId === userId) {
      navigate("/winner");
    } else {
      navigate("/loser");
    }
  }, [winner, userId, navigate]);

  // ---------------- GRID DATA ----------------
  const columns = [
    { label: "B", data: B, index: 0 },
    { label: "I", data: I, index: 1 },
    { label: "N", data: N, index: 2 },
    { label: "G", data: G, index: 3 },
    { label: "O", data: O, index: 4 },
  ];

  return (
    <div className="max-w-[340px] mx-auto bg-[#111622] p-3 rounded-2xl border border-white/5 shadow-2xl">
      {/* B-I-N-G-O HEADER */}
      <div className="grid grid-cols-5 mb-2 border-b border-white/5 pb-2">
        {["B", "I", "N", "G", "O"].map((letter) => (
          <div
            key={letter}
            className="text-center text-xs font-black text-blue-500/80 tracking-tighter uppercase"
          >
            {letter}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-5 gap-1.5">
        {columns.map((colObj) => (
          <div key={colObj.label} className="flex flex-col gap-1.5">
            {colObj.data.map((value, rowIdx) => {
              const isMarked = markedNumbers[colObj.label].some(
                (cell) => cell.value === value && cell.row === rowIdx
              );

              return (
                <button
                  key={`${colObj.label}-${rowIdx}`}
                  onClick={() => markCell(colObj.label, value, rowIdx, colObj.index)}
                  className={`aspect-square rounded-lg text-sm font-bold transition-all duration-150
                    flex items-center justify-center
                    ${isMarked
                      ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] border-none ring-1 ring-blue-400/50"
                      : "bg-[#1c2235] text-slate-500 border border-white/5 hover:border-white/10"
                    }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* CLAIM BINGO BUTTON */}
      <button
        onClick={handleBingo}
        className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <Trophy size={14} />
        Bingo
      </button>

      {/* CARD ID */}
      <p className="text-[8px] text-center text-slate-700 mt-2 font-bold uppercase tracking-tighter">
        Card #{card._id?.slice(-6) || "000"}
      </p>
    </div>
  );
}

export default PlayCard;
