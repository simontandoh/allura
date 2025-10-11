import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import confetti from "canvas-confetti";

function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

useEffect(() => {
  if (!location.state?.fromCheckout) {
    navigate("/");
    return;
  }

  // 🎊 Trigger confetti only once after a real checkout
  if (!sessionStorage.getItem("confetti_shown")) {
    sessionStorage.setItem("confetti_shown", "true");
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FFD77A", "#FFF5CC", "#E4C27A"],
        scalar: 1.2,
      });
    }, 900);
  }
}, [location, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-burgundy text-gold px-6">
      {/* ✅ Golden Animated Circle with Tick */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        className="relative w-36 h-36 mb-8 flex items-center justify-center rounded-full border-4 border-gold shadow-[0_0_40px_rgba(255,215,122,0.6)]"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-20 h-20 text-gold"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>

      {/* Text */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-4xl font-elegant mb-4"
      >
        Order Confirmed
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-lg text-center max-w-md mb-10 opacity-90"
      >
        Thank you for choosing <span className="font-bold">Allura</span>.  
        Your order has been processed successfully.  
        You’ll receive a confirmation email shortly.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Link
          to="/shop"
          className="btn-gold text-lg px-8 py-3 rounded-full hover-glow"
        >
          Continue Shopping
        </Link>
      </motion.div>
    </div>
  );
}

export default CheckoutSuccess;
