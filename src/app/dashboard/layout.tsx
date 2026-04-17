"use client";

import PrivateRoute from "../../components/PrivateRoute";
import CustomerDashboard from "../../screens/CustomerDashboard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute allowedRoles={["customer", "admin"]}>
      <CustomerDashboard>{children}</CustomerDashboard>
    </PrivateRoute>
  );
}
