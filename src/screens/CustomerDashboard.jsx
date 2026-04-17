import { useState, useEffect } from "react";
// Use plain <a> to avoid Next/link export edge cases in this environment.
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth.js";
import { FaUser, FaBox, FaSignOutAlt, FaBars } from "react-icons/fa";

const NAV_ITEMS = [
  { to: "/dashboard/profile", icon: FaUser, label: "Profile" },
  { to: "/dashboard/orders", icon: FaBox, label: "Orders" },
];

function CustomerDashboard({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/dashboard") {
      router.replace("/dashboard/profile");
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const NavLink = ({ to, icon: Icon, label }) => (
    <a
      href={to}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-transparent hover:border-gold/30 transition"
      onClick={() => setMenuOpen(false)}
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#4B0013]/70">
        <Icon className="text-gold text-lg" />
      </span>
      <span className="text-sm uppercase tracking-[0.35em]">{label}</span>
    </a>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3b0010] via-[#1c0008] to-[#0c0004] text-gold pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#3B0010]/90 border border-gold/15 rounded-3xl p-6 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-gold/60">Client Suite</p>
            <h2 className="text-3xl font-elegant leading-tight mt-1">My Account</h2>
          </div>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gold/30 hover:bg-[#4B0013]/60 transition text-left"
          >
            <FaSignOutAlt className="text-gold" />
            <span className="text-sm uppercase tracking-[0.35em]">Logout</span>
          </button>
        </aside>

        {/* Mobile navigation */}
        <div className="lg:hidden w-full bg-[#3B0010]/90 border border-gold/15 rounded-3xl p-5 shadow-[0_15px_45px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-gold/60">Client Suite</p>
              <h2 className="text-2xl font-elegant">My Account</h2>
            </div>
            <button
              aria-label="Toggle dashboard menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-11 h-11 rounded-2xl border border-gold/30 flex items-center justify-center"
            >
              <FaBars className="text-gold text-xl" />
            </button>
          </div>
          {menuOpen && (
            <div className="mt-6 space-y-4">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} {...item} />
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gold/30 hover:bg-[#4B0013]/60 transition"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <section className="flex-1 bg-[#24000B]/80 border border-gold/15 rounded-[32px] p-6 md:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="pb-6 border-b border-gold/10 mb-6">
            <p className="text-xs uppercase tracking-[0.6em] text-gold/50">Customer dashboard</p>
            <h1 className="text-3xl md:text-4xl font-elegant leading-tight mt-2 break-words">
              Welcome back, {user?.displayName || user?.email || "Guest"}
            </h1>
            <p className="text-gold/70 mt-2 text-sm">
              Manage your profile details, addresses, and follow every order from dispatch to
              delivery.
            </p>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}

export default CustomerDashboard;
