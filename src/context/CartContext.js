// src/context/CartContext.js
import { createContext, useContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Error loading cart from localStorage:", err);
      return [];
    }
  });

  // ✅ Persist cart automatically to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (err) {
      console.error("Error saving cart to localStorage:", err);
    }
  }, [cart]);

  // ✅ Add to cart (safe for missing values)
  const addToCart = (product, quantity = 1) => {
    if (!product || typeof product.price === "undefined") {
      console.warn("Attempted to add invalid product:", product);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 0) + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: quantity > 0 ? quantity : 1,
          price: Number(product.price) || 0,
        },
      ];
    });
  };

  // ✅ Remove item
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ Clear all items
  const clearCart = () => setCart([]);

  // ✅ Safe total calculation
  const getCartTotal = () => {
    if (!Array.isArray(cart) || cart.length === 0) return 0;
    return cart.reduce((total, item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.quantity) || 1;
      return total + itemPrice * itemQty;
    }, 0);
  };

  // ✅ Value passed to components
  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

// ✅ Custom hook for easy use
export const useCart = () => useContext(CartContext);
