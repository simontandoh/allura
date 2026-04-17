import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiXCircle } from "react-icons/fi";

export default function CheckoutFailed() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stripe may send the error message in redirect failures
  const errorMessage = searchParams?.get("error") || "Your payment could not be completed.";

  return (
    <div className="min-h-screen bg-burgundy text-gold flex flex-col items-center justify-center px-6 pt-28 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-burgundy/40 p-10 rounded-2xl shadow-lg max-w-lg text-center"
      >
        <FiXCircle className="mx-auto mb-4 text-red-500" size={70} />

        <h1 className="text-4xl font-elegant mb-4">Payment Failed</h1>

        <p className="opacity-90 mb-6 leading-relaxed">
          {errorMessage}
        </p>

        <div className="flex flex-col gap-4 mt-6">
          <button
            onClick={() => router.push("/checkout")}
            className="btn-gold py-3 text-lg rounded-lg"
          >
            Try Again
          </button>

          <button
            onClick={() => router.push("/cart")}
            className="py-3 text-lg rounded-lg border border-gold text-gold hover:bg-gold hover:text-burgundy transition"
          >
            Review Your Cart
          </button>

          <button
            onClick={() => router.push("/contact")}
            className="py-3 text-lg rounded-lg border border-red-500 text-red-400 hover:bg-red-500 hover:text-burgundy transition"
          >
            Contact Support
          </button>
        </div>
      </motion.div>
    </div>
  );
}
