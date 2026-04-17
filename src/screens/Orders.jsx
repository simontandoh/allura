import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useCurrency } from "../hooks/useCurrency.js";

const isPastStatus = (status = "") => {
  const normalized = String(status).toLowerCase();
  return normalized === "completed" || normalized === "cancelled";
};

function Orders() {
  const { user } = useAuth();
  const { convertPrice, symbol } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("current");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(list);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const { currentOrders, pastOrders } = useMemo(() => {
    return {
      currentOrders: orders.filter((order) => !isPastStatus(order.status)),
      pastOrders: orders.filter((order) => isPastStatus(order.status)),
    };
  }, [orders]);

  const displayOrders = filter === "current" ? currentOrders : pastOrders;

  if (loading) return <p className="text-gold/70">Loading your orders...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-elegant">Your Orders</h2>
        <div className="inline-flex bg-[#3B0010] border border-gold/20 rounded-full p-1 gap-1">
          {["current", "past"].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-[0.35em] ${
                filter === option ? "bg-gold text-burgundy" : "text-gold/70"
              }`}
            >
              {option === "current" ? "Current" : "Past"}
            </button>
          ))}
        </div>
      </div>

      {displayOrders.length === 0 ? (
        <p className="opacity-70">
          {filter === "current"
            ? "You have no active orders right now."
            : "No completed orders yet. Your history will appear here."}
        </p>
      ) : (
        <div className="space-y-5">
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#3B0010]/80 p-5 rounded-3xl border border-gold/10 shadow-[0_10px_35px_rgba(0,0,0,0.45)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold break-words">Order #{order.id}</h3>
                <span className="text-[11px] uppercase tracking-[0.5em] text-gold/60">
                  {order.status || "pending"}
                </span>
              </div>
              <div className="space-y-2 my-4 text-sm">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-gold/5 pb-1">
                    <span>
                      {item.name} Ã— {item.quantity}
                    </span>
                    <span>
                      {symbol}
                      {convertPrice((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gold/10 text-sm font-semibold">
                <span>Total</span>
                <span>
                  {symbol}
                  {convertPrice(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;


