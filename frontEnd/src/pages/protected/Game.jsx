// src/pages/Game.jsx
import React, { useState, useContext, useMemo, useEffect } from "react";
import { SocketContext } from "../../context/Socket.jsx";
import PlayCard from "../../component/PlayCard.jsx";
import Chat from "../../component/Chat.jsx";
import { Volume2, VolumeX, Users, MessageSquare, X } from "lucide-react";
import voiceList from "../../assets/voiceList.js";
import BingoLogo from "../../component/BingoLogo.jsx";

function Game() {
  const { calledNumbersList, lastCalledNumber, gameSession, startGame } = useContext(SocketContext);
  const userId = localStorage.getItem("userId");

  const playerCount = gameSession?.players?.length || 0;
  const prizePool = playerCount * Number(gameSession?.bideAmount || 0) * 0.8;

  const [soundOn, setSoundOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDesktopChatOpen, setIsDesktopChatOpen] = useState(false);
  const [gameStartEmitted, setGameStartEmitted] = useState(false);

  // Filter user reserved cards
  const userCards = useMemo(
    () => gameSession?.cards?.filter(c => c.reserved && c.reservedBy === userId) || [],
    [gameSession?.cards, userId]
  );

  const reservedCardCount = useMemo(
    () => gameSession?.cards?.filter(c => c.reserved).length || 0,
    [gameSession?.cards]
  );

  const voiceUrl = lastCalledNumber?.number ? voiceList[lastCalledNumber.number] : null;

  // Emit game start once
  useEffect(() => {
    if (!gameStartEmitted && gameSession?._id && userId) {
      startGame(userId, gameSession._id);
      setGameStartEmitted(true);
    }
  }, [gameStartEmitted, gameSession?._id, startGame, userId]);

  // Mobile horizontal called numbers (for small screens)
  const renderCalledNumbersHorizontal = () => (
    <div className="flex flex-col gap-1 overflow-x-auto no-scrollbar p-3">
      {["B", "I", "N", "G", "O"].map(letter => (
        <div key={letter} className="flex items-center gap-2 w-max mb-1">
          <span className="font-black text-primary min-w-[20px] text-sm">{letter}:</span>
          <div className="flex gap-1.5">
            {calledNumbersList?.filter(n => n.letter === letter).map((num, i) => (
              <div
                key={`${letter}-${i}`}
                className={`min-w-[34px] h-9 flex items-center justify-center text-xs font-black rounded-lg border transition-all ${
                  lastCalledNumber?.number === num.number
                    ? "bg-primary border-primary-hover text-on-primary scale-105 shadow-lg shadow-primary/20"
                    : "bg-[#1c2235] border-white/10 text-white/80"
                }`}
              >
                {num.number}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // Vertical called numbers (desktop/tablet)
  const renderCalledNumbersColumns = () => (
    <div className="grid grid-cols-5 gap-1 overflow-y-auto custom-history-scroll pr-1 mt-1">
      {["B", "I", "N", "G", "O"].map(letter => (
        <div key={letter} className="flex flex-col gap-1">
          <div className="border-border bg-primary text-heading text-on-primary text-center text-[10px]">{letter}</div>
          {calledNumbersList?.filter(n => n.letter === letter).slice().reverse().map((num, i) => (
            <div
              key={`${letter}-col-${i}`}
              className={`aspect-square min-h-[24px] flex items-center justify-center text-[9px] font-black rounded border transition-all ${
                lastCalledNumber?.number === num.number
                  ? "bg-blue-600 border-blue-400 text-white"
                  : "bg-[#1c2235] border-white/10 text-white/70"
              }`}
            >
              {num.number}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen bg-bg text-text flex flex-col font-sans overflow-hidden relative">
      {voiceUrl && soundOn && <audio src={voiceUrl} autoPlay key={lastCalledNumber?.number} />}

      {/* HEADER */}
      <header className="h-28 bg-surface border-b border-border flex flex-col justify-center px-4 md:px-10 shrink-0 z-50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <BingoLogo />
            <button
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                setIsDesktopChatOpen(!isDesktopChatOpen);
              }}
              className={`p-2.5 rounded-xl transition-all border ${
                isChatOpen || isDesktopChatOpen
                  ? "bg-primary border-primary-hover text-on-primary"
                  : "bg-white/5 border-white/10 text-slate-400"
              }`}
            >
              <MessageSquare size={20} />
            </button>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">BingoLive</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="p-2.5 bg-white/5 rounded-xl border border-white/10"
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-400 to-pink-600 p-0.5">
              <div className="w-full h-full rounded-[9px] bg-bg overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId || "guest"}`}
                  alt="user"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center lg:justify-end mt-2 gap-4">
          <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[11px] font-black text-on-primary uppercase tracking-widest">
              Session #{gameSession?._id?.slice(-4) || "WAIT"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-60">
            <Users size={12} className="text-slate-300" />
            <span className="text-[11px] font-bold text-slate-300 uppercase italic">{reservedCardCount} Online</span>
          </div>
        </div>
      </header>

      {/* MOBILE CHAT */}
      {isChatOpen && (
        <div className="lg:hidden absolute inset-x-4 top-32 bottom-4 z-[100] bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 bg-surface border-b border-white/5 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-surface-text">Room Chat</span>
            <X onClick={() => setIsChatOpen(false)} size={20} className="text-slate-500 cursor-pointer" />
          </div>
          <div className="flex-1 overflow-hidden"><Chat /></div>
        </div>
      )}

      <div className="flex flex-1 flex-row overflow-hidden relative">
        {/* Desktop Chat Sidebar */}
        {isDesktopChatOpen && (
          <aside className="hidden lg:flex w-80 bg-surface border-r border-border flex-col"><Chat /></aside>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-bg custom-history-scroll">
          {/* Mobile vertical Latest Call + History */}
          <div className="lg:hidden p-4">
            <div className="mb-4">
              <span className="px-4 py-1 bg-primary text-on-primary text-[11px] font-black uppercase tracking-widest rounded-t-lg">Latest Call</span>
              <div className="relative w-full h-20 rounded-b-lg border-[4px] border-[#1c2235] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md mt-1">
                <div className="absolute inset-0 bg-blue-400/10 animate-pulse rounded-b-lg" />
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-black text-blue-200 uppercase leading-none">{lastCalledNumber?.letter || "—"}</span>
                  <span className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-md">{lastCalledNumber?.number || "—"}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-primary-accent uppercase tracking-widest italic">History Records!</span>
              {renderCalledNumbersHorizontal()}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 p-6 md:p-10">
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {userCards.map(card => (
                <PlayCard key={card._id || card.number} card={card} />
              ))}
            </div>
          </div>
        </main>

        {/* Desktop/Tablet Sidebar */}
        <aside className="hidden sm:flex lg:flex-col bg-surface p-4 sm:p-6 md:p-8 overflow-hidden border-border w-[25vw]">
          {/* Latest Call */}
          <div className="text-center mb-4 shrink-0">
            <span className="px-4 py-1 rounded-t-2xl bg-primary text-on-primary text-[11px] font-black uppercase tracking-[0.3em] w-full border-b border-white/10 shadow">
              Latest Call
            </span>
            <div className="relative w-full h-24 sm:h-28 md:h-32 rounded-b-2xl border-[4px] border-[#1c2235] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md mt-1">
              <div className="absolute inset-0 bg-blue-400/10 animate-pulse rounded-b-2xl" />
              <div className="relative flex items-center justify-center gap-1 px-2">
                <span className="text-3xl sm:text-4xl font-black text-blue-200 uppercase leading-none">{lastCalledNumber?.letter || "—"}</span>
                <span className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter drop-shadow-md">{lastCalledNumber?.number || "—"}</span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="flex-1 flex flex-col pt-2 border-t border-white/5 min-h-0">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[9px] font-black text-primary-accent uppercase tracking-widest italic">History Records!</span>
              <div className="h-px flex-1 bg-white/5 ml-1" />
            </div>
            <div className="flex-1 overflow-y-auto custom-history-scroll">{renderCalledNumbersColumns()}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Game;
