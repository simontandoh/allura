"use client";

import PrivateRoute from "../../../components/PrivateRoute";
import AddProduct from "../../../screens/AddProduct";

export default function Page() {
  return (
    <PrivateRoute allowedRoles={["admin"]}>
      <AddProduct />
    </PrivateRoute>
  );
}
