import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/Socket.jsx";

function Lobby() {
  const { joinGame, bidAmount, setBidAmount } = useContext(SocketContext);
  const navigate = useNavigate();

  const handleBidChange = (e) => setBidAmount(Number(e.target.value));

  const handleBid = () => {
    // Directly join the game without clearing persisted store
    joinGame(bidAmount);

    // Navigate to card selection
    navigate("/card-selection");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-10 sm:px-6 bg-bg text-text">
      <h1 className="text-hero mb-8 text-center">
        Welcome to the Game Lobby
      </h1>

      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col gap-6">
        <p className="text-subheading text-center">
          Select your bid amount to join the game
        </p>

        <div className="flex flex-col">
          <label htmlFor="bid" className="text-subheading mb-2">
            Bid Amount
          </label>
          <select
            id="bid"
            name="bid"
            value={bidAmount}
            onChange={handleBidChange}
            className="px-4 py-3 border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition"
          >
            {[10, 20, 30, 40, 50, 100, 200, 300, 400, 500, 1000].map(
              (amount) => (
                <option key={amount} value={amount}>
                  {amount} Birr
                </option>
              )
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={handleBid}
          className="mt-4 w-full py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-lg font-semibold text-button transition"
        >
          Join Game
        </button>

        <p className="text-accent text-center text-sm mt-2">
          After selecting your bid, you will be redirected to your cards page.
        </p>
      </div>
    </main>
  );
}

export default Lobby;
