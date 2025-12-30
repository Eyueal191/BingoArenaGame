import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerificationOTP,
  resendPasswordResetOTP,
  completeAccount,
} from "../controllers/authControllers.js";
import User from "../models/user.js";
import { generateToken } from "../utils/jwt.js"; // assuming you have a JWT util

const router = express.Router();

// =======================
// 🔐 Authentication Routes
// =======================
router.post("/register", register);
router.post("/login", login);

// =======================
// 🔑 Password Management
// =======================
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-password-reset-otp", resendPasswordResetOTP);

// =======================
// 📧 Email Verification
// =======================
router.post("/resend-email-verification-otp", resendEmailVerificationOTP);
router.post("/verify-email", verifyEmail);
// =======================
// Account Completion
// =======================
router.post("/complete-account", completeAccount);

export default router;
