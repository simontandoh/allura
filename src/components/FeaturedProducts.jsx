import { useEffect, useState, useContext, useRef } from "react";
// Use plain <a> to avoid Next/link export edge cases in this environment.
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase/config";
import { useCurrency } from "../hooks/useCurrency.js";
import { CartContext } from "../context/CartContext.jsx";
import { getStockStatus, resolveProductImage } from "../utils/productMedia.js";
import { PRESET_PRODUCT_IMAGES } from "../constants/productImages.js";

const PLACEHOLDER_PRODUCTS = PRESET_PRODUCT_IMAGES.map((media, index) => ({
  id: `placeholder-${media.id}`,
  name: media.label,
  image: media.url,
  images: [media.url],
  price: 450 + index * 35,
  stock: 6,
  hairType: index === 1 ? "Body Wave" : index === 2 ? "Deep Curl" : "Straight",
  length: index === 0 ? '18"' : index === 1 ? '22"' : '26"',
  colorFamily: index === 0 ? "Midnight" : index === 1 ? "Copper" : "Brown",
}));

function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const titleRef = useRef(null);
  const { convertPrice, symbol } = useCurrency();
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("popularity", "desc"), limit(3));
        const snap = await getDocs(q);
        const products = snap.docs.map((doc) => {
          const data = doc.data();
          const base = {
            id: doc.id,
            ...data,
            price: Number(String(data.price).replace(/[^\d.]/g, "")) || 0,
          };
          const image = resolveProductImage(base);
          return {
            ...base,
            image,
            images: data.images?.length ? data.images : [image],
          };
        });
        setFeatured(products);
      } catch (error) {
        console.error("Error loading featured products:", error);
      }
    };
    fetchFeatured();
  }, []);

  const displayProducts = featured.length ? featured : PLACEHOLDER_PRODUCTS;
  const usingPlaceholders = featured.length === 0;

  useEffect(() => {
    const target = titleRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    const stockStatus = getStockStatus(product.stock);
    if (stockStatus === "Out of stock") {
      toast.error("This product is currently out of stock.");
      return;
    }
    addToCart({
      ...product,
      price: product.price,
      image: product.image,
      images: product.images,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <section className="relative z-20 -mt-8 md:-mt-20 text-gold pb-12">
      <div className="max-w-4xl mx-auto px-6 md:px-20">
        <div
          ref={titleRef}
          className={`pt-12 pb-4 transition-all duration-700 ease-out ${
            revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="flex items-center gap-6">
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            <div className="px-8 py-4 rounded-full border border-gold/30 bg-burgundy/90 text-center shadow-[0_0_25px_rgba(75,0,19,0.6)]">
              <p className="text-[11px] uppercase tracking-[0.6em] text-gold/70 mb-2">
                Signature capsules
              </p>
              <h2 className="text-3xl md:text-4xl font-elegant text-burgundySecondary">
                Featured Products
              </h2>
            </div>
            <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          </div>
          {usingPlaceholders && (
            <p className="text-xs uppercase tracking-[0.4em] text-gold/50 mt-6 text-center">
              Preview imagery while live data loads
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-0 mt-0">
        {displayProducts.map((product, index) => {
          const stockStatus = getStockStatus(product.stock);
          const isOut = stockStatus === "Out of stock";
          const metaLine = [product.hairType, product.length, product.colorFamily]
            .filter(Boolean)
            .join(" â€¢ ");

          return (
            <a
              key={product.id}
              href={usingPlaceholders ? "#" : `/product/${product.id}`}
              className={`group relative block min-h-[420px] md:min-h-[520px] overflow-hidden rounded-[32px] border border-gold/10 bg-[#3B0010] ${
                usingPlaceholders ? "pointer-events-none" : ""
              }`}
            >
              <div className="absolute inset-0 bg-[#3B0010]/90" />
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy via-burgundy/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

              <div className="absolute top-4 left-4 flex flex-col gap-2 text-[10px] tracking-[0.4em] uppercase">
                {index === 0 && !usingPlaceholders && (
                  <span className="px-3 py-1 rounded-full bg-gold text-burgundy">
                    Most Popular
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full ${
                    isOut
                      ? "bg-red-500/90 text-white"
                      : stockStatus === "Low stock"
                      ? "bg-amber-300/90 text-burgundy"
                      : "bg-black/70 text-white"
                  }`}
                >
                  {stockStatus}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-xs uppercase tracking-[0.5em] text-gold/70 mb-2">
                  {metaLine || product.category || "Collection"}
                </p>
                <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
                <p className="text-lg font-light mb-4">
                  {symbol}
                  {convertPrice(product.price).toFixed(2)}
                </p>
                {usingPlaceholders ? (
                  <span className="uppercase tracking-[0.4em] text-[11px] text-gold/50">
                    Coming soon
                  </span>
                ) : (
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className={`uppercase tracking-[0.4em] text-[11px] ${
                      isOut ? "text-gold/40 pointer-events-none" : "text-gold hover:text-white"
                    }`}
                  >
                    {isOut ? "Unavailable" : "Add to cart"}
                  </button>
                )}
              </div>
            </a>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <a
          href="/shop"
          className="inline-flex items-center gap-3 px-10 py-3 rounded-full border border-gold/60 uppercase tracking-[0.4em] text-[11px] font-semibold text-gold hover:bg-gold hover:text-burgundy transition hover:shadow-[0_0_25px_rgba(255,215,122,0.35)]"
        >
          Explore the Collection
          <span className="text-xl leading-none">&gt;</span>
        </a>
      </div>
    </section>
  );
}

export default FeaturedProducts;
