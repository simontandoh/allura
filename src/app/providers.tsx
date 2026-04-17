"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthContext.jsx";
import { CurrencyProvider } from "../context/CurrencyContext.jsx";
import { CartProvider } from "../context/CartContext.jsx";

const NO_MOTION_ROUTES = new Set(["/checkout", "/checkout-success", "/checkout-failed"]);

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNoMotion = pathname ? NO_MOTION_ROUTES.has(pathname) : false;

  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-burgundy text-gold overflow-hidden">
            <Navbar />
            <main className="flex-grow relative">
              {isNoMotion ? (
                children
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="relative z-30"
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              )}
            </main>
            <Footer />
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: "#FFD77A",
                  color: "#4B0013",
                  fontWeight: "600",
                  borderRadius: "10px",
                  padding: "10px 20px",
                },
              }}
            />
          </div>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
