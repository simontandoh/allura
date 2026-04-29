import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { useRouter } from "next/navigation";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCurrency } from "../hooks/useCurrency.js";

// ========================= STRIPE ===========================
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;
const PENDING_ORDER_KEY = "allurahouse_pending_order";
const STRIPE_APPEARANCE = {
  theme: "flat",
  variables: {
    colorPrimary: "#FFD77A",
    colorBackground: "#2A0011",
    colorText: "#FFD77A",
    colorTextSecondary: "#F7E5B2",
    colorDanger: "#FFB3B3",
    fontFamily: '"Space Grotesk", "Cormorant Garamond", "Segoe UI", system-ui, sans-serif',
    borderRadius: "14px",
    spacingUnit: "6px",
  },
  rules: {
    ".Input": {
      backgroundColor: "#2A0011",
      border: "1px solid rgba(255, 215, 122, 0.35)",
      color: "#FFD77A",
      boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
    },
    ".Input:focus": {
      borderColor: "#FFD77A",
      boxShadow: "0 0 0 1px rgba(255, 215, 122, 0.65)",
    },
    ".Input--invalid": {
      borderColor: "rgba(255, 107, 107, 0.8)",
      boxShadow: "0 0 0 1px rgba(255, 107, 107, 0.45)",
    },
    ".Label": {
      color: "#F7E5B2",
      fontWeight: "600",
      letterSpacing: "0.02em",
    },
    ".Tab": {
      backgroundColor: "#3B0010",
      color: "#FFD77A",
      border: "1px solid rgba(255, 215, 122, 0.35)",
    },
    ".Tab:hover": {
      color: "#FFE9A0",
      borderColor: "rgba(255, 215, 122, 0.5)",
    },
    ".Tab--selected": {
      backgroundColor: "#FFD77A",
      color: "#2A0011",
      borderColor: "#FFD77A",
    },
    ".TabIcon": { color: "#FFD77A" },
    ".Error": { color: "#FFB3B3" },
  },
};

// =============================================================
//                     EXTENSION-PROOF FORM
// =============================================================
function CheckoutInner({ clientSecret }) {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useAuth();
  const { convertPrice, symbol } = useCurrency();
  const router = useRouter();

  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [showExtWarning, setShowExtWarning] = useState(false);

  const [form, setForm] = useState(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(PENDING_ORDER_KEY) || "null");
      return {
        name: stored?.addressFields?.name || stored?.name || "",
        email: stored?.addressFields?.email || stored?.email || "",
        address1: stored?.addressFields?.address1 || "",
        address2: stored?.addressFields?.address2 || "",
        address3: stored?.addressFields?.address3 || "",
        city: stored?.addressFields?.city || "",
        postcode: stored?.addressFields?.postcode || "",
      };
    } catch {
      return {
        name: "",
        email: "",
        address1: "",
        address2: "",
        address3: "",
        city: "",
        postcode: "",
      };
    }
  });

  const total = Number(getCartTotal() || 0);
  const paymentElementOptions = useMemo(() => ({ layout: "tabs" }), []);

  const buildSnapshotPayload = useCallback(
    (override = {}) => {
      const payload = {
        userId: user?.uid || null,
        name: (override.name ?? form.name ?? user?.displayName ?? "").trim(),
        email: (override.email ?? form.email ?? user?.email ?? "").trim(),
        addressFields: {
          address1: override.address1 ?? form.address1 ?? "",
          address2: override.address2 ?? form.address2 ?? "",
          address3: override.address3 ?? form.address3 ?? "",
          city: override.city ?? form.city ?? "",
          postcode: override.postcode ?? form.postcode ?? "",
        },
        total,
        items: cart.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      };
      payload.address = [
        payload.addressFields.address1,
        payload.addressFields.address2,
        payload.addressFields.address3,
        payload.addressFields.city,
        payload.addressFields.postcode,
      ]
        .filter(Boolean)
        .join(", ");

      try {
        sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn("Pending order persistence failed:", err);
      }
      return payload;
    },
    [user?.uid, user?.displayName, user?.email, form, total, cart]
  );

  const handleSuccessfulIntent = useCallback(
    async (intent, payload) => {
      const ref = await addDoc(collection(db, "orders"), {
        ...payload,
        status: intent.status === "succeeded" ? "paid" : intent.status,
        paymentIntentId: intent.id,
        createdAt: serverTimestamp(),
      });

      sessionStorage.removeItem(PENDING_ORDER_KEY);
      clearCart();
      router.push(
        `/checkout-success?orderId=${encodeURIComponent(ref.id)}&payment_intent=${encodeURIComponent(
          intent.id
        )}`
      );
    },
    [clearCart, router]
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || user?.displayName || "",
      email: prev.email || user?.email || "",
    }));
  }, [user?.displayName, user?.email]);

  // ================================================================
  //                       HANDLE FORM
  // ================================================================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================================================================
  //              EXTENSION INTERFERENCE DETECTOR
  // ================================================================
  useEffect(() => {
    if (!clientSecret) return;

    const timer = setTimeout(() => {
      if (!paymentReady) {
        setShowExtWarning(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [clientSecret, paymentReady]);

  // ================================================================
  //                         SUBMIT PAYMENT
  // ================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.address1 || !form.city || !form.postcode) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    if (!stripe || !elements) {
      toast.error("Payment form is loading...");
      return;
    }

    setProcessing(true);

    const snapshotPayload = buildSnapshotPayload();

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        receipt_email: form.email,
        payment_method_data: {
          billing_details: {
            name: form.name,
            email: form.email,
            address: {
              line1: form.address1,
              line2: form.address2 || form.address3 || "",
              city: form.city,
              postal_code: form.postcode,
            },
          },
        },
        return_url: `${window.location.origin}/checkout-success`,
      },
    });
    const { error, paymentIntent } = result;

    if (error) {
      const recoveredIntent = error.payment_intent;
      if (["succeeded", "processing", "requires_capture"].includes(recoveredIntent?.status)) {
        try {
          await handleSuccessfulIntent(recoveredIntent, snapshotPayload);
        } catch (err) {
          console.error("Order save failed after payment:", err);
          toast.error(
            "Payment went through, but saving your order failed. Contact support with reference: " +
              (recoveredIntent?.id || "unknown")
          );
          setProcessing(false);
        }
        return;
      }

      toast.error(error.message || "Payment failed");
      router.push(
        `/checkout-failed?error=${encodeURIComponent(
          error.message || "Your payment could not be processed."
        )}`
      );
      setProcessing(false);
      return;
    }

    const status = paymentIntent?.status;

    if (["succeeded", "processing", "requires_capture"].includes(status)) {
      try {
        await handleSuccessfulIntent(paymentIntent, snapshotPayload);
      } catch (err) {
        console.error("Order save failed after payment:", err);
        toast.error(
          "Payment went through, but saving your order failed. Contact support with this reference: " +
            (paymentIntent?.id || "unknown")
        );
        setProcessing(false);
      }
      return;
    }

    toast.error("We could not confirm this payment. Please try again.");
    router.push(
      `/checkout-failed?error=${encodeURIComponent(
        "Your payment has not been captured. Please try again."
      )}`
    );
    setProcessing(false);
  };

  // ================================================================
  //                       RENDER UI
  // ================================================================
  return (
    <div className="pt-28 pb-16 px-6 md:px-20 bg-burgundy text-gold min-h-screen">
      <h1 className="text-5xl font-elegant mb-10 text-center">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="bg-burgundy/40 p-8 rounded-2xl shadow-lg space-y-4"
          >
            <h2 className="text-2xl font-elegant mb-6">Billing Details</h2>

            <input
              autoComplete="none"
              type="text"
              name="name"
              placeholder="Cardholder Name"
              value={form.name}
              onChange={handleChange}
              className="input-gold"
              required
            />

            <input
              autoComplete="none"
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="input-gold"
              required
            />

            <input
              autoComplete="none"
              type="text"
              name="address1"
              placeholder="Address Line 1"
              value={form.address1}
              onChange={handleChange}
              className="input-gold"
              required
            />

            <input
              autoComplete="none"
              type="text"
              name="address2"
              placeholder="Address Line 2"
              value={form.address2}
              onChange={handleChange}
              className="input-gold"
            />

            <input
              autoComplete="none"
              type="text"
              name="address3"
              placeholder="Address Line 3"
              value={form.address3}
              onChange={handleChange}
              className="input-gold"
            />

            <input
              autoComplete="none"
              type="text"
              name="city"
              placeholder="Town / City"
              value={form.city}
              onChange={handleChange}
              className="input-gold"
              required
            />

            <input
              autoComplete="none"
              type="text"
              name="postcode"
              placeholder="Postcode"
              value={form.postcode}
              onChange={handleChange}
              className="input-gold"
              required
            />

            {/* STRIPE SAFETY CONTAINER */}
            <div
              className="bg-burgundy p-4 rounded-xl border border-gold/20 shadow-[0_18px_44px_rgba(0,0,0,0.45)] space-y-3"
              autoComplete="off"
              data-stripe-container="true"
              style={{
                opacity: paymentReady ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              <PaymentElement
                options={paymentElementOptions}
                onReady={() => setPaymentReady(true)}
              />
            </div>

            {/* EXTENSION WARNING */}
            {showExtWarning && !paymentReady && (
              <div className="bg-red-900 text-red-200 p-4 rounded-lg mt-4 text-sm">
                A browser extension (password manager or security tool) is blocking secure
                payment fields from loading.  
                Disable autofill for this site or try Incognito mode.
              </div>
            )}

            <button
              type="submit"
              disabled={processing || !paymentReady}
              className="btn-gold w-full py-3 text-lg mt-6 hover:scale-[1.02] transition-transform"
            >
              {processing
                ? "Processing..."
                : paymentReady
                ? "Place Order"
                : "Preparing payment..."}
            </button>

            {/* FALLBACK: HOSTED CHECKOUT */}
            {showExtWarning && (
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/api/payments/hosted-checkout?amount=${Math.round(total * 100)}`;
                }}
                className="w-full py-3 bg-gold text-burgundy mt-4 rounded-lg font-semibold border border-gold/70 hover:bg-[#FFE9A0]"
              >
                Continue with Secure Stripe Checkout
              </button>
            )}
          </form>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-burgundy/40 p-8 rounded-2xl shadow-lg space-y-6">
          <div>
            <h2 className="text-2xl font-elegant mb-6">Order Summary</h2>
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between border-b border-gold/20 py-2">
                <p>
                  {item.name} × {item.quantity}
                </p>
                <p>
                  {symbol}
                  {convertPrice((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="mt-8 border-t border-gold pt-4 flex justify-between text-xl font-semibold">
              <span>Total</span>
              <span>
                {symbol}
                {convertPrice(total).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="bg-[#3B0010] border border-gold/20 rounded-2xl p-5 space-y-3">
            <p className="text-sm uppercase tracking-[0.5em] text-gold/60">Need more time?</p>
            <h3 className="text-xl font-semibold">Pay now or pay later</h3>
            <p className="text-sm text-gold/80 leading-relaxed">
              We accept Visa, Mastercard, Amex, PayPal, and Klarna/Clearpay instalments. Select â€œPay
              in 3â€ or â€œPay in 4â€ at checkout to split the total with zero interest. Your order ships
              once the first instalment is confirmed.
            </p>
            <ul className="text-xs text-gold/70 space-y-1">
              <li>â€¢ Instant card payments secured with 3D verification.</li>
              <li>â€¢ PayPal Pay Later keeps your PayPal Buyer Protection intact.</li>
              <li>â€¢ Klarna & Clearpay instalments keep your budget balanced.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
//                     OUTER CHECKOUT WRAPPER
// =============================================================
function Checkout() {
  const { cart } = useContext(CartContext);
  const [initializing, setInitializing] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [initError, setInitError] = useState("");

  const elementsOptions = useMemo(
    () => ({ clientSecret, appearance: STRIPE_APPEARANCE }),
    [clientSecret]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!cart.length) {
        setInitializing(false);
        return;
      }

	      try {
	        const res = await fetch(`/api/payments/create-intent`, {
	          method: "POST",
	          headers: { "Content-Type": "application/json" },
	          body: JSON.stringify({
	            items: cart.map((i) => ({
	              id: i.id,
	              name: i.name,
	              price: i.price,
	              quantity: i.quantity,
	            })),
	          }),
	        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || "Unable to start checkout");
        }

        if (!data.clientSecret) throw new Error("Missing client secret");

        if (active) setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
        if (active) setInitError(err.message);
      } finally {
        if (active) setInitializing(false);
      }
    };

    load();
    return () => (active = false);
  }, [cart]);

  if (!stripePromise) {
    return <div>Stripe not configured</div>;
  }

  if (initializing) {
    return (
      <div className="pt-28 pb-16 text-center text-gold bg-burgundy min-h-screen">
        <div className="loader mb-4" />
        Preparing your checkout...
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="pt-28 pb-16 text-center text-gold bg-burgundy min-h-screen">
        {initError || "Unable to start checkout"}
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      <CheckoutInner clientSecret={clientSecret} />
    </Elements>
  );
}

export default Checkout;
