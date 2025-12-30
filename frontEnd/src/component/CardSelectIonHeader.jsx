import React from "react";
import { useNavigate } from "react-router-dom";
import BingoLogo from "./BingoLogo";

function CardSelectionHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface text-surface-text transition-colors duration-300">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-10">

        {/* Logo Section */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <BingoLogo size="size-8" />
          <h1 className="text-hero text-lg font-bold tracking-tight md:text-xl group-hover:text-primary transition-colors">
            BingoRealtime
          </h1>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3 md:gap-6">

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => navigate("/payment")}
              className="h-10 rounded-lg bg-primary text-on-primary px-4 text-button transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20"
            >
              Recharge
            </button>

            <div className="flex h-10 items-center justify-center rounded-lg bg-secondary text-on-secondary px-4 text-sm font-bold border border-border">
              $15.50
            </div>
          </div>

          {/* Mobile Balance */}
          <div className="flex h-9 items-center justify-center rounded-lg bg-secondary text-on-secondary px-3 text-xs font-bold md:hidden border border-border">
            $15.50
          </div>

          {/* Mobile Menu */}
          <button className="text-text md:hidden p-1">
            <span className="material-symbols-outlined text-[26px]">
              menu
            </span>
          </button>

          {/* Avatar */}
          <div
            onClick={() => navigate("/profile")}
            className="hidden md:block w-10 h-10 cursor-pointer rounded-full bg-cover bg-center ring-2 ring-border hover:ring-primary transition-all"
            style={{
              backgroundImage:
                'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky")',
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default CardSelectionHeader;
