import { useState } from "react";
import client from "../api/client";
import Seo from "../components/ui/Seo";
import { useAuth } from "../context/AuthContext";

const emptyAddress = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false
};

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "", password: "" });
  const [address, setAddress] = useState(emptyAddress);

  const saveProfile = async (event) => {
    event.preventDefault();
    await client.put("/users/profile", profile);
    await refreshUser();
  };

  const addAddress = async (event) => {
    event.preventDefault();
    await client.post("/users/addresses", address);
    setAddress(emptyAddress);
    await refreshUser();
  };

  const deleteAddress = async (id) => {
    await client.delete(`/users/addresses/${id}`);
    await refreshUser();
  };

  return (
    <div className="container-shell py-10">
      <Seo title="Profile" description="Manage your account details and delivery addresses." />
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="surface p-6">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <form onSubmit={saveProfile} className="mt-6 space-y-4">
            <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
            <input className="input" value={user?.email || ""} disabled placeholder="Email" />
            <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" />
            <input className="input" type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} placeholder="New password (optional)" />
            <button type="submit" className="btn-primary">
              Save profile
            </button>
          </form>
        </section>

        <section className="surface p-6">
          <h2 className="text-2xl font-semibold">Addresses</h2>
          <div className="mt-6 space-y-4">
            {user?.addresses?.map((item) => (
              <div key={item._id} className="rounded-2xl border border-stone-200 p-4">
                <p className="font-medium">
                  {item.fullName} {item.isDefault && <span className="text-xs text-stone-500">(Default)</span>}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {item.line1}, {item.city}, {item.state}, {item.postalCode}
                </p>
                <button type="button" onClick={() => deleteAddress(item._id)} className="mt-3 text-sm text-stone-500 hover:text-ink">
                  Delete
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addAddress} className="mt-8 grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="Label" value={address.label} onChange={(e) => setAddress({ ...address, label: e.target.value })} />
            <input className="input" placeholder="Full name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
            <input className="input" placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
            <input className="input" placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
            <input className="input" placeholder="Address line 2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
            <input className="input" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input className="input" placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            <input className="input" placeholder="Postal code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-stone-500 md:col-span-2">
              <input type="checkbox" checked={address.isDefault} onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })} />
              Set as default
            </label>
            <button type="submit" className="btn-secondary md:col-span-2">
              Add address
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
