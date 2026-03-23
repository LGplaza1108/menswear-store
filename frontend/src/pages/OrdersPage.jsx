import { useEffect, useState } from "react";
import client from "../api/client";
import Seo from "../components/ui/Seo";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    client.get("/orders/mine").then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="container-shell py-10">
      <Seo title="Orders" description="Track pending, shipped, and delivered orders from your account." />
      <div className="surface p-6">
        <h1 className="text-3xl font-semibold">Order history</h1>
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order._id} className="rounded-[24px] border border-stone-200 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                  </p>
                </div>
                <div className="text-sm">
                  <p>Status: {order.status}</p>
                  <p className="mt-1 text-stone-500">Payment: {order.payment.status}</p>
                </div>
                <p className="font-semibold">Rs {order.pricing.total.toFixed(2)}</p>
              </div>
            </article>
          ))}
          {!orders.length && <p className="text-sm text-stone-500">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
