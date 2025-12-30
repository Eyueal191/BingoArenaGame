import React, { useState, useContext, useEffect, useRef } from "react";
import { SocketContext } from "../../context/Socket.jsx";
import { useNavigate } from "react-router-dom";
import BingoCard from "../../component/BingoCard.jsx";
import CardSelectionHeader from "../../component/CardSelectIonHeader.jsx";
import {
  Search,
  LayoutGrid,
  CheckCircle2,
  User,
  Zap,
  Lock,
  Check,
  ShieldCheck,
  Trash2,
} from "lucide-react";

function CardSelection() {
  const { gameSession, reserveMultipleCards, unreserveMultipleCards, goToCountDown} =
    useContext(SocketContext);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  /* --- Refs --- */
  const cardRefs = useRef({});

  /* --- UI state --- */
  const [multipleMode, setMultipleMode] = useState(false);
  const [filterMode, setFilterMode] = useState("All");
  const [searchedCardNumber, setSearchedCardNumber] = useState("");

  /* --- Card state --- */
  const [filteredCards, setFilteredCards] = useState([]);
  const [reservedCardNumberList, setReservedCardNumberList] = useState([]);
  const [unReservedCardsNumberList, setUnReservedCardsNumberList] = useState(
    []
  );
  const [markedToBeReserved, setMarkedToBeReserved] = useState([]);
  const [markedToBeUnreserved, setMarkedToBeUnreserved] = useState([]);

  /* --- Filter + Search --- */
  useEffect(() => {
    if (!gameSession?.cards) return setFilteredCards([]);

    let cards = [...gameSession.cards];
    if (filterMode === "Available") cards = cards.filter((c) => !c.reserved);
    if (filterMode === "My") cards = cards.filter((c) => c.reservedBy === userId);
    if (searchedCardNumber !== "") {
      const number = Number(searchedCardNumber);
      cards = cards.filter((c) => c.number === number);
    }
    setFilteredCards(cards);
  }, [gameSession, filterMode, searchedCardNumber, userId]);

  /* --- Auto Scroll to searched card --- */
  useEffect(() => {
    const num = Number(searchedCardNumber);
    if (num && cardRefs.current[num]) {
      cardRefs.current[num].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [searchedCardNumber]);

  /* --- Sync server → local state --- */
  useEffect(() => {
    if (!gameSession?.cards) return;

    const reservedByUser = gameSession.cards
      .filter((c) => c.reserved && c.reservedBy === userId)
      .map((c) => c.number);

    const openCards = gameSession.cards
      .filter((c) => !c.reserved)
      .map((c) => c.number);

    setReservedCardNumberList(reservedByUser);
    setUnReservedCardsNumberList(openCards);
    setMarkedToBeReserved((prev) => prev.filter((n) => openCards.includes(n)));
    setMarkedToBeUnreserved((prev) =>
      prev.filter((n) => reservedByUser.includes(n))
    );
  }, [gameSession, userId]);
  /* --- Navigate when players joined --- */
  useEffect(() => {
    if (goToCountDown) navigate("/countdown");
  }, [goToCountDown]);

  /* --- Card selection --- */
  const markCard = (number) => {
    if (reservedCardNumberList.includes(number)) {
      setMarkedToBeUnreserved((prev) =>
        prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
      );
      return;
    }
    if (unReservedCardsNumberList.includes(number)) {
      setMarkedToBeReserved((prev) =>
        prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
      );
    }
  };

  const reserveAllSelected = () => {
    if (!markedToBeReserved.length) return;
    reserveMultipleCards(markedToBeReserved);
    setMarkedToBeReserved([]);
  };

  const unreserveAllSelected = () => {
    if (!markedToBeUnreserved.length) return;
    unreserveMultipleCards(markedToBeUnreserved);
    setMarkedToBeUnreserved([]);
  };

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 font-display">
      <CardSelectionHeader />

      {/* Controls */}
      <section className="sticky top-0 z-50 mx-auto max-w-[1200px] px-4 py-6 bg-bg/95 backdrop-blur-sm">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter */}
            <div className="flex gap-1 rounded-xl border border-border bg-bg p-1">
              {[
                { name: "All", icon: <LayoutGrid size={18} /> },
                { name: "Available", icon: <CheckCircle2 size={18} /> },
                { name: "My", icon: <User size={18} /> },
              ].map((mode) => (
                <button
                  key={mode.name}
                  onClick={() => setFilterMode(mode.name)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                    filterMode === mode.name
                      ? "bg-primary text-on-primary shadow-lg"
                      : "text-secondary-accent hover:text-text hover:bg-secondary"
                  }`}
                >
                  {mode.icon}
                  <span className="hidden sm:inline">{mode.name}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center rounded-lg border border-border bg-bg px-3 py-2 focus-within:ring-2 ring-primary transition-all group">
              <input
                type="number"
                placeholder="Jump to #"
                value={searchedCardNumber}
                onChange={(e) => setSearchedCardNumber(e.target.value)}
                className="w-28 bg-transparent text-sm text-text outline-none placeholder:text-secondary-accent font-bold"
              />
              <Search
                size={18}
                className="text-secondary-accent group-focus-within:text-primary transition-colors"
              />
            </div>

            {/* Quick Buy */}
            <div className="ml-auto flex items-center gap-4 bg-bg px-4 py-2 rounded-xl border border-border">
              <div className="flex flex-col text-right">
                <p className="text-success text-xs font-black uppercase flex items-center justify-end gap-1">
                  <Zap size={12} className="fill-success" /> Quick Buy
                </p>
                <p className="text-secondary-accent text-[10px]">Select & Confirm</p>
              </div>
              <label
                className={`relative flex h-[24px] w-[44px] cursor-pointer items-center rounded-full transition-colors duration-300 ${
                  multipleMode ? "bg-red-600" : "bg-gray-400"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={multipleMode}
                  onChange={() => setMultipleMode((v) => !v)}
                />
                <div
                  className={`ml-0.5 h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    multipleMode ? "translate-x-5" : "translate-x-0"
                  }`}
                ></div>
              </label>
            </div>

            {/* Bulk Actions */}
            {(markedToBeReserved.length > 0 || markedToBeUnreserved.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4 animate-in fade-in slide-in-from-top-2">
                {markedToBeReserved.length > 0 && (
                  <button
                    onClick={reserveAllSelected}
                    className="flex items-center gap-2 rounded-xl bg-success py-3 px-6 text-sm font-black text-on-primary hover:brightness-110 active:scale-95 transition shadow-lg"
                  >
                    <ShieldCheck size={18} />
                    CONFIRM RESERVE ({markedToBeReserved.length})
                  </button>
                )}
                {markedToBeUnreserved.length > 0 && (
                  <button
                    onClick={unreserveAllSelected}
                    className="flex items-center gap-2 rounded-xl bg-secondary border border-border py-3 px-6 text-sm font-black text-on-secondary hover:bg-secondary-hover transition"
                  >
                    <Trash2 size={18} className="text-error" />
                    CANCEL ({markedToBeUnreserved.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <main className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-4 pb-24 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredCards.map((card) => {
          const isMarked =
            markedToBeReserved.includes(card.number) ||
            markedToBeUnreserved.includes(card.number);
          const isTakenByOther = card.reserved && card.reservedBy !== userId;

          return (
            <div
              key={card.number}
              ref={(el) => (cardRefs.current[card.number] = el)}
              onClick={() => multipleMode && !isTakenByOther && markCard(card.number)}
              className={`group relative rounded-2xl border-2 transition-all duration-300 bg-surface ${
                isMarked
                  ? "border-success ring-8 ring-success/10 scale-[1.02] z-10"
                  : "border-transparent hover:border-border hover:shadow-2xl"
              } ${multipleMode && !isTakenByOther ? "cursor-pointer" : "cursor-default"}`}
            >
              {multipleMode && isTakenByOther && (
                <div className="absolute inset-0 bg-bg/80 backdrop-blur-[2px] z-30 flex items-center justify-center rounded-xl">
                  <Lock className="text-secondary-accent" size={40} />
                </div>
              )}

              {multipleMode && isMarked && (
                <div className="absolute -top-2 -right-2 bg-success text-on-primary rounded-full p-1.5 shadow-xl z-40 animate-bounce">
                  <Check size={16} strokeWidth={4} />
                </div>
              )}

              <BingoCard card={card} userId={userId} />
            </div>
          );
        })}
      </main>
    </div>
  );
}

export default CardSelection;
