import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/shop/ProductCard";
import SectionTitle from "../components/ui/SectionTitle";
import Seo from "../components/ui/Seo";
import { useShop } from "../context/ShopContext";

const HomePage = () => {
  const { products } = useShop();
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const arrivals = products.filter((product) => product.newArrival).slice(0, 4);

  return (
    <>
      <Seo title="Home" description="Simple, modern menswear storefront built for fast shopping." />

      <section className="container-shell py-8 md:py-14">
        <div className="surface overflow-hidden bg-[linear-gradient(135deg,#f7f5f0_0%,#ffffff_60%,#ebe7de_100%)] p-8 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-stone-500">Modern essentials</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-ink md:text-6xl">
                Clean menswear for work, weekends, and everything in between.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-stone-600 md:text-base">
                A minimal store experience with clear pricing, practical filters, fast checkout, and wardrobe staples
                that stay easy to wear.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/shop" className="btn-primary">
                  Shop collection
                </Link>
                <Link to="/shop?tag=newArrival" className="btn-secondary">
                  New arrivals
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {products.slice(0, 2).map((product) => (
                <div key={product._id} className="overflow-hidden rounded-[28px] bg-white">
                  <img src={product.images[0]} alt={product.name} className="h-72 w-full object-cover" />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-stone-500">{product.category}</p>
                    <p className="mt-2 text-lg font-medium">{product.name}</p>
                    <p className="mt-2 text-sm text-stone-500">Rs {product.discountPrice || product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-10">
        <SectionTitle
          eyebrow="Featured"
          title="A sharper everyday rotation"
          body="Focused pieces with neutral tones, practical fits, and enough detail to feel premium without feeling loud."
          action={
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-ink">
              View all <ArrowRight size={16} />
            </Link>
          }
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="container-shell py-10">
        <div className="surface p-8 md:p-10">
          <SectionTitle
            eyebrow="Just in"
            title="New arrivals"
            body="Fresh additions with the same low-noise design language and fit-first product setup."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {arrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
