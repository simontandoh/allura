import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useCurrency } from "../context/CurrencyContext";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";

function FeaturedProducts() {
  const [featured, setFeatured] = useState([]);
  const { convertPrice, symbol } = useCurrency();
  const { cart, addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // 🏆 Get top 3 by popularity (or createdAt fallback)
        const q = query(collection(db, "products"), orderBy("popularity", "desc"), limit(3));
        const snap = await getDocs(q);
        const products = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          price: Number(String(doc.data().price).replace(/[£,]/g, "")) || 0,
        }));
        setFeatured(products);
      } catch (error) {
        console.error("Error loading featured products:", error);
      }
    };
    fetchFeatured();
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();

    const safeProduct = {
      ...product,
      price: Number(String(product.price).replace(/[£,]/g, "")) || 0,
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

  if (featured.length === 0)
    return (
      <section className="px-6 md:px-20 py-20 bg-burgundy text-gold">
        <h2 className="text-3xl md:text-4xl font-elegant text-center mb-12">
          Featured Products
        </h2>
        <p className="text-center opacity-80">Loading popular items...</p>
      </section>
    );

  const topProductId = featured[0]?.id; // ✅ mark only the #1 product as "Most Popular"

  return (
    <section className="px-6 md:px-20 py-20 bg-burgundy text-gold">
      <h2 className="text-3xl md:text-4xl font-elegant text-center mb-12">
        Featured Products
      </h2>

      <div className="grid md:grid-cols-3 gap-10">
        {featured.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="relative bg-[#3B0010] rounded-xl overflow-hidden shadow-gold hover-glow transition block no-underline"
          >
            {/* ✅ Only the most popular (first in list) gets the badge */}
            {product.id === topProductId && (
              <span className="absolute top-3 left-3 bg-gold text-burgundy text-xs font-bold px-2 py-1 rounded-md shadow-md">
                Most Popular
              </span>
            )}

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-72 object-cover"
            />
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold mb-2">{product.name}</h3>
              <p className="opacity-80 mb-4">
                {symbol}
                {convertPrice(product.price).toFixed(2)}
              </p>
              <button
                onClick={(e) => handleAddToCart(product, e)}
                className="btn-gold hover-glow w-full"
              >
                Add to Cart
              </button>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link to="/shop" className="link-glow text-xl font-semibold">
          View All →
        </Link>
      </div>
    </section>
  );
}

export default FeaturedProducts;
