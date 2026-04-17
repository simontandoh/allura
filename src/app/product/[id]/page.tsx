"use client";

import ProductDetail from "../../../screens/ProductDetail";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";
  return <ProductDetail id={id} />;
}
