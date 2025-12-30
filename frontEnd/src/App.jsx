import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
// Public Pages
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ResetPassword from "./pages/public/ResetPassword";
import VerifyEmail from "./pages/public/VerifyEmail";
import ForgotPassword from "./pages/public/ForgotPassword";
import CompleteAccount from "./pages/public/CompleteAccount.jsx";

// Protected Pages
import CardSelection from "./pages/protected/CardSelection";
import Countdown from "./pages/protected/Countdown";
import Game from "./pages/protected/Game";
import Lobby from "./pages/protected/Lobby";
import Payment from "./pages/protected/Payment";
import Profile from "./pages/protected/Profile";
import Transactions from "./pages/protected/Transactions";
import Winner from "./pages/protected/Winner";
import Loser from "./pages/protected/Loser.jsx";
// Fallback Page
import NotFound from "./pages/NotFound.jsx";

const App = () => {
  const [mode, setMode] = useState("dark"); // light | dark
  const [color, setColor] = useState("blue"); // blue | green
  const navigate = useNavigate();

  // Load saved preferences on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("mode") || "dark";
    const savedColor = localStorage.getItem("color") || "blue";

    setMode(savedMode);
    setColor(savedColor);
    applyTheme(savedColor, savedMode);
  }, []);

  // Apply theme classes to <html>
  const applyTheme = (colorName, modeName) => {
    const html = document.documentElement;
    html.classList.remove("blue", "green", "light", "dark");
    html.classList.add(colorName, modeName);
  };

  // Toggle between light and dark modes
  const toggleMode = () => {
    const nextMode = mode === "dark" ? "light" : "dark";
    setMode(nextMode);
    localStorage.setItem("mode", nextMode);
    applyTheme(color, nextMode);
  };

  // Toggle between blue and green themes
  const toggleColor = () => {
    const nextColor = color === "blue" ? "green" : "blue";
    setColor(nextColor);
    localStorage.setItem("color", nextColor);
    applyTheme(nextColor, mode);
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    const isLoggedIn = Boolean(localStorage.getItem("userId"));
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <>
      {/* =====================
          Theme Controls
          ===================== */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={toggleMode}
          className="px-3 py-2 rounded-md bg-secondary text-text border border-border hover:scale-105 transition"
        >
          {mode === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <button
          onClick={toggleColor}
          className="px-3 py-2 rounded-md bg-primary text-on-primary hover:scale-105 transition"
        >
          {color === "blue" ? "Green Theme" : "Blue Theme"}
        </button>
      </div>

      {/* =====================
          Routes
          ===================== */}
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/complete-account" element={<CompleteAccount />} />

        {/* Protected Pages */}
        <Route
          path="/card-selection"
          element={
            <ProtectedRoute>
              <CardSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/countdown"
          element={
            <ProtectedRoute>
              <Countdown />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lobby"
          element={
            <ProtectedRoute>
              <Lobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/winner"
          element={
            <ProtectedRoute>
              <Winner />
            </ProtectedRoute>
          }
        />
          <Route
          path="/loser"
          element={
            <ProtectedRoute>
              <Loser />
            </ProtectedRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
