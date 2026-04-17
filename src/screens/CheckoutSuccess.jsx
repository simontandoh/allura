import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import FadeInWhenVisible from "../components/FadeInWhenVisible";
import { useCurrency } from "../hooks/useCurrency.js";
import { CartContext } from "../context/CartContext.jsx";

const PENDING_ORDER_KEY = "allurahouse_pending_order";
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;
const SUCCESS_STATUSES = ["succeeded", "processing", "requires_capture"];

export default function CheckoutSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGlow, setShowGlow] = useState(false);
  const { convertPrice, symbol } = useCurrency();
  const { clearCart } = useContext(CartContext);

  const orderId = searchParams?.get("orderId");
  const paymentIntentId = searchParams?.get("payment_intent");
  const redirectStatus = searchParams?.get("redirect_status");
  const intentClientSecret = searchParams?.get("payment_intent_client_secret");

  useEffect(() => {
    if (!order) return;
    setShowGlow(true);
    const timer = setTimeout(() => setShowGlow(false), 5000);
    return () => clearTimeout(timer);
  }, [order]);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const pendingRaw = sessionStorage.getItem(PENDING_ORDER_KEY);
        let pendingData = null;
        try {
          pendingData = pendingRaw ? JSON.parse(pendingRaw) : null;
        } catch (err) {
          pendingData = null;
        }

        const hydrateOrder = (data) => {
          sessionStorage.removeItem(PENDING_ORDER_KEY);
          clearCart();
          setOrder(data);
          setLoading(false);
        };

        const findOrderByIntent = async (intentId) => {
          const existingQuery = query(
            collection(db, "orders"),
            where("paymentIntentId", "==", intentId),
            limit(1)
          );
          const snap = await getDocs(existingQuery);
          if (!snap.empty) {
            const docData = snap.docs[0];
            return { id: docData.id, ...docData.data() };
          }
          return null;
        };

        if (orderId) {
          const ref = doc(db, "orders", orderId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            hydrateOrder({ id: snap.id, ...snap.data() });
            return;
          }
        }

        if (paymentIntentId) {
          const existing = await findOrderByIntent(paymentIntentId);
          if (existing) {
            hydrateOrder(existing);
            return;
          }
        }

        if (intentClientSecret && stripePromise) {
          const stripe = await stripePromise;
          const { paymentIntent } = await stripe.retrievePaymentIntent(intentClientSecret);

          if (paymentIntent?.id) {
            const existing = await findOrderByIntent(paymentIntent.id);
            if (existing) {
              hydrateOrder(existing);
              return;
            }

            const addressFields =
              pendingData?.addressFields ||
              (paymentIntent.shipping?.address && {
                address1: paymentIntent.shipping.address.line1 || "",
                address2: paymentIntent.shipping.address.line2 || "",
                address3: "",
                city:
                  paymentIntent.shipping.address.city ||
                  paymentIntent.shipping.address.town ||
                  "",
                postcode: paymentIntent.shipping.address.postal_code || "",
              }) || {
                address1: "",
                address2: "",
                address3: "",
                city: "",
                postcode: "",
              };

            if (SUCCESS_STATUSES.includes(paymentIntent.status)) {
              const payload = pendingData || {
                name: paymentIntent.billing_details?.name || "",
                email: paymentIntent.receipt_email || "",
                addressFields,
                total:
                  pendingData?.total ??
                  (paymentIntent.amount != null ? paymentIntent.amount / 100 : 0),
                items: [],
              };

              payload.address =
                payload.address ||
                [
                  addressFields.address1,
                  addressFields.address2,
                  addressFields.address3,
                  addressFields.city,
                  addressFields.postcode,
                ]
                  .filter(Boolean)
                  .join(", ");

              const ref = await addDoc(collection(db, "orders"), {
                ...payload,
                status: paymentIntent.status === "succeeded" ? "paid" : paymentIntent.status,
                paymentIntentId: paymentIntent.id,
                createdAt: serverTimestamp(),
              });

              hydrateOrder({
                id: ref.id,
                ...payload,
                status: paymentIntent.status === "succeeded" ? "paid" : paymentIntent.status,
              });
              return;
            }

            const errorMessage =
              paymentIntent.last_payment_error?.message ||
              "Your payment was not completed. Please try again.";

            router.replace(`/checkout-failed?error=${encodeURIComponent(errorMessage)}`);
            return;
          }
        }

        if (redirectStatus && redirectStatus !== "succeeded") {
          router.replace(
            `/checkout-failed?error=${encodeURIComponent("Your payment was not completed.")}`
          );
          return;
        }

        if (pendingData && paymentIntentId) {
          const ref = await addDoc(collection(db, "orders"), {
            ...pendingData,
            status: "paid",
            paymentIntentId,
            createdAt: serverTimestamp(),
          });
          hydrateOrder({ id: ref.id, ...pendingData, status: "paid" });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("CheckoutSuccess error:", err);
        setLoading(false);
        router.replace(
          `/checkout-failed?error=${encodeURIComponent(
            "We could not confirm your payment. Please contact support."
          )}`
        );
      }
    };

    loadOrder();
  }, [orderId, paymentIntentId, redirectStatus, intentClientSecret, router, clearCart]);

  if (loading)
    return (
      <div className="pt-28 pb-16 bg-burgundy text-gold min-h-screen flex flex-col items-center justify-center">
        <div className="loader mb-4" />
        <p>Fetching your order...</p>
      </div>
    );

  return (
    <div className="pt-28 pb-16 px-6 md:px-20 bg-burgundy text-gold min-h-screen text-center relative overflow-hidden">
      {showGlow && <div className="gold-embrace" />}
      <FadeInWhenVisible>
        {order ? (
          <>
            <h1 className="text-5xl font-elegant mb-4">Order Confirmed!</h1>
            <p className="mb-4 text-lg opacity-90">
              Thank you! Your order <strong>#{order.id}</strong> was placed successfully.
            </p>
            <p className="mb-8 opacity-80">
              A confirmation email has been sent to {order.email}.
            </p>
            <div className="max-w-md mx-auto bg-burgundy/40 rounded-2xl p-6 text-left space-y-2 shadow-lg">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border-b border-gold/20 py-2"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    {symbol}
                    {convertPrice((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t border-gold mt-4 flex justify-between text-xl font-semibold">
                <span>Total</span>
                <span>
                  {symbol}
                  {convertPrice(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <h2 className="text-3xl font-elegant">No order found.</h2>
        )}
      </FadeInWhenVisible>
    </div>
  );
}
