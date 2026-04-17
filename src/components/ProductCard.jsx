import { useContext } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { useCurrency } from "../hooks/useCurrency.js";
import FadeInWhenVisible from "./FadeInWhenVisible";
import toast from "react-hot-toast";
import { resolveProductImage, getStockStatus } from "../utils/productMedia.js";

function ProductCard({ product }) {
  const { cart, addToCart } = useContext(CartContext);
  const { convertPrice, symbol } = useCurrency();

  const stockStatus = getStockStatus(product?.stock);
  const isOutOfStock = stockStatus === "Out of stock";
  const imageSrc = resolveProductImage(product);

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!product || !product.id) {
      toast.error("Product data is invalid.");
      return;
    }

    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    const safeProduct = {
      ...product,
      image: imageSrc,
      images: product?.images?.length ? product.images : [imageSrc],
      price: Number(String(product.price).replace(/[A�A,]/g, "")) || 0,
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
    <FadeInWhenVisible delay={0.1}>
      <a
        href={`/product/${product.id}`}
        className="block bg-burgundyDark rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(255,215,122,0.15)] transition no-underline"
      >
        <div className="relative">
          <img src={imageSrc} alt={product.name} className="w-full h-64 object-cover" />
          <span
            className={`absolute top-3 left-3 text-xs uppercase tracking-[0.4em] px-3 py-1 rounded-full ${
              isOutOfStock
                ? "bg-red-500/90 text-white"
                : stockStatus === "Low stock"
                ? "bg-amber-300/90 text-burgundy"
                : "bg-black/60 text-white"
            }`}
          >
            {stockStatus}
          </span>
        </div>
        <div className="p-5 text-center">
          <h3 className="text-xl font-elegant mb-2">{product.name}</h3>
          <p className="opacity-80 mb-4">
            {symbol}
            {convertPrice(product.price).toFixed(2)}
          </p>
          <button
            onClick={handleAddToCart}
            className={`btn-gold w-full py-2 hover-glow ${
              isOutOfStock ? "opacity-60 pointer-events-none" : ""
            }`}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of stock" : "Add to Cart"}
          </button>
        </div>
      </a>
    </FadeInWhenVisible>
  );
}

export default ProductCard;
