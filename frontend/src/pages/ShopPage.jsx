import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/shop/ProductCard";
import Loader from "../components/ui/Loader";
import Seo from "../components/ui/Seo";
import { useShop } from "../context/ShopContext";

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const { products, categories, filters, loadingProducts, updateFilters } = useShop();

  useEffect(() => {
    const tag = searchParams.get("tag");
    if (tag) updateFilters({ tag });
  }, [searchParams]);

  return (
    <div className="container-shell py-10">
      <Seo title="Shop" description="Browse menswear by category, size, and price with a clean grid layout." />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="surface h-fit p-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <div className="mt-5 space-y-4">
            <select className="input" value={filters.category} onChange={(e) => updateFilters({ category: e.target.value })}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select className="input" value={filters.size} onChange={(e) => updateFilters({ size: e.target.value })}>
              <option value="">All sizes</option>
              {["S", "M", "L", "XL"].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="input"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value })}
              />
              <input
                className="input"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilters({ maxPrice: e.target.value })}
              />
            </div>

            <select className="input" value={filters.sort} onChange={(e) => updateFilters({ sort: e.target.value })}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
        </aside>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Collection</p>
              <h1 className="mt-2 text-3xl font-semibold">Shop menswear</h1>
            </div>
            <p className="text-sm text-stone-500">{products.length} products</p>
          </div>

          {loadingProducts ? (
            <Loader label="Loading products..." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ShopPage;
