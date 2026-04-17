import { useContext, useEffect, useMemo, useState } from "react";
// Use plain <a> to avoid Next/link export edge cases in this environment.
import { collection, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase/config";
import { useCurrency } from "../hooks/useCurrency.js";
import { CartContext } from "../context/CartContext.jsx";
import { getStockStatus, inferImageKey, resolveProductImage } from "../utils/productMedia.js";
import { normalizeColorFamily } from "../utils/colorMapping.js";

const DEFAULT_FILTERS = {
  category: "All",
  hairType: "All",
  length: "All",
  colorFamily: "All",
};

const DEFAULT_ATTR = {
  category: "Luxury Wigs",
  hairType: "Straight",
  length: '18"',
  colorFamily: "Midnight",
};

const FALLBACK_OPTIONS = {
  category: ["Luxury Wigs", "Clip-Ins", "Tape-Ins", "Closures"],
  hairType: ["Straight", "Body Wave", "Deep Curl", "Kinky"],
  length: ['14"', '18"', '22"', '26"'],
  colorFamily: ["Midnight", "Copper", "Brown"],
};

const NAME_PATTERNS = [
  { key: "category", match: "clip", value: "Clip-Ins" },
  { key: "category", match: "tape", value: "Tape-Ins" },
  { key: "category", match: "closure", value: "Closures" },
  { key: "hairType", match: "wave", value: "Body Wave" },
  { key: "hairType", match: "curl", value: "Deep Curl" },
  { key: "hairType", match: "kinky", value: "Kinky" },
  { key: "colorFamily", match: "black", value: "Midnight" },
  { key: "colorFamily", match: "onyx", value: "Midnight" },
  { key: "colorFamily", match: "midnight", value: "Midnight" },
  { key: "colorFamily", match: "copper", value: "Copper" },
  { key: "colorFamily", match: "auburn", value: "Copper" },
  { key: "colorFamily", match: "ginger", value: "Copper" },
  { key: "colorFamily", match: "blonde", value: "Copper" },
  { key: "colorFamily", match: "honey", value: "Brown" },
  { key: "colorFamily", match: "brunette", value: "Brown" },
  { key: "colorFamily", match: "brown", value: "Brown" },
  { key: "colorFamily", match: "espresso", value: "Brown" },
];

const LENGTH_REGEX = /(\d{2})["']?/;

function hydrateProduct(doc) {
  const data = doc.data();
  const name = data.name || "Signature Piece";
  const lower = `${name} ${data.collectionName || ""}`.toLowerCase();

  const derived = {
    category: data.category || DEFAULT_ATTR.category,
    hairType: data.hairType || DEFAULT_ATTR.hairType,
    length: data.length || DEFAULT_ATTR.length,
    colorFamily: data.colorFamily || DEFAULT_ATTR.colorFamily,
  };

  if (!data.length) {
    const lengthFromText = lower.match(LENGTH_REGEX);
    if (lengthFromText) {
      derived.length = `${lengthFromText[1]}"`;
    }
  }

  NAME_PATTERNS.forEach(({ key, match, value }) => {
    if (!derived[key] || derived[key] === DEFAULT_ATTR[key]) {
      if (lower.includes(match)) derived[key] = value;
    }
  });

  derived.colorFamily = normalizeColorFamily(derived.colorFamily) || DEFAULT_ATTR.colorFamily;

  const cleanPrice = Number(String(data.price).replace(/[^\d.]/g, "")) || 0;
  const imageKey = data.imageKey || inferImageKey({ ...data, name, colorFamily: derived.colorFamily });

  const product = {
    ...data,
    id: doc.id,
    name,
    price: cleanPrice,
    imageKey,
    ...derived,
  };

  const image = resolveProductImage(product);

  return {
    ...product,
    image,
    images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [image],
  };
}

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { convertPrice, symbol } = useCurrency();
  const { cart, addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const fetched = snap.docs
          .map((doc) => hydrateProduct(doc))
          .sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0));
        setProducts(fetched);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const optionSets = useMemo(() => {
    const categories = new Set(FALLBACK_OPTIONS.category);
    const hairTypes = new Set(FALLBACK_OPTIONS.hairType);
    const lengths = new Set(FALLBACK_OPTIONS.length);
    const colors = new Set(FALLBACK_OPTIONS.colorFamily);

    products.forEach((p) => {
      if (p.category) categories.add(p.category);
      if (p.hairType) hairTypes.add(p.hairType);
      if (p.length) lengths.add(p.length);
      if (p.colorFamily) colors.add(p.colorFamily);
    });

    return {
      category: ["All", ...Array.from(categories)],
      hairType: ["All", ...Array.from(hairTypes)],
      length: ["All", ...Array.from(lengths)],
      colorFamily: ["All", ...Array.from(colors)],
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.category !== "All" && product.category !== filters.category) return false;
      if (filters.hairType !== "All" && product.hairType !== filters.hairType) return false;
      if (filters.length !== "All" && product.length !== filters.length) return false;
      if (filters.colorFamily !== "All" && product.colorFamily !== filters.colorFamily)
        return false;
      return true;
    });
  }, [products, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    const stockStatus = getStockStatus(product.stock);
    if (stockStatus === "Out of stock") {
      toast.error("This product is currently out of stock.");
      return;
    }

    const safeProduct = {
      ...product,
      price: product.price,
      quantity: 1,
    };

    const existing = cart.find((item) => item.id === product.id);
    addToCart(safeProduct);

    if (existing) {
      toast.success(`Added 1 more ${product.name} (x${existing.quantity + 1} in cart)`);
    } else {
      toast.success(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="pt-28 pb-16 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <div className="flex flex-col gap-6 mb-10">
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.6em] text-gold/60">Boutique Shop</p>
          <h1 className="text-5xl font-elegant">Our Signature Collection</h1>
          <p className="text-gold/70 max-w-2xl mx-auto">
            Curated artistry that keeps the top three most-loved looks of the season within reach.
          </p>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 min-w-max">
            {optionSets.category.map((option) => (
              <button
                key={option}
                onClick={() => handleFilterChange("category", option)}
                className={`px-5 py-2 rounded-full border text-xs uppercase tracking-[0.4em] transition ${
                  filters.category === option
                    ? "bg-gold text-burgundy border-gold"
                    : "border-gold/30 text-gold/70 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 bg-burgundy border border-gold/15 rounded-2xl p-4">
          {["hairType", "length", "colorFamily"].map((key) => (
            <div key={key} className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-[0.4em] text-gold/60">
                {key === "hairType"
                  ? "Texture"
                  : key === "colorFamily"
                  ? "Palette"
                  : "Length"}
              </label>
              <select
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className="select-gold bg-burgundy/70 border border-gold/30"
              >
                {optionSets[key].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="mt-6 md:mt-0 btn-outline-gold text-sm"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center opacity-70">Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center opacity-70">No products match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 auto-rows-fr">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            const isOutOfStock = stockStatus === "Out of stock";
            const isLowStock = stockStatus === "Low stock";
            const metaLine = [product.hairType, product.length, product.colorFamily]
              .filter(Boolean)
              .join(" • ");

            return (
              <a
                key={product.id}
                href={`/product/${product.id}`}
                className="group relative flex flex-col h-full bg-burgundy rounded-[34px] overflow-hidden shadow-gold hover:-translate-y-1.5 hover:shadow-[0_0_35px_rgba(255,215,122,0.3)] transition duration-500 no-underline"
              >
                <div className="relative overflow-hidden">
                  <span
                    className={`absolute top-4 left-4 text-[10px] sm:text-xs uppercase tracking-[0.4em] px-3 py-1 rounded-full ${
                      isOutOfStock
                        ? "bg-red-500/90 text-white"
                        : isLowStock
                        ? "bg-amber-300/80 text-burgundy"
                        : "bg-black/60 text-white"
                    }`}
                  >
                    {stockStatus}
                  </span>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-[340px] md:h-[420px] lg:h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-burgundy/60 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="p-7 text-center flex flex-col flex-1 gap-3">
                  {metaLine && (
                    <p className="text-[11px] uppercase tracking-[0.5em] text-gold/50">{metaLine}</p>
                  )}
                  <h2 className="text-2xl font-semibold">{product.name}</h2>
                  <p className="text-xl opacity-90">
                    {symbol}
                    {convertPrice(product.price).toFixed(2)}
                  </p>
                  <div className="pt-2 mt-auto">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`btn-gold hover-glow w-full ${
                        isOutOfStock ? "opacity-60 pointer-events-none" : ""
                      }`}
                      disabled={isOutOfStock}
                    >
                      {isOutOfStock ? "Out of stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Shop;
