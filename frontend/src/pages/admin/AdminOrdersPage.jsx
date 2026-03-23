import { useEffect, useState } from "react";
import client from "../../api/client";
import Seo from "../../components/ui/Seo";

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await client.get("/orders");
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await client.put(`/orders/${id}/status`, { status });
    await fetchOrders();
  };

  return (
    <div className="container-shell py-10">
      <Seo title="Admin Orders" description="Track and update all customer orders." />
      <div className="surface p-6">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order._id} className="rounded-[24px] border border-stone-200 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium">#{order._id.slice(-6).toUpperCase()}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {order.user?.name || "Customer"} • {order.items.length} items • Rs {order.pricing.total.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select className="input w-44" value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-stone-500">{order.payment.status}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;
