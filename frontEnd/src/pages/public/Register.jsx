import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import Axios from "../../api/axios.config.js";
import { toast } from "react-toastify";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !password || !confirmPassword) {
      setError("Name and password are required.");
      return;
    }

    if (!email && !phone) {
      setError("Please provide either email or phone number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await Axios.post("/api/auth/register", {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        password,
      });

  const data = res.data;
      if (data.success) {
  toast.success(data.message);
setTimeout(() => {
  navigate("/verify-email");
}, 1500);
} else {
  setError(data.message || "Registration failed.");
}

    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Registration failed.");
      } else {
        setError("Server error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-bg">
      <section className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-2xl shadow-lg p-6 sm:p-8 space-y-6"
          noValidate
        >
          {/* Header */}
          <header className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text">
              Create Your Account
            </h2>
            <p className="text-sm text-surface-text mt-1">
              Join the game and start your journey
            </p>
          </header>

          {/* Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-surface-text">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-surface-text">
              Email (optional)
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-surface-text">
              Phone Number (optional)
            </label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col relative">
            <label className="text-sm font-medium text-surface-text">
              Password <Lock size={16} className="inline ml-1" />
            </label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-[38px]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col relative">
            <label className="text-sm font-medium text-surface-text">
              Confirm Password <Lock size={16} className="inline ml-1" />
            </label>
            <input
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-[38px]"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-semibold disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>

          {/* Footer */}
          <div className="text-sm text-center text-surface-text">
            Already have an account?{" "}
            <Link to="/login" className="font-bold hover:underline">
              Login
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
export default Register;
