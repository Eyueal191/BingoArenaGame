import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Axios from "../../api/axios.config.js";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phoneOrEmail: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneOrEmail = formData.phoneOrEmail.trim();
    const password = formData.password.trim();

    if (!phoneOrEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);

      const res = await Axios.post("/api/auth/login", {
        phoneOrEmail,
        password,
      });

      const data = res.data;

      if (data.success && data.token) {
        // Save auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);

        // Redirect
        navigate("/lobby");
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Invalid credentials.");
      } else if (err.request) {
        setError("Server not responding. Please try again later.");
      } else {
        setError("An unexpected error occurred.");
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
              Welcome Back
            </h2>
            <p className="text-sm text-secondary-accent mt-1">
              Login to your account to continue
            </p>
          </header>

          {/* Email or Phone */}
          <div className="flex flex-col">
            <label
              htmlFor="phoneOrEmail"
              className="text-sm font-medium text-surface-text"
            >
              Email or Phone
            </label>
            <input
              id="phoneOrEmail"
              name="phoneOrEmail"
              type="text"
              placeholder="Enter email or phone number"
              value={formData.phoneOrEmail}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col relative">
            <label
              htmlFor="password"
              className="text-sm font-medium text-surface-text"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] text-text"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
            className="w-full py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary-hover transition disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {/* Footer */}
          <div className="text-sm text-center text-secondary-accent space-y-1">
            <p>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-highlight-on-surface font-bold hover:underline"
              >
                Register
              </button>
            </p>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-highlight-on-surface font-bold hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Login;
