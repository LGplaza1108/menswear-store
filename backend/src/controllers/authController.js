import crypto from "crypto";
import asyncHandler from "express-async-handler";
import { requireFields } from "../middleware/validation.js";
import { User } from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import { generateToken } from "../utils/generateToken.js";

const authPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  addresses: user.addresses,
  wishlist: user.wishlist,
  token: generateToken(user._id)
});

export const registerUser = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "email", "password"]);
  const { name, email, password, phone } = req.body;
  const existing = await User.findOne({ email });

  if (existing) {
    const error = new Error("Email already in use");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({ name, email, password, phone });
  res.status(201).json(authPayload(user));
});

export const loginUser = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "password"]);
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  res.json(authPayload(user));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email"]);
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.json({ message: "If this email exists, a reset link has been sent." });
    return;
  }

  const token = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `<p>Hello ${user.name},</p><p>Reset your password here:</p><p><a href="${process.env.CLIENT_URL}/reset-password/${token}">${process.env.CLIENT_URL}/reset-password/${token}</a></p>`
  });

  res.json({ message: "If this email exists, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ["password"]);
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select("+password");

  if (!user) {
    const error = new Error("Reset token is invalid or expired");
    error.statusCode = 400;
    throw error;
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password updated successfully" });
});
