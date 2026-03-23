import asyncHandler from "express-async-handler";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name ?? user.name;
  user.phone = req.body.phone ?? user.phone;
  if (req.body.password) user.password = req.body.password;
  await user.save();
  res.json({ message: "Profile updated" });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json(user.addresses);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }
  if (req.body.isDefault) {
    user.addresses.forEach((entry) => {
      entry.isDefault = false;
    });
  }
  Object.assign(address, req.body);
  await user.save();
  res.json(user.addresses);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((address) => address._id.toString() !== req.params.addressId);
  await user.save();
  res.json(user.addresses);
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const product = await Product.findById(req.params.productId);
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const exists = user.wishlist.some((item) => item.toString() === req.params.productId);
  user.wishlist = exists
    ? user.wishlist.filter((item) => item.toString() !== req.params.productId)
    : [...user.wishlist, product._id];

  await user.save();
  await user.populate("wishlist");
  res.json(user.wishlist);
});
