import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import FadeInWhenVisible from "../components/FadeInWhenVisible";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function Admin() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    stock: 1,
  });
  const { logout } = useAuth();

  const ref = collection(db, "products");

  const fetchProducts = async () => {
    const snap = await getDocs(ref);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    await addDoc(ref, newProduct);
    toast.success("Product added!");
    setNewProduct({ name: "", price: "", description: "", image: "", stock: 1 });
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    toast.success("Deleted!");
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateStock = async (id, change) => {
    const item = products.find((p) => p.id === id);
    const newStock = Math.max(0, item.stock + change);
    await updateDoc(doc(db, "products", id), { stock: newStock });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
  };

  return (
    <div className="bg-burgundy text-gold min-h-screen py-16 px-6 md:px-20">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-elegant">Admin Dashboard</h1>
        <button onClick={logout} className="btn-outline-gold hover-glow">
          Logout
        </button>
      </div>

      <FadeInWhenVisible>
        <form
          onSubmit={addProduct}
          className="bg-[#3B0010] p-6 rounded-xl shadow-gold max-w-lg mx-auto mb-10"
        >
          <h2 className="text-2xl mb-4">Add New Product</h2>
          <input
            type="text"
            placeholder="Name"
            className="input-gold mb-3"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Price (e.g. £499)"
            className="input-gold mb-3"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="text"
            placeholder="Image URL"
            className="input-gold mb-3"
            value={newProduct.image}
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="input-gold mb-3"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          ></textarea>
          <input
            type="number"
            placeholder="Stock"
            className="input-gold mb-4"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })
            }
          />
          <button type="submit" className="btn-gold w-full hover-glow">
            Add Product
          </button>
        </form>

        <div className="grid gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-[#3B0010] p-5 rounded-lg shadow-gold flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p>{p.price}</p>
                <p>Stock: {p.stock}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStock(p.id, 1)}
                  className="btn-gold text-sm"
                >
                  + Stock
                </button>
                <button
                  onClick={() => updateStock(p.id, -1)}
                  className="btn-outline-gold text-sm"
                >
                  - Stock
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="btn-outline-gold text-sm hover-glow"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </FadeInWhenVisible>
    </div>
  );
}

export default Admin;
