import crypto from "node:crypto";

/**
 * Generates a secure numeric OTP.
 * @param {number} length - The length of the OTP (default: 6)
 * @returns {string} The generated OTP
 */
const generateOTP = (length = 6) => {
  if (length <= 0) throw new Error("OTP length must be a positive number");

  // Generate random bytes
  const otp = crypto.randomInt(0, 10 ** length)
    .toString()
    .padStart(length, "0"); // Ensures leading zeros are preserved

  return otp;
};

export default generateOTP;
