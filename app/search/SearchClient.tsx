"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/products/ProductCard";
import type { Product } from "../components/products/types";

export default function SearchClient({ allProducts }: { allProducts: Product[] }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);

  const products = useMemo(() => {
    const term = query.toLowerCase();
    if (!term) return [];
    return allProducts.filter((p) =>
      p.name?.toLowerCase().includes(term) ||
      (p.brand as string | undefined)?.toLowerCase().includes(term) ||
      (p.category as string | undefined)?.toLowerCase().includes(term)
    );
  }, [allProducts, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        نتائج البحث عن: <span className="text-[#0F4C6E]">{query}</span>
      </h1>

      {products.length === 0 && query && (
        <p className="text-center text-gray-500 py-20">لا توجد منتجات تطابق بحثك</p>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
