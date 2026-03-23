import asyncHandler from "express-async-handler";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { sendEmail } from "../utils/email.js";
import { createRazorpayClient, verifyRazorpaySignature } from "../utils/payment.js";

const round = (value) => Number(value.toFixed(2));

const findStock = (product, size) => product.sizeStock.find((entry) => entry.size === size);

const computePricing = ({ items, coupon }) => {
  const subtotal = round(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const taxRate = Number(process.env.DEFAULT_TAX_RATE || 0.12);
  const deliveryCharge = subtotal >= 2499 ? 0 : Number(process.env.DEFAULT_DELIVERY_CHARGE || 99);
  const discount = coupon
    ? coupon.discountType === "percentage"
      ? round((subtotal * coupon.discountValue) / 100)
      : round(coupon.discountValue)
    : 0;
  const tax = round(Math.max(subtotal - discount, 0) * taxRate);
  const total = round(Math.max(subtotal - discount, 0) + tax + deliveryCharge);

  return { subtotal, tax, deliveryCharge, discount, total };
};

export const applyCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code?.toUpperCase(), active: true });
  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }
  res.json(coupon);
});

export const createOrder = asyncHandler(async (req, res) => {
  const { items, addressId, couponCode } = req.body;
  const user = await User.findById(req.user._id);
  if (!items?.length) {
    const error = new Error("Cart is empty");
    error.statusCode = 400;
    throw error;
  }

  const address = user.addresses.id(addressId);
  if (!address) {
    const error = new Error("A valid address is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.statusCode = 404;
      throw error;
    }

    const stockEntry = findStock(product, item.size);
    if (!stockEntry || stockEntry.stock < item.quantity) {
      const error = new Error(`${product.name} is out of stock for size ${item.size}`);
      error.statusCode = 400;
      throw error;
    }

    normalizedItems.push({
      product: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      size: item.size,
      quantity: item.quantity,
      price: product.discountPrice || product.price
    });
  }

  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    if (!coupon) {
      const error = new Error("Coupon not found");
      error.statusCode = 400;
      throw error;
    }
  }

  const pricing = computePricing({ items: normalizedItems, coupon });
  if (coupon && pricing.subtotal < coupon.minOrderValue) {
    const error = new Error(`Coupon requires a minimum order of Rs ${coupon.minOrderValue}`);
    error.statusCode = 400;
    throw error;
  }

  const razorpay = createRazorpayClient();
  const paymentOrder = razorpay
    ? await razorpay.orders.create({
        amount: Math.round(pricing.total * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      })
    : null;

  const order = await Order.create({
    user: user._id,
    items: normalizedItems,
    shippingAddress: address.toObject(),
    pricing,
    coupon: coupon
      ? {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        }
      : undefined,
    payment: {
      provider: "razorpay",
      status: "pending",
      razorpayOrderId: paymentOrder?.id
    }
  });

  res.status(201).json({
    order,
    razorpay: paymentOrder
      ? {
          orderId: paymentOrder.id,
          amount: paymentOrder.amount,
          key: process.env.RAZORPAY_KEY_ID,
          currency: paymentOrder.currency
        }
      : null
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const order = await Order.findById(orderId).populate("user");
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const verified =
    !process.env.RAZORPAY_KEY_SECRET ||
    verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature
    });

  if (!verified) {
    order.payment.status = "failed";
    await order.save();
    const error = new Error("Payment verification failed");
    error.statusCode = 400;
    throw error;
  }

  order.payment.status = "paid";
  order.payment.razorpayOrderId = razorpayOrderId;
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.status = "confirmed";
  await order.save();

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    const stockEntry = findStock(product, item.size);
    if (stockEntry) stockEntry.stock -= item.quantity;
    await product.save();
  }

  await sendEmail({
    to: order.user.email,
    subject: `Order confirmed #${order._id.toString().slice(-6).toUpperCase()}`,
    html: `<p>Hello ${order.user.name},</p><p>Your order has been confirmed.</p><p>Total: Rs ${order.pricing.total}</p>`
  });

  res.json({ message: "Payment verified", order });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  order.status = req.body.status;
  await order.save();
  res.json(order);
});
