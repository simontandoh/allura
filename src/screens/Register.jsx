import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
// Use plain <a> to avoid Next/link export edge cases in this environment.
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

async function ensureUserDocument(user, nameOverride) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) return snapshot.data();

  const inferredRole = user.email === "admin@allura.co.uk" ? "admin" : "customer";

  await setDoc(userRef, {
    email: user.email,
    name: nameOverride || user.displayName || "",
    role: inferredRole,
    createdAt: serverTimestamp(),
  });

  return { role: inferredRole };
}

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const credential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      if (form.name) {
        await updateProfile(credential.user, { displayName: form.name });
      }
      await ensureUserDocument(credential.user, form.name);
      toast.success("Welcome to Allura!");
      router.push("/dashboard/profile");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const data = await ensureUserDocument(result.user);
      toast.success("Signed in with Google");
      if (data?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard/profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-burgundy text-gold px-4">
      <div className="bg-burgundy p-10 rounded-2xl shadow-gold w-full max-w-lg">
        <h2 className="text-4xl font-elegant mb-2 text-center">Create Account</h2>
        <p className="text-center opacity-80 mb-8">
          Join the Allura club for bespoke drops and faster checkout.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="input-gold"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="input-gold"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            className="input-gold"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="input-gold"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 text-lg"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gold/30" />
          <span className="text-xs uppercase tracking-[0.3em] text-gold/70">
            or
          </span>
          <div className="flex-1 h-px bg-gold/30" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full py-3 border border-gold/40 rounded-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition"
        >
          <FcGoogle size={22} />
          <span>Continue with Google</span>
        </button>

        <p className="text-center mt-6 text-sm text-gold/80">
          Already have an account?{" "}
          <a href="/login" className="text-gold font-semibold underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
