import dotenv from "dotenv";
import { connectDb } from "../config/db.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { sampleProducts } from "./products.js";

dotenv.config();

const runSeed = async () => {
  await connectDb();

  await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany(), Coupon.deleteMany()]);

  const admin = await User.create({
    name: "Store Admin",
    email: "admin@menswearstore.com",
    password: "Admin@123",
    phone: "9999999999",
    role: "admin"
  });

  const customer = await User.create({
    name: "Demo Customer",
    email: "customer@example.com",
    password: "Customer@123",
    phone: "8888888888",
    addresses: [
      {
        label: "Home",
        fullName: "Demo Customer",
        phone: "8888888888",
        line1: "14 Residency Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560025",
        country: "India",
        isDefault: true
      }
    ]
  });

  const products = await Product.insertMany(
    sampleProducts.map((product, index) => ({
      ...product,
      reviews:
        index < 2
          ? [
              {
                user: customer._id,
                name: customer.name,
                rating: 5 - index,
                comment: index === 0 ? "Excellent fabric and a very neat fit." : "Simple, premium, and easy to style."
              }
            ]
          : [],
      averageRating: index < 2 ? 5 - index : 0,
      numReviews: index < 2 ? 1 : 0
    }))
  );

  customer.wishlist = [products[0]._id, products[2]._id];
  await customer.save();

  await Coupon.insertMany([
    {
      code: "WELCOME10",
      description: "10% off on your first order",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 999
    },
    {
      code: "FLAT200",
      description: "Rs 200 off above Rs 2499",
      discountType: "flat",
      discountValue: 200,
      minOrderValue: 2499
    }
  ]);

  console.log(`Seed complete. Admin: ${admin.email} / Admin@123`);
  process.exit(0);
};

runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});
