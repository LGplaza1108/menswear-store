import express from "express";
import {
  applyCoupon,
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
  verifyPayment
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/coupon", protect, applyCoupon);
router.post("/", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/mine", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
