import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, getCartTotal } = useContext(CartContext);
  const { convertPrice, symbol } = useCurrency();

  // ✅ Safely handle total with conversion
  const rawTotal = getCartTotal() || 0;
  const total = isNaN(rawTotal) ? 0 : convertPrice(rawTotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          ></motion.div>

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4 }}
            className="fixed top-0 right-0 w-80 h-full bg-burgundy text-gold shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gold/20">
              <h2 className="text-2xl font-elegant">Your Cart</h2>
              <button
                onClick={onClose}
                className="text-gold hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
              {!cart || cart.length === 0 ? (
                <p className="opacity-80 text-center mt-8">
                  Your cart is empty.
                </p>
              ) : (
                cart.map((item) => {
                  const basePrice =
                    Number(String(item.price).replace(/[£,]/g, "")) || 0;
                  const qty = Number(item.quantity) || 1;

                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b border-gold/20 pb-3"
                    >
                      <div>
                        <p className="font-semibold">
                          {item.name || "Unnamed"}
                        </p>
                        <p className="text-sm opacity-80">
                          {symbol}
                          {convertPrice(basePrice).toFixed(2)} × {qty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>
                          {symbol}
                          {(convertPrice(basePrice * qty)).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-red-400 hover:text-red-300 mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gold/20 p-6">
              <div className="flex justify-between mb-4 text-lg font-semibold">
                <span>Total:</span>
                <span>
                  {symbol}
                  {total.toFixed(2)}
                </span>
              </div>

              {cart && cart.length > 0 && (
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="btn-gold block w-full text-center py-2 text-lg"
                >
                  Proceed to Checkout
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
