import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import toast from "react-hot-toast";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { convertPrice, symbol } = useCurrency();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const ref = doc(db, "products", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
    };
    getData();
  }, [id]);

  if (!product) return <div className="py-20 text-center">Loading...</div>;

  const handleAddToCart = () => {
    addToCart({
      ...product,
      price: Number(String(product.price).replace(/[£,]/g, "")) || 0,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="py-20 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <img
          src={product.image}
          alt={product.name}
          className="rounded-xl shadow-gold"
        />
        <div>
          <h1 className="text-4xl font-elegant mb-4">{product.name}</h1>
          <p className="text-xl mb-6">
            {symbol}
            {convertPrice(product.price).toFixed(2)}
          </p>
          <p className="opacity-90 mb-6">{product.description}</p>
          {product.stock && (
            <p className="mb-6">In Stock: {product.stock}</p>
          )}
          <button onClick={handleAddToCart} className="btn-gold hover-glow">
            Add to Cart
          </button>
        </div>
      </div>
      <div className="mt-20 text-center">
        <Link to="/shop" className="btn-outline-gold hover-glow">
          ← Back to Shop
        </Link>
      </div>
    </div>
  );
}

export default ProductDetail;
