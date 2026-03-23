import asyncHandler from "express-async-handler";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [users, products, orders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 })
  ]);

  const revenue = orders
    .filter((order) => order.payment.status === "paid")
    .reduce((sum, order) => sum + order.pricing.total, 0);

  res.json({
    metrics: {
      users,
      products,
      orders: orders.length,
      revenue
    },
    recentOrders: orders.slice(0, 6)
  });
});
