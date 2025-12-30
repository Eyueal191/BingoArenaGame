import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is installed

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // success or error message
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!email.trim()) {
      setMessage("Please enter your email.");
      setIsError(true);
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post("/api/auth/forgot-password", { email });
      const data = response.data;

      setMessage(data.message);
      setIsError(data.error);
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
            Forgot Password
          </h2>
          <p className="text-sm text-secondary-accent mt-1">
            Enter your email to receive a password reset OTP
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-sm font-medium text-surface-text"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text placeholder-secondary-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition"
              required
              aria-required="true"
            />
          </div>

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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send OTP"}
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

export default ForgotPassword;
