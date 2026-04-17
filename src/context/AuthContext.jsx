import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setRole(null);
        setLoadingUser(false);
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          const defaultRole =
            currentUser.email === "admin@allura.co.uk" ? "admin" : "customer";
          await setDoc(userRef, {
            email: currentUser.email,
            name: currentUser.displayName || "",
            role: defaultRole,
            createdAt: new Date(),
          });
          setRole(defaultRole);
        } else {
          const data = snap.data();
          setRole(data.role || "customer");
        }

        setUser(currentUser);
      } catch (err) {
        console.error("AuthContext error:", err);
      }

      setLoadingUser(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, logout, loadingUser }}>
      {!loadingUser && children}
    </AuthContext.Provider>
  );
}
