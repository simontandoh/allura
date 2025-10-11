import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { useCurrency } from "../context/CurrencyContext";
import { CartContext } from "../context/CartContext";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { convertPrice, symbol } = useCurrency();
  const { cart, addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const fetched = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          price: Number(String(d.data().price).replace(/[£,]/g, "")) || 0,
        }));
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

  return (
    <div className="py-20 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <h1 className="text-5xl font-elegant text-center mb-12">
        Our Signature Collection
      </h1>

      {loading ? (
        <p className="text-center opacity-70">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-center opacity-70">No products yet...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              className="bg-[#3B0010] rounded-xl overflow-hidden shadow-gold hover-glow transition block no-underline"
            >
              <img src={p.image} alt={p.name} className="w-full h-72 object-cover" />
              <div className="p-6 text-center">
                <h2 className="text-2xl font-semibold mb-2">{p.name}</h2>
                <p className="opacity-80 mb-4">
                  {symbol}
                  {convertPrice(p.price).toFixed(2)}
                </p>
                <button
                  onClick={(e) => handleAddToCart(p, e)}
                  className="btn-gold hover-glow w-full"
                >
                  Add to Cart
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Shop;
