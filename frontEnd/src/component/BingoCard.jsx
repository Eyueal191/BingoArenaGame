import React, { useContext } from "react";
import { SocketContext } from "../context/Socket";

const BingoCard = ({ card, userId }) => {
  const { number, numbers: bingoNumbers = {}, reserved, reservedBy } = card;
  const { reserveSingleCard, unreserveSingleCard } = useContext(SocketContext);
  const bingoHeader = ["B", "I", "N", "G", "O"];

  const isMine = reserved && reservedBy === userId;
  const isTakenByOther = reserved && reservedBy !== userId;

  return (
    <div className="relative rounded-xl shadow-lg bg-surface border border-border w-full max-w-xs mx-auto overflow-hidden transition-all duration-300">
      {/* 1. TOP SECTION (Card Info) */}
      <div className="p-4 pb-0">
        {/* STATUS BADGE */}
        <div
          className={`absolute top-2 left-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
            reserved
              ? isMine
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-error/10 text-error border-error/20"
              : "bg-success/10 text-success border-success/20"
          }`}
        >
          {reserved ? (isMine ? "Your Card" : "Taken") : "Available"}
        </div>

        {/* CARD NUMBER */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-bg text-text text-[10px] font-bold border border-border">
          #{number}
        </div>

        {/* BINGO HEADER */}
        <div className="grid grid-cols-5 gap-1 mt-8 mb-2">
          {bingoHeader.map((letter, idx) => (
            <div
              key={letter}
              className={`aspect-square flex items-center justify-center rounded text-sm font-black ${
                idx % 2 === 0
                  ? "bg-primary text-on-primary"
                  : "bg-secondary text-text border border-border"
              }`}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* NUMBERS GRID */}
        <div className="grid grid-cols-5 gap-1 mb-4">
          {bingoHeader.map((col) => (
            <div key={col} className="flex flex-col gap-1">
              {(bingoNumbers[col] || []).map((num, idx) => {
                const isFreeSpace = col === "N" && (num === "FREE" || idx === 2);
                return (
                  <div
                    key={idx}
                    className={`aspect-square flex items-center justify-center rounded text-[11px] font-bold border transition-all ${
                      isFreeSpace
                        ? "bg-warning/20 text-warning border-warning/40 animate-pulse"
                        : "bg-bg text-text border-border/40"
                    }`}
                  >
                    {isFreeSpace ? "★" : num}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 2. BOTTOM SECTION (Actions) */}
      <div className="bg-secondary p-4 border-t border-border flex flex-col gap-2">
        {/* RESERVE BUTTON */}
        <button
          className={`w-full py-2.5 rounded-lg text-button font-bold transition-all shadow-md ${
            isTakenByOther || isMine
              ? "bg-bg text-secondary-accent cursor-not-allowed opacity-50 border border-border"
              : "bg-primary hover:bg-primary-hover text-on-primary active:scale-95"
          }`}
          onClick={() => !reserved && reserveSingleCard(number)}
          disabled={reserved}
        >
          {isMine ? "Already Reserved" : isTakenByOther ? "Unavailable" : "Reserve Card"}
        </button>

        {/* UNRESERVE BUTTON */}
        <button
          className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
            !isMine
              ? "hidden"
              : "bg-bg hover:bg-secondary-hover text-text border border-border active:scale-95 shadow-sm"
          }`}
          onClick={() => isMine && unreserveSingleCard(number)}
        >
          Unreserve
        </button>
      </div>
    </div>
  );
};
export default BingoCard;
