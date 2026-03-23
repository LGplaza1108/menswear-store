import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Seo from "../components/ui/Seo";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await login(form);
      navigate(data.role === "admin" ? "/admin" : location.state?.from || "/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container-shell py-16">
      <Seo title="Login" description="Login to continue to checkout, manage orders, and save wishlist items." />
      <div className="mx-auto max-w-md surface p-8">
        <h1 className="text-3xl font-semibold">Login</h1>
        <p className="mt-3 text-sm text-stone-500">Use the demo admin account or create a customer account.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm text-stone-500">
          <Link to="/forgot-password">Forgot password</Link>
          <Link to="/register">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
