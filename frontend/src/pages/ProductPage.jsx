import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import RatingStars from "../components/shop/RatingStars";
import Loader from "../components/ui/Loader";
import Seo from "../components/ui/Seo";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

const ProductPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useShop();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [review, setReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const { data } = await client.get(`/products/${slug}`);
        setProduct(data);
        setSelectedSize(data.sizeStock.find((item) => item.stock > 0)?.size || "M");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  const stock = useMemo(() => product?.sizeStock.find((item) => item.size === selectedSize)?.stock || 0, [product, selectedSize]);

  if (loading) return <Loader label="Loading product..." />;
  if (!product) return null;

  const submitReview = async (event) => {
    event.preventDefault();
    await client.post(`/products/${product._id}/reviews`, review);
    const { data } = await client.get(`/products/${slug}`);
    setProduct(data);
    setReview({ rating: 5, comment: "" });
  };

  return (
    <div className="container-shell py-10">
      <Seo title={product.name} description={product.description} />

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[30px] bg-sand">
            <img src={product.images[selectedImage]} alt={product.name} className="h-[520px] w-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {product.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`overflow-hidden rounded-2xl border ${selectedImage === index ? "border-ink" : "border-stone-200"}`}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} className="h-28 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">{product.category}</p>
            <h1 className="mt-2 text-4xl font-semibold">{product.name}</h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">Rs {product.discountPrice || product.price}</span>
                {product.discountPrice && <span className="text-stone-400 line-through">Rs {product.price}</span>}
              </div>
              <RatingStars value={product.averageRating} />
            </div>
          </div>

          <p className="text-sm leading-7 text-stone-600">{product.description}</p>

          <div className="space-y-3">
            <p className="text-sm font-medium">Select size</p>
            <div className="flex flex-wrap gap-3">
              {product.sizeStock.map((entry) => (
                <button
                  key={entry.size}
                  type="button"
                  onClick={() => setSelectedSize(entry.size)}
                  className={`rounded-full border px-4 py-2 text-sm ${selectedSize === entry.size ? "border-ink bg-ink text-white" : "border-stone-300"}`}
                >
                  {entry.size}
                </button>
              ))}
            </div>
            <p className="text-sm text-stone-500">{stock > 0 ? `${stock} pieces available` : "Out of stock"}</p>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => addToCart(product, selectedSize, 1)} className="btn-primary flex-1">
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => {
                addToCart(product, selectedSize, 1);
                navigate("/checkout");
              }}
              className="btn-secondary flex-1"
            >
              Buy now
            </button>
          </div>

          <div className="surface p-6">
            <h2 className="text-lg font-semibold">Reviews & ratings</h2>
            <div className="mt-4 space-y-4">
              {product.reviews.length ? (
                product.reviews.map((item) => (
                  <div key={item._id} className="border-t border-stone-100 pt-4 first:border-none first:pt-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{item.name}</p>
                      <RatingStars value={item.rating} />
                    </div>
                    <p className="mt-2 text-sm text-stone-600">{item.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-500">No reviews yet.</p>
              )}
            </div>

            {user && (
              <form onSubmit={submitReview} className="mt-6 space-y-3 border-t border-stone-100 pt-6">
                <select className="input" value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} stars
                    </option>
                  ))}
                </select>
                <textarea
                  className="input min-h-28"
                  placeholder="Write your review"
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                />
                <button type="submit" className="btn-primary">
                  Save review
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
