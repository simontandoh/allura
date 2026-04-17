import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { useCurrency } from "../hooks/useCurrency.js";

const isPastStatus = (status = "") => {
  const normalized = String(status).toLowerCase();
  return normalized === "completed" || normalized === "cancelled";
};

const formatTimestamp = (stamp) => {
  if (!stamp?.seconds) return null;
  return new Date(stamp.seconds * 1000).toLocaleString();
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("current");
  const { convertPrice, symbol } = useCurrency();

  const fetchOrders = async () => {
    const querySnapshot = await getDocs(collection(db, "orders"));
    const list = querySnapshot.docs.map((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
    setOrders(list);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const orderRef = doc(db, "orders", id);
    const payload =
      newStatus === "completed"
        ? { status: newStatus, completedAt: serverTimestamp() }
        : { status: newStatus, completedAt: null };
    await updateDoc(orderRef, payload);
    toast.success("Order status updated.");
    fetchOrders();
  };

  const { currentOrders, pastOrders } = useMemo(() => {
    return {
      currentOrders: orders.filter((order) => !isPastStatus(order.status)),
      pastOrders: orders.filter((order) => isPastStatus(order.status)),
    };
  }, [orders]);

  const dataset = filter === "current" ? currentOrders : pastOrders;

  return (
    <div className="min-h-screen bg-burgundy text-gold px-6 md:px-12 pt-32 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-gold/60">Operations</p>
          <h2 className="text-4xl font-elegant">Order Management</h2>
        </div>
        <div className="inline-flex bg-[#3B0010]/80 border border-gold/20 rounded-full p-1 gap-1">
          {["current", "past"].map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-[0.4em] ${
                filter === option ? "bg-gold text-burgundy" : "text-gold/70"
              }`}
            >
              {option === "current" ? "Current orders" : "Past orders"}
            </button>
          ))}
        </div>
      </div>

      {dataset.length === 0 ? (
        <p className="text-gold/60">
          {filter === "current"
            ? "No active orders awaiting fulfilment."
            : "No completed or cancelled orders logged yet."}
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {dataset.map((order) => (
            <div
              key={order.id}
              className="bg-[#3B0010]/80 border border-gold/15 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold break-words">Order #{order.id}</h3>
                  <p className="text-sm text-gold/70">
                    {order.name || "Walk-in client"} Â· {order.email || "â€”"}
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-[0.5em] text-gold/60">
                  {order.status || "pending"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm border-b border-gold/10 pb-1">
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

              <p className="font-semibold border-t border-gold/20 pt-3 flex justify-between">
                <span>Total</span>
                <span>
                  {symbol}
                  {convertPrice(order.total || 0).toFixed(2)}
                </span>
              </p>

              {isPastStatus(order.status) && formatTimestamp(order.completedAt) && (
                <p className="text-xs text-gold/60 mt-2">
                  Completed {formatTimestamp(order.completedAt)}
                </p>
              )}

              <label className="block text-[11px] uppercase tracking-[0.4em] text-gold/60 mt-6 mb-2">
                Update Status
              </label>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="select-gold rounded-full bg-burgundy/80 border border-gold/40 text-gold px-4 py-2 text-sm cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;



