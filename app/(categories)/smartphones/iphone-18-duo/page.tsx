import IPhone18DuoClient from "./IPhone18DuoClient";
import { getCachedProducts } from "../../../lib/products-cache";

export const revalidate = 3600;

const KEYWORDS = ["ايفون 18 دو", "آيفون 18 دو", "iphone 18 duo", "iPhone 18 Duo", "iphone duo", "آيفون Duo", "ايفون Duo"];
const EXCLUDE = ["pro", "max", "برو", "ماكس"];

export default async function IPhone18DuoPage() {
  const allProducts = await getCachedProducts();
  const products = allProducts
    .filter((p: { category?: string; name?: string }) => {
      const haystack = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();
      const matches = KEYWORDS.some((kw) => haystack.includes(kw.toLowerCase()));
      const excluded = EXCLUDE.some((ex) => haystack.includes(ex.toLowerCase()));
      return matches && !excluded;
    })
    .sort((a: { salePrice?: number; originalPrice?: number }, b: { salePrice?: number; originalPrice?: number }) => {
      const priceA = a.salePrice ?? a.originalPrice ?? 0;
      const priceB = b.salePrice ?? b.originalPrice ?? 0;
      return priceA - priceB;
    });

  return <IPhone18DuoClient products={products} />;
}
