import { Link } from "react-router-dom";
import ProductCard from "../components/shop/ProductCard";
import Seo from "../components/ui/Seo";
import { useAuth } from "../context/AuthContext";

const WishlistPage = () => {
  const { user } = useAuth();

  return (
    <div className="container-shell py-10">
      <Seo title="Wishlist" description="Saved products for later." />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Wishlist</p>
          <h1 className="mt-2 text-3xl font-semibold">Saved for later</h1>
        </div>
        <Link to="/shop" className="btn-secondary">
          Continue shopping
        </Link>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {user?.wishlist?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
