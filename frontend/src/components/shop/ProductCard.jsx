import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";
import RatingStars from "./RatingStars";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlistIds } = useShop();
  const price = product.discountPrice || product.price;
  const defaultSize = product.sizeStock?.find((item) => item.stock > 0)?.size || "M";

  return (
    <article className="group overflow-hidden rounded-[28px] border border-stone-200 bg-white">
      <Link to={`/products/${product.slug}`} className="block overflow-hidden bg-sand">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{product.category}</p>
            <Link to={`/products/${product.slug}`} className="mt-1 block text-lg font-medium text-ink">
              {product.name}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => user && toggleWishlist(product._id)}
            className="rounded-full border border-stone-200 p-2 text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
          >
            <Heart size={16} fill={wishlistIds.has(product._id) ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Rs {price}</span>
            {product.discountPrice && <span className="text-sm text-stone-400 line-through">Rs {product.price}</span>}
          </div>
          <RatingStars value={product.averageRating} />
        </div>

        <div className="flex gap-3">
          <Link to={`/products/${product.slug}`} className="btn-secondary flex-1">
            View
          </Link>
          <button type="button" onClick={() => addToCart(product, defaultSize, 1)} className="btn-primary flex-1">
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
