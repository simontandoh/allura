"use client";

import PrivateRoute from "../../../components/PrivateRoute";
import AdminProducts from "../../../screens/AdminProducts";

export default function Page() {
  return (
    <PrivateRoute allowedRoles={["admin"]}>
      <AdminProducts />
    </PrivateRoute>
  );
}
