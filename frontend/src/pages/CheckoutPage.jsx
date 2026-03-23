import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import Seo from "../components/ui/Seo";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, coupon, totals, clearCart } = useShop();
  const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.find((item) => item.isDefault)?._id || "");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!selectedAddress) return;
    setPlacing(true);

    try {
      const { data } = await client.post("/orders", {
        items: cart.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity
        })),
        addressId: selectedAddress,
        couponCode: coupon?.code
      });

      if (data.razorpay && window.Razorpay) {
        const razorpay = new window.Razorpay({
          key: data.razorpay.key,
          amount: data.razorpay.amount,
          currency: data.razorpay.currency,
          name: "Menswear Store",
          order_id: data.razorpay.orderId,
          handler: async (response) => {
            await client.post("/orders/verify-payment", {
              orderId: data.order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            clearCart();
            navigate("/orders");
          }
        });
        razorpay.open();
      } else {
        await client.post("/orders/verify-payment", {
          orderId: data.order._id,
          razorpayOrderId: data.order.payment.razorpayOrderId || "manual_test_order",
          razorpayPaymentId: "manual_test_payment",
          razorpaySignature: "manual_signature"
        });
        clearCart();
        navigate("/orders");
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-shell py-10">
      <Seo title="Checkout" description="Choose an address, review your order, and pay securely." />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Step 1</p>
            <h1 className="mt-2 text-2xl font-semibold">Select delivery address</h1>
            <div className="mt-6 space-y-4">
              {user?.addresses?.map((address) => (
                <label key={address._id} className="flex cursor-pointer gap-4 rounded-[24px] border border-stone-200 p-4">
                  <input type="radio" checked={selectedAddress === address._id} onChange={() => setSelectedAddress(address._id)} />
                  <div className="text-sm text-stone-600">
                    <p className="font-medium text-ink">{address.fullName}</p>
                    <p>
                      {address.line1}, {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.phone}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Step 2</p>
            <h2 className="mt-2 text-2xl font-semibold">Order summary</h2>
            <div className="mt-6 space-y-4">
              {cart.map((item) => (
                <div key={item.key} className="flex items-center gap-4 rounded-2xl border border-stone-200 p-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-stone-500">
                      Size {item.size} • Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">Rs {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="surface h-fit p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Step 3</p>
          <h2 className="mt-2 text-2xl font-semibold">Payment</h2>
          <p className="mt-3 text-sm text-stone-500">
            Razorpay test mode is used when keys are configured. Otherwise the checkout falls back to a local test confirmation flow.
          </p>

          <dl className="mt-6 space-y-3 text-sm text-stone-600">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>Rs {totals.subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd>Rs {totals.discount.toFixed(2)}</dd>
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

          <button type="button" disabled={!selectedAddress || !cart.length || placing} onClick={handleCheckout} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60">
            {placing ? "Processing..." : "Pay now"}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
