import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", address: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setForm(snap.data());
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { ...form, email: user.email },
        { merge: true }
      );
      toast.success("Profile updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="bg-burgundy/40 p-8 rounded-2xl shadow-lg max-w-lg">
      <h2 className="text-3xl font-elegant mb-6">Edit Profile</h2>
      <form onSubmit={handleSave}>
        <label className="block mb-2 text-sm">Full Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="input-gold mb-4"
        />

        <label className="block mb-2 text-sm">Email</label>
        <input
          type="email"
          value={user.email}
          disabled
          className="input-gold mb-4 opacity-70 cursor-not-allowed"
        />

        <label className="block mb-2 text-sm">Address</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Shipping Address"
          className="input-gold h-24 mb-6"
        />

        <button type="submit" className="btn-gold w-full py-3 text-lg">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default Profile;
