"use client";

import PrivateRoute from "../../../components/PrivateRoute";
import AdminDashboard from "../../../screens/AdminDashboard";

export default function Page() {
  return (
    <PrivateRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </PrivateRoute>
  );
}
