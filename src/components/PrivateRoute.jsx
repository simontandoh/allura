import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth.js";

function PrivateRoute({ children, allowedRoles }) {
  const { user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (allowedRoles && !allowedRoles.includes(role)) router.replace("/");
  }, [allowedRoles, role, router, user]);

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(role)) return null;

  return children;
}

export default PrivateRoute;
