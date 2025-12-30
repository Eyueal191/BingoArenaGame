import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/Socket.jsx";
import BingoCard from "../../component/BingoCard.jsx";
import {
  LayoutGrid,
  CirclePlus,
  Wallet,
  X,
  Search,
  Check,
  ShieldCheck,
  Trash2,
  Clock,
  User,
} from "lucide-react";

function Countdown() {
  const {
    startCountDown,
    countDown,
    gameSession,
    reserveMultipleCards,
    unreserveMultipleCards,
  } = useContext(SocketContext);

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  /* --- Guards & Modal State --- */

  const [emitted, setEmitted] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  /* --- Selection & Filtering State --- */

  const [filterMode, setFilterMode] = useState("All");
  const [searchedCardNumber, setSearchedCardNumber] = useState("");
  const [filteredCards, setFilteredCards] = useState([]);
  const [markedToBeReserved, setMarkedToBeReserved] = useState([]);
  const [markedToBeUnreserved, setMarkedToBeUnreserved] = useState([]);
  const seconds = countDown ?? 10;
  const isUrgent = seconds <= 5 && seconds > 0;

  // Prize Pool: 80% of reserved cards * bid amount

  const prizePool = gameSession?.cards
    ? gameSession.cards.filter((c) => c.reserved).length *
      Number(gameSession.bidAmount || 0) *
      0.8
    : 0;

  /* --- 1. Guarded Socket Emission --- */

  useEffect(() => {
    if (!userId || !gameSession?._id || emitted) return;

    console.log("⏳ Starting countdown for user:", userId, "in game:", gameSession._id);
    setEmitted(true);
    startCountDown(userId, gameSession._id);
  }, [userId, gameSession?._id, emitted, startCountDown]);
  /* --- 2. Navigate to /game when countdown reaches 0 --- */
  useEffect(() => {
    if (countDown === 0) {
      const timer = setTimeout(() => navigate("/game"), 500);
      return () => clearTimeout(timer);
    }
  }, [countDown, navigate]);
  /* --- 3. Filter Logic: Buy Modal --- */
  useEffect(() => {
    if (!gameSession?.cards || !showBuyModal) return;
    let cards = [...gameSession.cards];
    if (filterMode === "Available") cards = cards.filter((c) => !c.reserved);
    if (searchedCardNumber !== "")
      cards = cards.filter((c) => c.number === Number(searchedCardNumber));
    setFilteredCards(cards);
  }, [gameSession, filterMode, searchedCardNumber, showBuyModal]);
  /* --- 4. Filter Logic: Review Modal (Strictly User Cards) --- */
  useEffect(() => {
    if (!gameSession?.cards || !showReviewModal) return;
    const myCards = gameSession.cards.filter((c) => c.reservedBy === userId);
    setFilteredCards(myCards);
  }, [gameSession, userId, showReviewModal]);
  /* --- Card Selection Handler --- */
  const markCard = (number) => {
    const isReservedByMe = gameSession.cards.find((c) => c.number === number)?.reservedBy === userId;
    if (isReservedByMe) {
      setMarkedToBeUnreserved((prev) =>
        prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
      );
    } else {
      setMarkedToBeReserved((prev) =>
        prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
      );
    }
  };
  const handleBulkReserve = () => {
    reserveMultipleCards(markedToBeReserved);
    setMarkedToBeReserved([]);
  };
  const handleBulkUnreserve = () => {
    unreserveMultipleCards(markedToBeUnreserved);
    setMarkedToBeUnreserved([]);
  };
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans relative selection:bg-primary/30">
      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-4 md:px-12 border-b border-border bg-bg/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-lg">
            <LayoutGrid size={20} className="text-on-primary" fill="currentColor" />
          </div>
          <span className="text-heading tracking-tight">Bingo Live</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border">
            <Wallet size={14} className="text-highlight-on-surface" />
            <span className="text-subheading text-highlight-on-surface">$120.50</span>
          </div>
          <div className="w-9 h-9 bg-warning rounded-full border-2 border-border" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <div className="bg-primary/10 text-primary text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-4 border border-primary/20">
          <span className="animate-pulse mr-2">●</span> Live Lobby
        </div>

        <h1 className="text-hero mb-10 tracking-tight text-center">Next Game Starts In</h1>

        {/* Timer UI */}
        <div className="bg-surface/50 border border-border backdrop-blur-md rounded-[40px] p-12 md:p-16 w-full max-w-md mb-8 shadow-2xl flex flex-col items-center justify-center">
          <div className="relative">
            {isUrgent && <div className="absolute inset-0 bg-error/20 blur-3xl rounded-full animate-pulse" />}
            <div
              className={`relative bg-secondary w-40 h-48 md:w-48 md:h-56 rounded-[32px] flex items-center justify-center text-7xl md:text-9xl font-black shadow-inner transition-all duration-300 border-b-[6px] ${
                isUrgent ? "text-error border-error scale-105" : "text-primary border-primary"
              }`}
            >
              {seconds}
            </div>
          </div>
          <p
            className={`text-accent font-bold uppercase mt-8 tracking-[0.4em] ${
              isUrgent ? "text-error" : "text-secondary-accent"
            }`}
          >
            {seconds === 0 ? "Starting..." : "Seconds Remaining"}
          </p>
        </div>

        {/* Game Stats */}
        <div className="w-full max-w-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-surface/60 border border-border rounded-2xl overflow-hidden divide-y divide-border">
              <div className="flex justify-between items-center p-4">
                <span className="text-accent uppercase">Prize Pool</span>
                <span className="text-heading">{prizePool.toFixed(2)} birr</span>
              </div>
              <div className="flex justify-between items-center p-4">
                <span className="text-accent uppercase">Entry Fee</span>
                <span className="text-heading">{Number(gameSession?.bidAmount || 0).toFixed(2)} birr</span>
              </div>
            </div>

            {/* Players Card with Badge */}
            <div className="bg-surface/60 border border-border rounded-2xl p-4 flex items-center justify-between px-8">
              <div className="flex flex-col">
                <span className="text-accent uppercase mb-1">Players</span>
                <p className="text-subheading">{gameSession?.players?.length || 0}/10 Ready</p>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-primary shadow-inner">
                  <User size={24} fill="currentColor" />
                </div>
                {gameSession?.players?.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-surface shadow-lg">
                    +{gameSession.players.length}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowBuyModal(true)}
              className="bg-primary text-on-primary font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
            >
              <CirclePlus size={20} /> Buy More Cards
            </button>
            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-secondary border border-border text-on-secondary font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <LayoutGrid size={18} /> Review My Cards
            </button>
          </div>
        </div>
      </main>

      {/* MODAL SYSTEM */}
      {(showBuyModal || showReviewModal) && (
        <div className="fixed inset-0 z-[100] bg-bg flex flex-col animate-in fade-in">
          <header className="p-4 md:px-12 flex justify-between items-center border-b border-border bg-surface">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setShowBuyModal(false);
                  setShowReviewModal(false);
                }}
                className="p-2 hover:bg-secondary rounded-full transition-colors text-text"
              >
                <X />
              </button>
              <h2 className="text-heading">{showBuyModal ? "Marketplace" : "My Collection"}</h2>
              <div
                className={`ml-4 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black border ${
                  isUrgent ? "border-error text-error animate-pulse" : "border-primary text-primary"
                }`}
              >
                <Clock size={14} /> {seconds}s
              </div>
            </div>

            {showBuyModal && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex gap-1 bg-bg p-1 rounded-lg border border-border">
                  {["All", "Available"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setFilterMode(m)}
                      className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${
                        filterMode === m ? "bg-primary text-on-primary shadow-sm" : "text-secondary-accent"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-bg px-3 py-1.5 rounded-lg border border-border">
                  <Search size={16} className="text-secondary-accent" />
                  <input
                    type="number"
                    placeholder="Card #"
                    className="bg-transparent text-sm outline-none w-16 text-text"
                    onChange={(e) => setSearchedCardNumber(e.target.value)}
                  />
                </div>
              </div>
            )}
            {showReviewModal && (
              <div className="text-accent uppercase tracking-widest text-[10px] font-bold">
                Total: {filteredCards.length} Cards
              </div>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-6 bg-bg/50">
            <div className="mx-auto max-w-[1200px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-32">
              {filteredCards.map((card) => {
                const isMarked =
                  markedToBeReserved.includes(card.number) || markedToBeUnreserved.includes(card.number);
                return (
                  <div
                    key={card.number}
                    onClick={() => markCard(card.number)}
                    className={`relative rounded-2xl border-2 transition-all cursor-pointer ${
                      isMarked
                        ? "border-success ring-4 ring-success/10 scale-[1.02] shadow-xl"
                        : "border-transparent bg-surface hover:border-border"
                    }`}
                  >
                    {isMarked && (
                      <div className="absolute -top-2 -right-2 bg-success text-on-primary rounded-full p-1.5 z-40 shadow-xl border-2 border-bg">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    )}
                    <BingoCard card={card} userId={userId} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Bar */}
          {(markedToBeReserved.length > 0 || markedToBeUnreserved.length > 0) && (
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-surface border-t border-border flex justify-center gap-4 z-[110] shadow-2xl animate-in slide-in-from-bottom">
              {markedToBeReserved.length > 0 && (
                <button
                  onClick={handleBulkReserve}
                  className="bg-success py-4 px-8 rounded-xl text-sm font-black text-on-primary flex items-center gap-2 shadow-xl hover:brightness-110 active:scale-95 transition-all"
                >
                  <ShieldCheck size={18} /> CONFIRM PURCHASE ({markedToBeReserved.length})
                </button>
              )}
              {markedToBeUnreserved.length > 0 && (
                <button
                  onClick={handleBulkUnreserve}
                  className="bg-secondary border border-border py-4 px-8 rounded-xl text-sm font-black text-on-secondary flex items-center gap-2 hover:bg-secondary-hover active:scale-95 transition-all"
                >
                  <Trash2 size={18} className="text-error" /> RETURN CARDS ({markedToBeUnreserved.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Countdown;
