import IPhone18ProMaxClient from "./IPhone18ProMaxClient";
import { getCachedProducts } from "../../../lib/products-cache";

export const revalidate = 3600;

const KEYWORDS = [
  "ايفون 18 برو ماكس",
  "iphone 18 pro max",
  "iPhone 18 Pro Max",
  "آيفون 18 برو ماكس"
];

export default async function IPhone18ProMaxPage() {
  const allProducts = await getCachedProducts();
  const products = allProducts
    .filter((p: { category?: string; name?: string }) =>
      KEYWORDS.some(
        (kw) =>
          p.category?.toLowerCase().includes(kw.toLowerCase()) ||
          p.name?.toLowerCase().includes(kw.toLowerCase())
      )
    )
    .sort((a: { name?: string }, b: { name?: string }) => {
      const rank = (name: string = "") => {
        const n = name.toLowerCase();
        if (n.includes("pro max")) return 0;
        if (n.includes("pro")) return 1;
        return 2;
      };
      return rank(a.name) - rank(b.name);
    });

  return <IPhone18ProMaxClient products={products} />;
}
