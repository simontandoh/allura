// Use plain <a> to avoid Next/link export edge cases in this environment.
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { useCart } from "../hooks/useCart.js";
import { useCurrency } from "../hooks/useCurrency.js";
import toast from "react-hot-toast";
import { resolveProductImage, getStockStatus } from "../utils/productMedia.js";
import { normalizeColorFamily } from "../utils/colorMapping.js";

const shapeProductData = (id, data = {}) => {
  const cleanPrice = Number(String(data.price).replace(/[^\d.]/g, "")) || 0;
  const colorFamily = normalizeColorFamily(data.colorFamily);
  const base = { id, ...data, price: cleanPrice, colorFamily };
  const image = resolveProductImage(base);
  return {
    ...base,
    image,
    images: Array.isArray(data.images) && data.images.length ? data.images : [image],
  };
};

function ProductDetail({ id }) {
  const { addToCart } = useCart();
  const { convertPrice, symbol } = useCurrency();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProduct(shapeProductData(snap.id, snap.data()));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const loadRelated = async () => {
      setLoadingRelated(true);
      try {
        const relatedItems = [];
        const seen = new Set([product.id]);
        const baseCollection = collection(db, "products");

        const pushUnique = (docs) => {
          docs.forEach((docSnap) => {
            if (seen.has(docSnap.id)) return;
            seen.add(docSnap.id);
            relatedItems.push(shapeProductData(docSnap.id, docSnap.data()));
          });
        };

        const queryDefs = [
          product.category && query(baseCollection, where("category", "==", product.category), limit(6)),
          product.hairType && query(baseCollection, where("hairType", "==", product.hairType), limit(6)),
          product.colorFamily && query(baseCollection, where("colorFamily", "==", product.colorFamily), limit(6)),
        ].filter(Boolean);

        for (const qRef of queryDefs) {
          const snap = await getDocs(qRef);
          pushUnique(snap.docs);
          if (relatedItems.length >= 4) break;
        }

        if (!relatedItems.length) {
          const fallbackSnap = await getDocs(query(baseCollection, orderBy("popularity", "desc"), limit(6)));
          pushUnique(fallbackSnap.docs);
        }

        setRelated(relatedItems.slice(0, 3));
      } catch (error) {
        console.error("Error loading related products:", error);
      } finally {
        setLoadingRelated(false);
      }
    };
    loadRelated();
  }, [product]);

  if (loading) return <div className="pt-28 pb-16 text-center text-gold">Loading...</div>;
  if (!product)
    return <div className="pt-28 pb-16 text-center text-gold">Product not found.</div>;

  const stockStatus = getStockStatus(product.stock);
  const isOutOfStock = stockStatus === "Out of stock";
  const imageSrc = resolveProductImage(product);
  const metaLine = [product.category, product.hairType, product.length]
    .filter(Boolean)
    .join(" â€¢ ");
  const paletteLine = [product.colorFamily, product.collectionName]
    .filter(Boolean)
    .join(" â€¢ ");

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }
    addToCart({
      ...product,
      image: imageSrc,
      images: product?.images?.length ? product.images : [imageSrc],
      price: Number(String(product.price).replace(/[^\d.]/g, "")) || 0,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleAddRelated = (item, e) => {
    e.preventDefault();
    addToCart({
      ...item,
      image: item.image,
      images: item.images,
      price: item.price,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="pt-28 pb-20 px-6 md:px-12 bg-burgundy text-gold min-h-screen">
      <div className="max-w-6xl xl:max-w-7xl mx-auto grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
        <div className="relative bg-[#310012] rounded-[36px] p-4 md:p-6 border border-gold/15 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full rounded-[28px] object-cover aspect-[3/4] md:aspect-[5/7] lg:h-[640px] lg:object-cover"
          />
          <div className="absolute top-6 left-8 flex flex-col gap-3 text-[11px] uppercase tracking-[0.4em]">
            <span
              className={`px-4 py-1 rounded-full ${
                isOutOfStock
                  ? "bg-red-500/90 text-white"
                  : stockStatus === "Low stock"
                  ? "bg-amber-400/90 text-burgundy"
                  : "bg-black/60 text-white"
              }`}
            >
              {stockStatus}
            </span>
            {product.length && (
              <span className="px-4 py-1 rounded-full bg-burgundy/80 border border-gold/30">
                {product.length}
              </span>
            )}
          </div>
          <div className="absolute bottom-6 left-8 right-8 flex flex-wrap items-center gap-3">
            {product.colorFamily && (
              <span className="px-4 py-2 rounded-full bg-black/60 text-[10px] uppercase tracking-[0.4em]">
                {product.colorFamily}
              </span>
            )}
            {product.collectionName && (
              <span className="px-4 py-2 rounded-full border border-gold/40 text-[10px] uppercase tracking-[0.4em]">
                {product.collectionName}
              </span>
            )}
          </div>
        </div>
        <div className="bg-[#24000B]/80 rounded-[36px] border border-gold/10 p-7 md:p-10 space-y-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.8em] text-gold/50 mb-3">Signature unit</p>
            <h1 className="text-4xl md:text-5xl font-elegant leading-tight">{product.name}</h1>
            <p className="text-3xl md:text-4xl font-light mt-4">
              {symbol}
              {convertPrice(product.price).toFixed(2)}
            </p>
          </div>
          {metaLine && (
            <p className="text-[11px] uppercase tracking-[0.6em] text-gold/60">{metaLine}</p>
          )}
          {paletteLine && (
            <p className="text-[11px] uppercase tracking-[0.6em] text-gold/40">{paletteLine}</p>
          )}

          <p className="text-gold/90 leading-relaxed">{product.description}</p>

          <div className="grid grid-cols-2 gap-4 text-xs uppercase tracking-[0.4em] text-gold/60">
            <div className="rounded-2xl border border-gold/15 p-4">
              <p className="text-[10px] mb-3">Texture</p>
              <p className="text-gold text-sm tracking-[0.2em]">{product.hairType || "â€”"}</p>
            </div>
            <div className="rounded-2xl border border-gold/15 p-4">
              <p className="text-[10px] mb-3">Length</p>
              <p className="text-gold text-sm tracking-[0.2em]">{product.length || "â€”"}</p>
            </div>
            <div className="rounded-2xl border border-gold/15 p-4">
              <p className="text-[10px] mb-3">Color</p>
              <p className="text-gold text-sm tracking-[0.2em]">{product.colorFamily || "â€”"}</p>
            </div>
            <div className="rounded-2xl border border-gold/15 p-4">
              <p className="text-[10px] mb-3">Availability</p>
              <p className="text-gold text-sm tracking-[0.2em]">{stockStatus}</p>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`btn-gold hover-glow w-full py-4 text-lg ${
              isOutOfStock ? "opacity-60 pointer-events-none" : ""
            }`}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of stock" : "Add to Cart"}
          </button>

          <div className="text-sm text-gold/60 flex items-center justify-between pt-2">
            <span>Ships within 2-4 business days</span>
            <span>{product.collectionName || "Allurahouse Original"}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <a href="/shop" className="btn-outline-gold hover-glow">
          &lt; Back to Shop
        </a>
      </div>

      <section className="mt-20 max-w-6xl xl:max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-gold/60">Similar items</p>
            <h2 className="text-3xl font-elegant">Complete the look</h2>
            <p className="text-gold/70 text-sm max-w-xl">
              Curated pieces that share the same palette or texture. Rotate them into your cart for a full capsule wardrobe.
            </p>
          </div>
          <a href="/shop" className="btn-outline-gold text-sm self-start md:self-auto">
            Explore Shop
          </a>
        </div>

        {loadingRelated ? (
          <p className="text-gold/60">Loading curated matches...</p>
        ) : related.length === 0 ? (
          <p className="text-gold/60">Fresh drops coming soon.</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => {
              const relatedStock = getStockStatus(item.stock);
              const meta = [item.hairType, item.length, item.colorFamily].filter(Boolean).join(" â€¢ ");
              const out = relatedStock === "Out of stock";
              return (
                <a
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group relative bg-[#3B0010] border border-gold/10 rounded-[30px] overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.45)] no-underline"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span
                      className={`absolute top-4 left-4 text-[10px] uppercase tracking-[0.4em] px-3 py-1 rounded-full ${
                        out
                          ? "bg-red-500/90 text-white"
                          : relatedStock === "Low stock"
                          ? "bg-amber-300/80 text-burgundy"
                          : "bg-black/60 text-white"
                      }`}
                    >
                      {relatedStock}
                    </span>
                  </div>
                  <div className="p-6 space-y-3 text-center">
                    <h3 className="text-2xl font-semibold">{item.name}</h3>
                    <p className="text-lg">
                      {symbol}
                      {convertPrice(item.price).toFixed(2)}
                    </p>
                    {meta && (
                      <p className="text-[11px] uppercase tracking-[0.4em] text-gold/50">{meta}</p>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleAddRelated(item, e)}
                      className={`btn-gold w-full ${
                        out ? "opacity-50 pointer-events-none" : "hover-glow"
                      }`}
                      disabled={out}
                    >
                      {out ? "Unavailable" : "Add to Cart"}
                    </button>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ProductDetail;
