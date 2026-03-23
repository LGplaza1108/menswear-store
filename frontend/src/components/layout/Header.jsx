import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useShop } from "../../context/ShopContext";

const navItems = [
  { label: "Shop", to: "/shop" },
  { label: "New Arrivals", to: "/shop?tag=newArrival" },
  { label: "Best Sellers", to: "/shop?tag=bestSeller" }
];

const linkClass = ({ isActive }) =>
  `text-sm transition ${isActive ? "text-ink" : "text-stone-500 hover:text-ink"}`;

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cart, filters, updateFilters } = useShop();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSearch = async (event) => {
    const value = event.target.value;
    await updateFilters({ search: value });
    navigate("/shop");
  };

  const MobileNav = (
    <div className="space-y-5 border-t border-stone-200 pt-5 md:hidden">
      <div className="space-y-3">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.to} onClick={() => setOpen(false)} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </div>
      <div className="flex gap-3">
        <Link to="/wishlist" className="btn-secondary flex-1" onClick={() => setOpen(false)}>
          Wishlist
        </Link>
        <Link to="/cart" className="btn-primary flex-1" onClick={() => setOpen(false)}>
          Cart ({cart.length})
        </Link>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/90 backdrop-blur">
      <div className="container-shell">
        <div className="flex items-center gap-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-[0.2em] text-ink uppercase">
            Menswear
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.label} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden max-w-sm flex-1 md:block">
            <input className="input" placeholder="Search shirts, jeans, polos..." onChange={handleSearch} />
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/wishlist" className="rounded-full border border-stone-200 p-3">
              <Heart size={18} />
            </Link>
            <Link to="/cart" className="rounded-full border border-stone-200 p-3">
              <ShoppingBag size={18} />
            </Link>
            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : "/profile"} className="rounded-full border border-stone-200 p-3">
                  <User size={18} />
                </Link>
                <button type="button" onClick={logout} className="text-sm text-stone-500 hover:text-ink">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}
          </div>

          <button type="button" className="rounded-full border border-stone-200 p-3 md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {open && MobileNav}
      </div>
    </header>
  );
};

export default Header;
