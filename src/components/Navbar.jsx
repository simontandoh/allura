import { useContext, useEffect, useMemo, useRef, useState } from "react";
// Use plain <a> to avoid Next/link export edge cases in this environment.
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FaBars, FaShoppingBag, FaTimes, FaUser } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { CartContext } from "../context/CartContext.jsx";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth.js";
import { normalizeColorFamily } from "../utils/colorMapping.js";
import { resolveProductImage } from "../utils/productMedia.js";
import CartDrawer from "./CartDrawer";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "FAQs", to: "/faqs" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Returns Policy", to: "/returns" },
];

function Navbar() {
  const { cart } = useContext(CartContext);
  const { user, role, logout } = useAuth();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productIndex, setProductIndex] = useState([]);
  const [overHero, setOverHero] = useState(true);
  const [showBrand, setShowBrand] = useState(true);
  const [atTop, setAtTop] = useState(true);

  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const controlClass =
    "flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.5em] uppercase hover:text-white transition";
  const iconClass = "text-xl leading-none";
  const iconButton =
    "w-9 h-9 flex items-center justify-center rounded-full border border-gold/40 hover:bg-gold hover:text-burgundy transition relative";

  useEffect(() => {
    const updateState = () => {
      const heroThreshold = Math.max(window.innerHeight - 120, 120);
      const scrollY = window.scrollY;
      setAtTop(scrollY < 6);
      const over = scrollY < heroThreshold;
      setOverHero(over);
      const hideDuringHero = over && scrollY > heroThreshold * 0.4;
      setShowBrand(!hideDuringHero);
    };
    updateState();
    window.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      window.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        !event.target.closest(".profile-toggle")
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map((doc) => {
        const data = doc.data();
        const base = { id: doc.id, ...data };
        const colorFamily = normalizeColorFamily(base.colorFamily);
        const normalized = { ...base, colorFamily };
        const imagePreview = resolveProductImage(normalized);
        const priceValue = Number(String(data.price).replace(/[^\d.]/g, "")) || 0;
        return { ...normalized, imagePreview, price: priceValue };
      });
      setProductIndex(list);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      setSearchTerm("");
    }
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const filteredResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    return productIndex
      .filter((product) => {
        const fields = [
          product.name,
          product.description,
          product.category,
          product.hairType,
          product.colorFamily,
          product.collectionName,
        ]
          .filter(Boolean)
          .map((field) => String(field).toLowerCase());
        return fields.some((field) => field.includes(term));
      })
      .slice(0, 8);
  }, [searchTerm, productIndex]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleSelectProduct = (id) => {
    setSearchOpen(false);
    setSearchTerm("");
    router.push(`/product/${id}`);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          atTop
            ? "bg-transparent"
            : overHero
            ? "bg-burgundy/30 backdrop-blur-sm"
            : "bg-burgundy/95 backdrop-blur"
        }`}
      >
        {overHero && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-burgundy/80 via-burgundy/30 to-transparent" />
        )}
        <div className="relative px-6 py-4 md:px-12 text-gold">
          <div className="flex items-center justify-between">
            {/* LEFT :: Menu + Search */}
            <div className="flex items-center gap-8">
              <button
                className={controlClass}
                aria-label="Open navigation menu"
                onClick={() => setMenuOpen(true)}
              >
                <FaBars className={iconClass} />
                <span className="hidden sm:inline">MENU</span>
              </button>

              <button
                className={controlClass}
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <FiSearch className={iconClass} />
                <span className="hidden sm:inline">SEARCH</span>
              </button>
            </div>

            {/* CENTER :: Brand */}
            <a
              href="/"
              className={`text-lg sm:text-3xl lg:text-4xl font-elegant tracking-[0.35em] sm:tracking-[0.55em] transition-opacity duration-500 ${
                showBrand ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              ALLURA
            </a>

            {/* RIGHT :: Icon cluster */}
            <div className="flex items-center gap-4 text-xl">
              <div ref={profileRef} className="relative">
                <button
                  className={`profile-toggle ${iconButton}`}
                  aria-label="Account"
                  onClick={() => setProfileOpen((prev) => !prev)}
                >
                  <FaUser className="text-lg" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-3 bg-[#24000B] border border-gold/20 rounded-xl w-52 p-3 shadow-xl z-40">
                    {user ? (
                      <>
                        <button
                          onClick={() =>
                            router.push(
                              role === "admin" ? "/admin/dashboard" : "/dashboard/profile"
                            )
                          }
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#4B0013]"
                        >
                          {role === "admin" ? "Admin Panel" : "Dashboard"}
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#4B0013]"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => router.push("/login")}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#4B0013]"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => router.push("/register")}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#4B0013]"
                        >
                          Register
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                className={`${iconButton}`}
                aria-label="Open cart"
                onClick={() => setCartOpen(true)}
              >
                <FaShoppingBag className="text-lg" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-burgundy text-[10px] font-bold rounded-full px-1">
                    {totalItems}
                  </span>
                )}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* Slide-out menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 z-50 h-full max-w-full p-6 border-r shadow-2xl w-72 bg-burgundy border-gold/20">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg tracking-[0.4em]">MENU</span>
              <button
                className="text-2xl text-gold"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <nav className="flex flex-col text-sm">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between uppercase tracking-[0.35em] text-gold/75 hover:text-white border-b border-gold/15 py-3"
                >
                  {link.label}
                  <span className="text-xs opacity-60">&gt;</span>
                </a>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#2a0010]/95 flex items-start justify-center pt-28 px-4">
          <div className="w-full max-w-3xl p-8 border shadow-2xl bg-burgundy border-gold/30 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <FiSearch className="text-xl text-gold" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search the catalogue..."
                className="flex-1 text-xl bg-transparent border-none outline-none text-gold placeholder:text-gold/40"
              />
              <button
                aria-label="Close search"
                className="text-2xl text-gold"
                onClick={() => setSearchOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="pr-2 space-y-3 overflow-y-auto max-h-80">
              {!searchTerm && (
                <p className="text-gold/60 text-sm uppercase tracking-[0.4em] text-center">
                  Start typing to search
                </p>
              )}
              {searchTerm && filteredResults.length === 0 && (
                <p className="text-gold/60">No products match â€œ{searchTerm}â€.</p>
              )}

              {filteredResults.map((product) => {
                const metaLine = [product.hairType, product.length, product.colorFamily]
                  .filter(Boolean)
                  .join(" â€¢ ");
                return (
                  <button
                    key={product.id}
                    className="flex items-center w-full gap-3 px-4 py-3 text-left transition bg-burgundy/40 hover:bg-burgundy/70 rounded-xl"
                    onClick={() => handleSelectProduct(product.id)}
                  >
                    <img
                      src={product.imagePreview || product.image || product.images?.[0] || ""}
                      alt={product.name}
                      className="object-cover w-12 h-12 border rounded-lg border-gold/15"
                    />
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-gold/60">
                        {product.category || "Catalogue"}
                      </p>
                      {metaLine && (
                        <p className="text-[11px] uppercase tracking-[0.35em] text-gold/40">
                          {metaLine}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Navbar;

