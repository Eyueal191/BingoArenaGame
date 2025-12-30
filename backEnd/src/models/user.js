// models/User.js
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      default: null,
      trim: true,
      lowercase: true, // normalize emails
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
      default: null,
    },
    verificationEmailOTP: {
      type: String,
      default: null,
    },
    verificationEmailOTPExpiryDate: {
      type: Date,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", userSchema);
export default User;
