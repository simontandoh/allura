"use client";

import PrivateRoute from "../../../../components/PrivateRoute";
import EditProduct from "../../../../screens/EditProduct";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  return (
    <PrivateRoute allowedRoles={["admin"]}>
      <EditProduct id={id} />
    </PrivateRoute>
  );
}
