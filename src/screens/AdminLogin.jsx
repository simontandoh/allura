import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "admin") {
        toast.error("Access denied. This is an admin-only portal.");
        setLoading(false);
        return;
      }

      toast.success("Welcome back, Admin!");
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials or no admin access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen pt-28 bg-burgundy text-gold">
      <form
        onSubmit={handleAdminLogin}
        className="bg-burgundy p-10 rounded-xl shadow-gold w-full max-w-md"
      >
        <h2 className="text-3xl font-elegant mb-6 text-center">Admin Portal</h2>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-gold mb-4"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-gold mb-6"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full py-3 text-lg"
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;

