import { Suspense } from "react";
import SearchClient from "./SearchClient";
import { getCachedProducts } from "../lib/products-cache";

export const revalidate = false;

export default async function SearchPage() {
  const products = await getCachedProducts();
  return (
    <Suspense>
      <SearchClient allProducts={products} />
    </Suspense>
  );
}
