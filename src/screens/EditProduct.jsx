import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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

function EditProduct({ id }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(imageOptions[0].id);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [hairType, setHairType] = useState(TYPE_OPTIONS[0]);
  const [length, setLength] = useState(LENGTH_OPTIONS[1]);
  const [colorFamily, setColorFamily] = useState(COLOR_OPTIONS[0]);
  const [collectionName, setCollectionName] = useState(COLLECTION_OPTIONS[0]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            name: data.name || "",
            description: data.description || "",
            price: data.price || 0,
            stock: data.stock || 0,
            popularity: data.popularity || 0,
            image: data.image || "",
          });

          const match =
            (data.imageKey &&
              PRESET_PRODUCT_IMAGES.find((img) => img.id === data.imageKey)) ||
            PRESET_PRODUCT_IMAGES.find((img) => img.url === data.image);
          if (match) {
            setSelectedImage(match.id);
            setCustomImageUrl("");
          } else {
            setSelectedImage("custom");
            setCustomImageUrl(data.image || "");
          }
          setCategory(data.category || CATEGORY_OPTIONS[0]);
          setHairType(data.hairType || TYPE_OPTIONS[0]);
          setLength(data.length || LENGTH_OPTIONS[1]);
          setColorFamily(data.colorFamily || COLOR_OPTIONS[0]);
          setCollectionName(data.collectionName || COLLECTION_OPTIONS[0]);
        } else {
          toast.error("Product not found.");
          router.push("/admin/products");
        }
      } catch (err) {
        toast.error("Error fetching product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  if (loading) return <p className="pt-28 pb-16 text-center text-gold">Loading...</p>;
  if (!product) return null;

  const resolvedImageUrl =
    selectedImage === "custom"
      ? customImageUrl.trim()
      : PRESET_PRODUCT_IMAGES.find((img) => img.id === selectedImage)?.url;

  const handleUpdate = async (e) => {
    e.preventDefault();
    const priceValue = Number(product.price);
    const stockValue = Number(product.stock);
    const popularityValue = Number(product.popularity);

    if ([priceValue, stockValue, popularityValue].some((v) => Number.isNaN(v))) {
      toast.error("Please enter valid numeric values.");
      return;
    }

    if (!resolvedImageUrl) {
      toast.error("Please select or provide an image.");
      return;
    }

    try {
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        name: product.name.trim(),
        description: product.description.trim(),
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
      });
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      toast.error("Failed to update product.");
    }
  };

  return (
    <div className="min-h-screen bg-burgundy text-gold flex justify-center items-center px-4 pt-36 pb-16">
      <form
        onSubmit={handleUpdate}
        className="bg-burgundy p-10 rounded-2xl shadow-gold/70 border border-gold/15 w-full max-w-xl"
      >
        <h2 className="text-3xl font-elegant mb-6 text-center">Update Product</h2>

        <input
          type="text"
          placeholder="Product Name"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          className="input-gold mb-4"
          required
        />

        <textarea
          placeholder="Description"
          value={product.description}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
          className="input-gold mb-4 h-24"
          required
        />

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price (Â£)"
          value={product.price}
          onChange={(e) => setProduct({ ...product, price: e.target.value })}
          className="input-gold mb-4"
          required
        />

        <input
          type="number"
          min="0"
          placeholder="Stock Quantity"
          value={product.stock}
          onChange={(e) => setProduct({ ...product, stock: e.target.value })}
          className="input-gold mb-4"
          required
        />

        <input
          type="number"
          min="0"
          max="100"
          placeholder="Popularity (1â€“100)"
          value={product.popularity}
          onChange={(e) => setProduct({ ...product, popularity: e.target.value })}
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

        <button type="submit" className="btn-gold w-full py-3 text-lg">
          Update Product
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
