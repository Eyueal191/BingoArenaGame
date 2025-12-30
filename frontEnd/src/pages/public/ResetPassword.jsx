import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Optional: pass userId via state or query param from forgot password page
  const userId = location.state?.userId || "";

  const [OTP, setOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!OTP.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMessage("Please fill in all fields.");
      setIsError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post("/api/auth/reset-password", {
        userId,
        OTP,
        newPassword,
      });

      const data = response.data;
      setMessage(data.message);
      setIsError(data.error);

      if (data.success) {
        setTimeout(() => navigate("/login"), 2000); // Redirect to login after 2s
      }
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 sm:px-6 bg-bg">
      <section className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
        <header className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text">
            Reset Password
          </h2>
          <p className="text-sm text-secondary-accent mt-1">
            Enter the OTP sent to your email and set a new password
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* OTP */}
          <div className="flex flex-col">
            <label
              htmlFor="otp"
              className="text-sm font-medium text-surface-text"
            >
              OTP
            </label>
            <input
              id="otp"
              type="text"
              value={OTP}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="Enter OTP"
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text placeholder-secondary-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition"
              required
              aria-required="true"
            />
          </div>

          {/* New Password */}
          <div className="flex flex-col">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-surface-text"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text placeholder-secondary-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition"
              required
              aria-required="true"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-surface-text"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text placeholder-secondary-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition"
              required
              aria-required="true"
            />
          </div>

          {/* Message */}
          {message && (
            <p
              className={`text-sm text-center ${
                isError ? "text-red-600" : "text-green-500"
              }`}
              role={isError ? "alert" : "status"}
            >
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-sm text-center text-secondary-accent mt-4">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-primary font-medium hover:underline"
          >
            Back to Login
          </button>
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;
