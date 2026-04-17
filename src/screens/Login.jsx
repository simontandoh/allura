import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
// Use plain <a> to avoid Next/link export edge cases in this environment.
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

async function getOrCreateUserRole(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data().role || "customer";
  }

  const defaultRole = user.email === "admin@allura.co.uk" ? "admin" : "customer";
  await setDoc(userRef, {
    email: user.email,
    name: user.displayName || "",
    role: defaultRole,
    createdAt: serverTimestamp(),
  });
  return defaultRole;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const routeByRole = (role) => {
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard/profile");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const role = await getOrCreateUserRole(userCredential.user);
      toast.success("Welcome back!");
      routeByRole(role);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const role = await getOrCreateUserRole(result.user);
      toast.success("Signed in with Google");
      routeByRole(role);
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google sign-in was cancelled or blocked.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-burgundy text-gold px-4">
      <div className="bg-burgundy p-10 rounded-2xl shadow-gold w-full max-w-lg">
        <h2 className="text-4xl font-elegant mb-2 text-center">Welcome back</h2>
        <p className="text-center opacity-80 mb-8">
          Sign in to manage your orders, subscriptions, and VIP benefits.
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-gold"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-gold"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3 text-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-4 py-3 border border-gold/40 rounded-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition"
        >
          <FcGoogle size={22} />
          <span>Continue with Google</span>
        </button>

        <p className="text-center mt-6 text-sm text-gold/80">
          Need an account?{" "}
          <a href="/register" className="text-gold font-semibold underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
