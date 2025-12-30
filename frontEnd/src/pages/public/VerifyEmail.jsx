import React, { useState } from "react";
import Axios from "../../api/axios.config.js";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [verifyEmailOTP, setVerifyEmailOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email.trim() || !verifyEmailOTP.trim()) {
      toast.error("Please enter both email and OTP.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await Axios.post("/api/auth/verify-email", {
        email,
        OTP: verifyEmailOTP,
      });

      const data = res.data;

      if (data.success) {
        toast.success(data.message || "Email verified successfully!");
        setTimeout(() => {
          navigate("/login"); // Redirect after 2 seconds
        }, 2000);
      } else {
        toast.error(data.message || "Verification failed. Try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTPHandler = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email to resend OTP.");
      return;
    }

    try {
      setIsResending(true);

      const res = await Axios.post("/api/auth/resend-email-verification-otp", { email });
      const data = res.data;

      if (data.success) {
        toast.success(data.message || "OTP has been resent to your email!");
      } else {
        toast.error(data.message || "Failed to resend OTP. Try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg">
      <section className="w-full max-w-sm sm:max-w-md md:max-w-lg">
        <form
          onSubmit={submitHandler}
          className="bg-surface border border-border rounded-2xl shadow-lg p-6 sm:p-8 space-y-6"
        >
          <header className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text">
              Verify Your Email
            </h2>
            <p className="text-sm text-surface-text mt-1">
              Enter your email and the OTP sent to it
            </p>
          </header>

          {/* Email field */}
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-surface-text">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text placeholder-secondary-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition"
            />
          </div>

          {/* OTP field */}
          <div className="flex flex-col">
            <label htmlFor="otp" className="text-sm font-medium text-surface-text">
              OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              placeholder="Enter OTP"
              value={verifyEmailOTP}
              onChange={(e) => setVerifyEmailOTP(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text placeholder-secondary-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition"
            />
          </div>

          {/* Verify button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>

          {/* Resend OTP button */}
          <button
            type="button"
            onClick={resendOTPHandler}
            disabled={isResending}
            className="w-full py-3 bg-secondary text-on-secondary rounded-lg font-semibold hover:bg-secondary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default VerifyEmail;
