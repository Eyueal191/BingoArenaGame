import sendEmail from "../utils/sendEmail.js";
import htmlTemplate from "../utils/htmlTemplate.js";
import generateOTP from "../utils/generateOTP.js";
import User from "../models/user.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email or phone already exists
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          message: "Email is already registered",
          success: false,
          error: true,
        });
      }
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({
          message: "Phone number is already registered",
          success: false,
          error: true,
        });
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP if email is provided
    const OTP = email ? generateOTP() : null;
    const otpExpiry = email ? new Date(Date.now() + 10 * 60 * 1000) : null; // 10 minutes

    // Create new user
    const newUser = new User({
      name,
      email: email || null,
      phone: phone || null,
      password: hashedPassword,
      verificationEmailOTP: OTP,
      verificationEmailOTPExpiryDate: otpExpiry,
      verified: false,
    });

    // Send OTP email if email is provided
    if (email) {
      const emailResult = await sendEmail({
        to: email,
        subject: "Email Verification OTP",
        html: htmlTemplate(OTP),
      });

      if (!emailResult.success) {
        return res.status(500).json({
          message: `Failed to send verification email: ${emailResult.message}`,
          success: false,
          error: true,
        });
      }
    }

    // Save user
    await newUser.save();

    return res.status(201).json({
      message: "Registered successfully. Please check your email for OTP if provided.",
      success: true,
      error: false,
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, OTP } = req.body;

    // Validate request body
    if (!email || !OTP) {
      return res.status(400).json({
        message: "Email and OTP are required",
        success: false,
        error: true,
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    // Check OTP expiry
    const now = new Date();
    if (!user.verificationEmailOTPExpiryDate || now > user.verificationEmailOTPExpiryDate) {
      return res.status(400).json({
        message: "OTP has expired",
        success: false,
        error: true,
      });
    }

    // Check OTP match
    if (String(user.verificationEmailOTP) !== String(OTP)) {
      return res.status(400).json({
        message: "Invalid OTP",
        success: false,
        error: true,
      });
    }

    // Mark user as verified
    user.verified = true;
    user.verificationEmailOTP = null;
    user.verificationEmailOTPExpiryDate = null;
    await user.save();

    return res.status(200).json({
      message: "Account has been verified successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

const login = async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    // Validate input
    if (!phoneOrEmail || !password) {
      return res.status(400).json({
        message: "Email or Phone and Password are required",
        success: false,
        error: true,
      });
    }

    // Find user by email OR phone
    const user = await User.findOne({
      $or: [
        { email: phoneOrEmail },
        { phone: phoneOrEmail },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not registered",
        success: false,
        error: true,
      });
    }

    // Compare password
    const isPasswordCorrect = await comparePassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Incorrect credentials",
        success: false,
        error: true,
      });
    }

    // Generate token
    const token = generateToken({ id: user._id });

    return res.status(200).json({
      message: "Logged in successfully",
      success: true,
      error: false,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Email is not registered",
        success: false,
        error: true,
      });
    }

    const otp = generateOTP();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

    const emailResult = await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: htmlTemplate(otp),
    });

    if (!emailResult.success) {
      return res.status(400).json({
        message: `Failed to send email: ${emailResult.message || ""}`,
        success: false,
        error: true,
      });
    }

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiryDate = expiryDate;
    await user.save();

    return res.status(200).json({
      message: "An OTP has been sent to your email. Please check and verify it.",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, OTP, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    if (!user.passwordResetOTP || String(user.passwordResetOTP) !== String(OTP)) {
      return res.status(400).json({
        message: "Invalid OTP",
        success: false,
        error: true,
      });
    }

    if (!user.passwordResetOTPExpiryDate || new Date() > user.passwordResetOTPExpiryDate) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        success: false,
        error: true,
      });
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetOTP = null;
    user.passwordResetOTPExpiryDate = null;
    await user.save();

    return res.status(200).json({
      message: "Password has been reset successfully",
      success: true,
      error: false,
      userId: user._id,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

const resendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required", success: false, error: true });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email is not registered", success: false, error: true });

    const otp = generateOTP();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

    const emailResult = await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: htmlTemplate(otp),
    });

    if (!emailResult.success) return res.status(500).json({ message: "Failed to send email", success: false, error: true });

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiryDate = expiryDate;
    await user.save();

    return res.status(200).json({ message: "A new OTP has been sent to your email. Please check and verify it.", success: true, error: false });
  } catch (error) {
    console.error("Resend password reset OTP error:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error", success: false, error: true });
  }
};

const resendEmailVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required", success: false, error: true });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email is not registered", success: false, error: true });

    const otp = generateOTP();
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

    const emailResult = await sendEmail({
      to: email,
      subject: "Email Verification OTP",
      html: htmlTemplate(otp),
    });

    if (!emailResult.success) return res.status(500).json({ message: "Failed to send email", success: false, error: true });

    user.verificationEmailOTP = otp;
    user.verificationEmailOTPExpiryDate = expiryDate;
    await user.save();

    return res.status(200).json({
      message: "A new OTP has been sent to your email. Please check and verify it.",
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Resend email verification OTP error:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error", success: false, error: true });
  }
};

const completeAccount = async (req, res) => {
  try {
    const { password, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found", success: false, error: true });

    user.password = await hashPassword(password);
    await user.save();

    return res.status(201).json({
      message: "Account has been set up completely",
      success: true,
      error: false,
      userId: user._id,
    });
  } catch (error) {
    console.error("Complete account error:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error", success: false, error: true });
  }
};

export {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerificationOTP,
  resendPasswordResetOTP,
  completeAccount,
};
