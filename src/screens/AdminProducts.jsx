import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCurrency } from "../hooks/useCurrency.js";
import { resolveProductImage, getStockStatus } from "../utils/productMedia.js";

const AdminProducts = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [stockDraft, setStockDraft] = useState({});
  const { convertPrice, symbol } = useCurrency();

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const list = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0));
    setProducts(list);
    setStockDraft(
      list.reduce((acc, item) => {
        acc[item.id] = Number(item.stock) || 0;
        return acc;
      }, {})
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted!");
    }
  };

  const handleQuickStockUpdate = async (id) => {
    const parsed = Number(stockDraft[id]);
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error("Please enter a valid stock quantity.");
      return;
    }
    const ref = doc(db, "products", id);
    await updateDoc(ref, { stock: parsed });
    toast.success("Stock updated");
    setProducts((prev) =>
      prev.map((product) => (product.id === id ? { ...product, stock: parsed } : product))
    );
  };

  return (
    <div className="min-h-screen bg-burgundy text-gold px-6 md:px-12 pt-36 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-4xl font-elegant">Admin Product Management</h2>
        <div className="flex flex-wrap gap-4">
          <button onClick={() => router.push("/admin/add")} className="btn-gold">
            + Add Product
          </button>
          <button
            onClick={() => router.push("/admin/orders")}
            className="btn-gold bg-[#FFD77A] text-burgundy font-semibold"
          >
            View Orders
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {products.map((product, index) => {
          const imageSrc = resolveProductImage(product, index);
          const stockValue = stockDraft[product.id] ?? product.stock ?? 0;
          const stockStatus = getStockStatus(product.stock);
          const isOut = stockStatus === "Out of stock";
          const metaLine = [product.category, product.hairType, product.length]
            .filter(Boolean)
            .join(" â€¢ ");
          return (
            <div
              key={product.id}
              className="bg-burgundy rounded-2xl shadow-gold/70 border border-gold/15 p-5 flex flex-col gap-4"
            >
              <div className="relative">
                {isOut && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs uppercase tracking-[0.4em] px-3 py-1 rounded-full">
                    Out of stock
                  </span>
                )}
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="w-full h-56 object-cover rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-xl font-elegant">{product.name}</h3>
                <p className="opacity-80 mb-1">
                  {symbol}
                  {convertPrice(product.price || 0).toFixed(2)}
                </p>
                {metaLine && (
                  <p className="text-xs uppercase tracking-[0.3em] text-gold/60 mb-1">
                    {metaLine}
                  </p>
                )}
                <p className="text-sm opacity-70">{stockStatus}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={stockValue}
                  onChange={(e) =>
                    setStockDraft((prev) => ({ ...prev, [product.id]: e.target.value }))
                  }
                  className="input-gold"
                />
                <button
                  onClick={() => handleQuickStockUpdate(product.id)}
                  className="btn-gold whitespace-nowrap"
                >
                  Update Stock
                </button>
              </div>
              <div className="flex justify-between pt-2 border-t border-gold/20">
                <button
                  onClick={() => router.push(`/admin/edit/${product.id}`)}
                  className="text-blue-300 hover:text-blue-200 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-300 hover:text-red-200 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminProducts;

