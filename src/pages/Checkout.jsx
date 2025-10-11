import FadeInWhenVisible from "../components/FadeInWhenVisible";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Checkout() {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const navigate = useNavigate();

  // ✅ Compute total safely
  const total = Number(getCartTotal() || 0);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.address) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    toast.success("Processing your order...");

    // Simulate checkout processing
    setTimeout(() => {
      clearCart();
      navigate("/checkout-success", { state: { fromCheckout: true } });
    }, 1200);
  };

  return (
    <div className="py-20 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <FadeInWhenVisible>
        <h1 className="text-5xl font-elegant mb-10 text-center">Checkout</h1>
      </FadeInWhenVisible>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Billing Details */}
        <FadeInWhenVisible delay={0.2}>
          <form
            onSubmit={handleSubmit}
            className="bg-burgundy/40 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-elegant mb-6">Billing Details</h2>

            <div className="mb-4">
              <label className="block mb-2 text-sm">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg text-burgundy focus:outline-none"
                placeholder="Jane Doe"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg text-burgundy focus:outline-none"
                placeholder="jane@example.com"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm">Shipping Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full p-3 rounded-lg text-burgundy focus:outline-none h-24"
                placeholder="123 Luxury Street, London"
              />
            </div>

            <button type="submit" className="btn-gold w-full py-3 text-lg">
              Place Order
            </button>
          </form>
        </FadeInWhenVisible>

        {/* Order Summary */}
        <FadeInWhenVisible delay={0.4}>
          <div className="bg-burgundy/40 p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-elegant mb-6">Order Summary</h2>

            {cart.length === 0 ? (
              <p className="opacity-70 text-center">Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item, i) => {
                  const price = Number(item.price) || 0;
                  const qty = Number(item.quantity) || 1;
                  const subtotal = price * qty;
                  return (
                    <div
                      key={i}
                      className="flex justify-between border-b border-gold/20 py-2"
                    >
                      <p>
                        {item.name} × {qty}
                      </p>
                      <p>£{subtotal.toFixed(2)}</p>
                    </div>
                  );
                })}

                <div className="mt-8 border-t border-gold pt-4 flex justify-between text-xl font-semibold">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </FadeInWhenVisible>
      </div>
    </div>
  );
}

export default Checkout;
