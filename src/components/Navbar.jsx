import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import CartDrawer from "./CartDrawer";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const { currency, setCurrency } = useCurrency();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-burgundy z-50 shadow-lg border-b border-gold/20">
        <div className="flex justify-between items-center px-6 md:px-16 py-4">
          {/* === Left Section: Burger + Logo === */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              className="text-gold text-2xl md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="text-3xl font-elegant text-gold hover:text-white transition"
            >
              <b>ALLÜRA</b>
            </Link>
          </div>

          {/* === Center Section: Desktop Nav === */}
          <div className="hidden md:flex items-center gap-10 font-clean text-lg">
            <Link to="/" className="hover:text-white link-glow">Home</Link>
            <Link to="/shop" className="hover:text-white link-glow">Shop</Link>
            <Link to="/about" className="hover:text-white link-glow">About</Link>
            <Link to="/contact" className="hover:text-white link-glow">Contact</Link>
          </div>

          {/* === Right Section: Currency + Cart === */}
          <div className="flex items-center gap-6">
            {/* Currency Toggle */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent border border-[#FFD77A] rounded-md px-2 py-1 text-sm text-gold focus:outline-none hover-glow cursor-pointer"
            >
              <option value="GBP">£ GBP</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>

            {/* Cart */}
            <div
              className="relative cursor-pointer"
              onClick={() => setCartOpen(true)}
            >
              <FaShoppingCart className="text-2xl text-gold hover:text-white transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-burgundy text-xs font-bold rounded-full px-1.5 py-0.5">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* === Mobile Dropdown === */}
        {isOpen && (
          <div className="md:hidden bg-burgundy border-t border-gold/20 text-center py-4 space-y-4 font-clean text-lg">
            <Link to="/" onClick={() => setIsOpen(false)} className="block link-glow">Home</Link>
            <Link to="/shop" onClick={() => setIsOpen(false)} className="block link-glow">Shop</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block link-glow">About</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block link-glow">Contact</Link>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Navbar;
