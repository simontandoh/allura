import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth.js";
import { FaBox, FaShoppingBag, FaPlusCircle, FaSignOutAlt } from "react-icons/fa";

const shortcuts = [
  { icon: FaShoppingBag, label: "Order Board", description: "Review payments & fulfilment", to: "/admin/orders" },
  { icon: FaBox, label: "Product Library", description: "Edit pricing & imagery", to: "/admin/products" },
  { icon: FaPlusCircle, label: "Add Capsule", description: "Launch a new SKU", to: "/admin/add" },
];

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen pt-28 pb-12 px-6 md:px-12 bg-gradient-to-b from-[#2d0010] via-[#170007] to-[#050002] text-gold">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="bg-[#3B0010]/70 border border-gold/15 rounded-[32px] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
          <p className="text-xs uppercase tracking-[0.6em] text-gold/60">Studio control</p>
          <h1 className="text-4xl font-elegant mt-2">Admin Dashboard</h1>
          <p className="text-gold/70 mt-3">
            Welcome back, {user?.email}. Your latest orders and catalogue controls are a tap away.
          </p>
        </header>

        <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {shortcuts.map(({ icon: Icon, label, description, to }) => (
            <button
              key={label}
              onClick={() => router.push(to)}
              className="bg-[#3B0010]/80 border border-gold/15 rounded-[28px] p-6 text-left hover-glow transition"
            >
              <span className="w-12 h-12 rounded-2xl bg-[#4B0013] flex items-center justify-center mb-5">
                <Icon className="text-2xl" />
              </span>
              <h3 className="text-xl font-semibold">{label}</h3>
              <p className="text-sm text-gold/70 mt-2">{description}</p>
            </button>
          ))}
        </section>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-[#3B0010]/70 border border-gold/10 rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.5em] text-gold/60">Fulfilment tips</p>
            <ul className="mt-4 space-y-2 text-sm text-gold/70">
              <li>â€¢ Move completed orders to â€œPastâ€ from the Orders board for clean reporting.</li>
              <li>â€¢ Update stock immediately after processing returns to keep the shop accurate.</li>
              <li>â€¢ Add editorial notes in product descriptions for seasonal edits.</li>
            </ul>
          </div>
          <div className="w-full md:w-64 bg-[#3B0010]/70 border border-gold/10 rounded-3xl p-6 text-center space-y-4">
            <p className="text-xs uppercase tracking-[0.5em] text-gold/60">Account</p>
            <button
              onClick={handleLogout}
              className="btn-outline-gold w-full flex items-center justify-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </button>
            <p className="text-sm text-gold/70">Secure hand-off? Log out before leaving the studio.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



