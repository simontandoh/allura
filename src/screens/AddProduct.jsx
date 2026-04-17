import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PRESET_PRODUCT_IMAGES } from "../constants/productImages.js";

const imageOptions = [
  ...PRESET_PRODUCT_IMAGES,
  { id: "custom", label: "Custom image URL" },
];

const CATEGORY_OPTIONS = ["Luxury Wigs", "Clip-Ins", "Tape-Ins", "Closures"];
const TYPE_OPTIONS = ["Straight", "Body Wave", "Deep Curl", "Kinky"];
const LENGTH_OPTIONS = ['14"', '18"', '22"', '26"'];
const COLOR_OPTIONS = ["Midnight", "Copper", "Brown", "Espresso"];
const COLLECTION_OPTIONS = ["Atelier", "Eclat", "Soiree"];

const AddProduct = ({ id } = {}) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [popularity, setPopularity] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(imageOptions[0].id);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [hairType, setHairType] = useState(TYPE_OPTIONS[0]);
  const [length, setLength] = useState(LENGTH_OPTIONS[1]);
  const [colorFamily, setColorFamily] = useState(COLOR_OPTIONS[0]);
  const [collectionName, setCollectionName] = useState(COLLECTION_OPTIONS[0]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const p = productSnap.data();
        setName(p.name || "");
        setDescription(p.description || "");
        setPrice(p.price || "");
        setStock(p.stock || "");
        setPopularity(p.popularity || 0);
        const match =
          p.imageKey && PRESET_PRODUCT_IMAGES.find((img) => img.id === p.imageKey)
            ? PRESET_PRODUCT_IMAGES.find((img) => img.id === p.imageKey)
            : PRESET_PRODUCT_IMAGES.find((img) => img.url === p.image);
        if (match) {
          setSelectedImage(match.id);
          setCustomImageUrl("");
        } else {
          setSelectedImage("custom");
          setCustomImageUrl(p.image || "");
        }
        setCategory(p.category || CATEGORY_OPTIONS[0]);
        setHairType(p.hairType || TYPE_OPTIONS[0]);
        setLength(p.length || LENGTH_OPTIONS[1]);
        setColorFamily(p.colorFamily || COLOR_OPTIONS[0]);
        setCollectionName(p.collectionName || COLLECTION_OPTIONS[0]);
        setIsEditing(true);
      }
    };
    fetchProduct();
  }, [id]);

  const resolvedImageUrl =
    selectedImage === "custom"
      ? customImageUrl.trim()
      : PRESET_PRODUCT_IMAGES.find((img) => img.id === selectedImage)?.url;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const priceValue = Number(price);
    const stockValue = Number(stock);
    const popularityValue = Number(popularity);

    if ([priceValue, stockValue, popularityValue].some((v) => Number.isNaN(v) || v < 0)) {
      toast.error("Please enter valid numeric values for price, stock, and popularity.");
      return;
    }

    if (!resolvedImageUrl) {
      toast.error("Please select or provide an image.");
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: priceValue,
      stock: stockValue,
      popularity: popularityValue,
      image: resolvedImageUrl,
      images: [resolvedImageUrl],
      imageKey: selectedImage !== "custom" ? selectedImage : null,
      category,
      hairType,
      length,
      colorFamily,
      collectionName,
    };

    try {
      if (isEditing) {
        await updateDoc(doc(db, "products", id), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        toast.success("Product updated successfully!");
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Product added successfully!");
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-burgundy text-gold flex justify-center items-center px-4 pt-36 pb-16">
      <form
        onSubmit={handleSubmit}
        className="bg-burgundy p-10 rounded-xl shadow-gold w-full max-w-lg border border-gold/15"
      >
        <h2 className="text-3xl font-elegant mb-6 text-center">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h2>

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
          placeholder="Price (Â£)"
          value={price}
          min="0"
          step="0.01"
          onChange={(e) => setPrice(e.target.value)}
          className="input-gold mb-4"
          required
        />

        <input
          type="number"
          placeholder="Stock Quantity"
          value={stock}
          min="0"
          onChange={(e) => setStock(e.target.value)}
          className="input-gold mb-4"
          required
        />

        <input
          type="number"
          placeholder="Popularity Score (1â€“100)"
          value={popularity}
          min="0"
          max="100"
          onChange={(e) => setPopularity(e.target.value)}
          className="input-gold mb-4"
          required
        />

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.4em] text-gold/70 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select-gold"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.4em] text-gold/70 mb-2">
              Collection
            </label>
            <select
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="select-gold"
            >
              {COLLECTION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.4em] text-gold/70 mb-2">
              Hair Type
            </label>
            <select
              value={hairType}
              onChange={(e) => setHairType(e.target.value)}
              className="select-gold"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.4em] text-gold/70 mb-2">
              Length
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="select-gold"
            >
              {LENGTH_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.4em] text-gold/70 mb-2">
              Color Family
            </label>
            <select
              value={colorFamily}
              onChange={(e) => setColorFamily(e.target.value)}
              className="select-gold"
            >
              {COLOR_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm">Product Image</label>
          <select
            value={selectedImage}
            onChange={(e) => setSelectedImage(e.target.value)}
            className="select-gold mb-3"
          >
            {imageOptions.map((img) => (
              <option value={img.id} key={img.id}>
                {img.label}
              </option>
            ))}
          </select>
          {selectedImage === "custom" && (
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="input-gold mb-3"
              required
            />
          )}
          <img
            src={
              selectedImage === "custom"
                ? customImageUrl || PRESET_PRODUCT_IMAGES[0].url
                : PRESET_PRODUCT_IMAGES.find((img) => img.id === selectedImage)?.url
            }
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gold/20"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full py-3 text-lg">
          {loading ? (isEditing ? "Updating..." : "Saving...") : isEditing ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
