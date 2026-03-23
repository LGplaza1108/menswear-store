import express from "express";
import {
  addAddress,
  deleteAddress,
  toggleWishlist,
  updateAddress,
  updateProfile
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.post("/wishlist/:productId", protect, toggleWishlist);

export default router;
