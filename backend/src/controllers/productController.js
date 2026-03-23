import asyncHandler from "express-async-handler";
import { requireFields } from "../middleware/validation.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

const buildFilters = (query) => {
  const filters = {};

  if (query.category) filters.category = query.category;
  if (query.size) filters["sizeStock.size"] = query.size;
  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
  }
  if (query.tag) filters[query.tag] = true;
  if (query.search) {
    filters.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { category: { $regex: query.search, $options: "i" } },
      { tags: { $regex: query.search, $options: "i" } }
    ];
  }

  return filters;
};

const buildSort = (sort) => {
  switch (sort) {
    case "price_asc":
      return { discountPrice: 1, price: 1 };
    case "price_desc":
      return { discountPrice: -1, price: -1 };
    case "rating":
      return { averageRating: -1 };
    default:
      return { createdAt: -1 };
  }
};

export const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find(buildFilters(req.query)).sort(buildSort(req.query.sort));
  const categories = await Product.distinct("category");
  res.json({ products, categories });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate("reviews.user", "name");
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "slug", "description", "price", "category"]);
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  res.json({ message: "Product deleted" });
});

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const hasPurchased = await Order.exists({
    user: req.user._id,
    "items.product": product._id,
    "payment.status": "paid"
  });

  if (!hasPurchased) {
    const error = new Error("You can review this product only after purchasing it");
    error.statusCode = 403;
    throw error;
  }

  const existingReview = product.reviews.find((review) => review.user.toString() === req.user._id.toString());
  if (existingReview) {
    existingReview.rating = Number(rating);
    existingReview.comment = comment;
  } else {
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    });
  }

  product.numReviews = product.reviews.length;
  product.averageRating =
    product.reviews.reduce((total, review) => total + review.rating, 0) / Math.max(product.reviews.length, 1);

  await product.save();
  res.status(201).json({ message: "Review saved" });
});
