import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/Socket";

function Winner() {
  const { winner, clearGameData } = useContext(SocketContext);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      clearGameData();
      console.log("🧹 Game data cleared after 45 seconds");
      navigate("/lobby");
    }, 3000);

    return () => clearTimeout(timer);
  }, [clearGameData, navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-surface border border-border rounded-2xl shadow-lg max-w-md w-full p-8 text-center space-y-6">
        
        {/* Title */}
        <h1 className="text-hero text-highlight-on-surface">
          🎉 Congratulations!
        </h1>

        {/* Subtitle */}
        <p className="text-body text-surface-text">
          You’ve won the game 🎯
        </p>

        {/* Winner Details */}
        {winner && (
          <div className="bg-secondary rounded-xl p-4 space-y-2">
            <p className="text-subheading text-surface-text">
              Winning Card
            </p>
            <p className="text-heading text-success">
              #{winner.winningCard}
            </p>
          </div>
        )}

        {/* Helper Text */}
        <p className="text-accent">
          You’ll be redirected to the lobby automatically in 45 seconds.
        </p>

        {/* Manual Exit */}
        <button
          onClick={() => {
            clearGameData();
            navigate("/lobby");
          }}
          className="w-full bg-primary bg-primary-hover rounded-xl py-3 text-button transition"
        >
          Return to Lobby
        </button>
      </div>
    </div>
  );
}

export default Winner;
