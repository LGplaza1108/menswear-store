import { createContext, useContext, useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "./AuthContext";

const ShopContext = createContext(null);

const CART_KEY = "menswear-cart";
const DEFAULT_FILTERS = {
  category: "",
  size: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  search: "",
  tag: ""
};

export const ShopProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async (nextFilters = filters) => {
    setLoadingProducts(true);
    try {
      const params = Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value));
      const { data } = await client.get("/products", { params });
      setProducts(data.products);
      setCategories(data.categories);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateFilters = async (updates) => {
    const nextFilters = { ...filters, ...updates };
    setFilters(nextFilters);
    await fetchProducts(nextFilters);
  };

  const addToCart = (product, size, quantity = 1) => {
    const key = `${product._id}-${size}`;
    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: Math.min(item.quantity + quantity, 10) } : item
        );
      }

      return [
        ...current,
        {
          key,
          productId: product._id,
          slug: product.slug,
          name: product.name,
          image: product.images[0],
          size,
          quantity,
          price: product.discountPrice || product.price
        }
      ];
    });
  };

  const updateCartQuantity = (key, quantity) => {
    setCart((current) =>
      current
        .map((item) => (item.key === key ? { ...item, quantity: Math.max(1, Math.min(quantity, 10)) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (key) => setCart((current) => current.filter((item) => item.key !== key));
  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const toggleWishlist = async (productId) => {
    await client.post(`/users/wishlist/${productId}`);
    await refreshUser();
  };

  const applyCoupon = async (code) => {
    const { data } = await client.post("/orders/coupon", { code });
    setCoupon(data);
    return data;
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = coupon
      ? coupon.discountType === "percentage"
        ? (subtotal * coupon.discountValue) / 100
        : coupon.discountValue
      : 0;
    const taxable = Math.max(subtotal - discount, 0);
    const tax = taxable * 0.12;
    const deliveryCharge = subtotal >= 2499 ? 0 : subtotal ? 99 : 0;

    return {
      subtotal,
      discount,
      tax,
      deliveryCharge,
      total: taxable + tax + deliveryCharge
    };
  }, [cart, coupon]);

  const wishlistIds = new Set(user?.wishlist?.map((item) => item._id || item) || []);

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        filters,
        loadingProducts,
        cart,
        coupon,
        totals,
        fetchProducts,
        updateFilters,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        toggleWishlist,
        wishlistIds
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
