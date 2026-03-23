import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import client from "../../api/client";
import Seo from "../../components/ui/Seo";

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    client.get("/admin/dashboard").then(({ data }) => setDashboard(data));
  }, []);

  return (
    <div className="container-shell py-10">
      <Seo title="Admin Dashboard" description="Admin overview for products, orders, and revenue." />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Store dashboard</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products" className="btn-secondary">
            Manage products
          </Link>
          <Link to="/admin/orders" className="btn-primary">
            Manage orders
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {dashboard &&
          Object.entries(dashboard.metrics).map(([label, value]) => (
            <div key={label} className="surface p-6">
              <p className="text-sm capitalize text-stone-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{label === "revenue" ? `Rs ${value.toFixed(2)}` : value}</p>
            </div>
          ))}
      </div>

      <div className="surface mt-8 p-6">
        <h2 className="text-xl font-semibold">Recent orders</h2>
        <div className="mt-6 space-y-3">
          {dashboard?.recentOrders?.map((order) => (
            <div key={order._id} className="flex flex-col gap-2 rounded-2xl border border-stone-200 p-4 md:flex-row md:items-center md:justify-between">
              <p>#{order._id.slice(-6).toUpperCase()}</p>
              <p className="text-sm text-stone-500">{order.status}</p>
              <p className="font-medium">Rs {order.pricing.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
