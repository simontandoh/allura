import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import FadeInWhenVisible from "./FadeInWhenVisible";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function ProductCard({ product }) {
  const { cart, addToCart } = useContext(CartContext);
  const { convertPrice, symbol } = useCurrency();

  const handleAddToCart = (e) => {
    e.preventDefault(); // prevent link navigation on button click

    if (!product || !product.id) {
      toast.error("Product data is invalid.");
      return;
    }

    const safeProduct = {
      ...product,
      price: Number(String(product.price).replace(/[£,]/g, "")) || 0,
      quantity: 1,
    };

    // check if already in cart
    const existing = cart.find((item) => item.id === product.id);
    addToCart(safeProduct);

    if (existing) {
      toast.success(`Added 1 more ${product.name} (x${existing.quantity + 1} in cart)`);
    } else {
      toast.success(`${product.name} added to cart!`);
    }
  };

  return (
    <FadeInWhenVisible delay={0.1}>
      <Link
        to={`/product/${product.id}`}
        className="block bg-burgundyDark rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(255,215,122,0.15)] transition no-underline"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <div className="p-5 text-center">
          <h3 className="text-xl font-elegant mb-2">{product.name}</h3>
          <p className="opacity-80 mb-4">
            {symbol}
            {convertPrice(product.price).toFixed(2)}
          </p>
          <button
            onClick={handleAddToCart}
            className="btn-gold w-full py-2 hover-glow"
          >
            Add to Cart
          </button>
        </div>
      </Link>
    </FadeInWhenVisible>
  );
}

export default ProductCard;
