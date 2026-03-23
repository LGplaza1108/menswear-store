import { Link } from "react-router-dom";
import Seo from "../components/ui/Seo";
import { useShop } from "../context/ShopContext";

const CartPage = () => {
  const { cart, coupon, totals, updateCartQuantity, removeFromCart, applyCoupon } = useShop();

  const handleCoupon = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await applyCoupon(formData.get("code"));
    event.currentTarget.reset();
  };

  return (
    <div className="container-shell py-10">
      <Seo title="Cart" description="Review your cart, apply coupons, and continue to checkout." />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="surface p-6 md:p-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Cart</p>
              <h1 className="mt-2 text-3xl font-semibold">Shopping bag</h1>
            </div>
            <p className="text-sm text-stone-500">{cart.length} items</p>
          </div>

          <div className="mt-8 space-y-5">
            {cart.length ? (
              cart.map((item) => (
                <article key={item.key} className="flex flex-col gap-4 rounded-[28px] border border-stone-200 p-4 md:flex-row md:items-center">
                  <img src={item.image} alt={item.name} className="h-28 w-full rounded-2xl object-cover md:w-24" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      Size {item.size} • Rs {item.price}
                    </p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="input w-24"
                    value={item.quantity}
                    onChange={(e) => updateCartQuantity(item.key, Number(e.target.value))}
                  />
                  <button type="button" onClick={() => removeFromCart(item.key)} className="text-sm text-stone-500 hover:text-ink">
                    Remove
                  </button>
                </article>
              ))
            ) : (
              <p className="text-sm text-stone-500">Your cart is empty.</p>
            )}
          </div>
        </section>

        <aside className="surface h-fit p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm text-stone-600">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>Rs {totals.subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd>- Rs {totals.discount.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Tax</dt>
              <dd>Rs {totals.tax.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>Rs {totals.deliveryCharge.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold text-ink">
              <dt>Total</dt>
              <dd>Rs {totals.total.toFixed(2)}</dd>
            </div>
          </dl>

          <form onSubmit={handleCoupon} className="mt-6 space-y-3">
            <input name="code" className="input" placeholder="Coupon code" />
            <button type="submit" className="btn-secondary w-full">
              Apply coupon
            </button>
            {coupon && <p className="text-sm text-stone-500">{coupon.code} applied successfully.</p>}
          </form>

          <Link to="/checkout" className="btn-primary mt-6 w-full">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
