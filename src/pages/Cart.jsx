import { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { cart, removeFromCart, clearCart, total } = useContext(CartContext);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-20 px-6">
      <h1 className="text-5xl font-elegant mb-10">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-lg text-gold/80">Your cart is currently empty.</p>
      ) : (
        <>
          <div className="w-full max-w-3xl space-y-6">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white text-burgundy p-5 rounded-lg shadow-md"
              >
                <div>
                  <h3 className="font-elegant text-2xl">{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p>£{item.price * item.quantity}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.name)}
                  className="bg-burgundy text-gold px-4 py-2 rounded hover:bg-gold hover:text-burgundy transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <h2 className="text-3xl font-elegant mb-4">
              Total: £{total.toFixed(2)}
            </h2>
            <button
              onClick={clearCart}
              className="bg-gold text-burgundy px-6 py-3 rounded-full hover:bg-white transition"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
