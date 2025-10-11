import React, { useState } from "react";
import { db, storage } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [popularity, setPopularity] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error("Please select an image.");
    setLoading(true);

    try {
      const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "products"), {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        popularity: parseInt(popularity),
        image: imageUrl,
        createdAt: serverTimestamp(),
      });

      toast.success("Product added successfully!");
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setPopularity("");
      setImage(null);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-burgundy text-gold flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-[#3B0010] p-10 rounded-xl shadow-gold w-full max-w-lg"
      >
        <h2 className="text-3xl font-elegant mb-6 text-center">Add New Product</h2>

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-gold mb-4"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-gold mb-4 h-24"
          required
        />
        <input
          type="number"
          placeholder="Price (£)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input-gold mb-4"
          required
        />
        <input
          type="number"
          placeholder="Stock Quantity"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="input-gold mb-4"
          required
        />
        <input
          type="number"
          placeholder="Popularity Score (1–100)"
          value={popularity}
          onChange={(e) => setPopularity(e.target.value)}
          className="input-gold mb-4"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-6 text-sm text-gold"
          required
        />

        <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-lg">
          {loading ? "Uploading..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
