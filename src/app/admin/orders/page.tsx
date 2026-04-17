"use client";

import PrivateRoute from "../../../components/PrivateRoute";
import AdminOrders from "../../../screens/AdminOrders";

export default function Page() {
  return (
    <PrivateRoute allowedRoles={["admin"]}>
      <AdminOrders />
    </PrivateRoute>
  );
}
