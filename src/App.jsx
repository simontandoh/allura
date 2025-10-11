import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";

// 🌍 Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 🛍 Public Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import ProductDetail from "./pages/ProductDetail";
import FAQs from "./pages/FAQs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import ReturnsPolicy from "./pages/ReturnsPolicy";

// 🔐 Authentication & Portals
import Login from "./pages/Login";                // ✅ Shared login page
import CustomerDashboard from "./pages/CustomerDashboard"; // ✅ New dashboard for customers
import AddProduct from "./pages/AddProduct";
import AdminProducts from "./pages/AdminProducts";

// 🧠 Contexts
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { CartProvider } from "./context/CartContext";

// 🔒 Route Protection
import PrivateRoute from "./components/PrivateRoute";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative z-30"
      >
        <Routes location={location}>
          {/* 🌸 Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/returns" element={<ReturnsPolicy />} />

          {/* 🔐 Auth + Dashboard */}
          <Route path="/login" element={<Login />} />          {/* ✅ Universal Login */}
          <Route path="/dashboard" element={<CustomerDashboard />} /> {/* ✅ Customer Portal */}

          {/* 🧩 Admin Portal (Protected) */}
          <Route
            path="/admin/products"
            element={
              <PrivateRoute>
                <AdminProducts />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/add"
            element={
              <PrivateRoute>
                <AddProduct />
              </PrivateRoute>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-burgundy text-gold overflow-hidden">
              <Navbar />
              <main className="flex-grow mt-24 relative">
                <AnimatedRoutes />
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
          </Router>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
