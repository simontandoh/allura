import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const list = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(list);
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

  return (
    <div className="min-h-screen bg-burgundy text-gold p-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-elegant">Allura Product Management</h2>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/admin/add")}
            className="btn-gold"
          >
            + Add Product
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {products.map((p) => (
          <div key={p.id} className="bg-[#3B0010] rounded-xl shadow-gold p-4">
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-56 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <p className="opacity-80">£{p.price}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm opacity-70">
                Stock: {p.stock || "N/A"}
              </span>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
