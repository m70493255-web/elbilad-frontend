"use client";
import { useMemo, memo } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "./types";
import CategoryBanner from "../banner/CategoryBanner";
import { resolveHref } from "../../lib/resolveHref";

const LIMIT = 4;

const iphone18Keywords = ["ايفون 18", "iphone 18", "آيفون 18"];

const CategoryRow = memo(function CategoryRow({ category, items, isFirst }: { category: string; items: Product[]; isFirst?: boolean }) {
  const visible = items.slice(0, LIMIT);
  const href = resolveHref(category);
  const isIphone18 = iphone18Keywords.some((kw) => category.toLowerCase().includes(kw.toLowerCase()));

  return (
    <div className="mb-8 sm:mb-12">
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-5 sm:mb-7" dir="rtl">
        <div className="w-1 sm:w-1.5 h-6 sm:h-8 rounded-full bg-gradient-to-b from-[#1F7A8C] to-[#155E6F]" />
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold text-gray-800 whitespace-nowrap">{category}</h2>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-transparent" />
        <Link
          href={href}
          className="text-[10px] sm:text-xs font-semibold text-[#1F7A8C] hover:text-white whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#1F7A8C]/40 hover:bg-[#1F7A8C] transition-all duration-300"
        >
          عرض الكل ←
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {visible.map((p, i) => (
          <ProductCard key={p._id} product={p} priority={isFirst && i === 0} largeImage={isIphone18} />
        ))}
      </div>
    </div>
  );
});

type HomeSettings = { category: string; subCategory: string; showInHome: boolean; order: number };
type HomeConfig = { settings: HomeSettings[]; max: number };

export default function ProductGrid({
  products,
  homeConfig,
  bannerMap,
}: {
  products: Product[];
  homeConfig: HomeConfig | null;
  bannerMap: Record<string, string[]>;
}) {
  const grouped = useMemo(() => {
    const map: Record<string, Product[]> = {};
    products.forEach((p) => {
      const cat = p.category || "أخرى";
      (map[cat] ??= []).push(p);
    });
    // Sort each category the same way as the category page (storage → color)
    const parseStorage = (s?: string) => {
      if (!s) return 0;
      const n = parseFloat(s);
      if (s.includes("تيرا") || s.toLowerCase().includes("tb")) return n * 1024;
      return n || 0;
    };
    const colorOrder = (c?: string) => {
      if (!c) return 99;
      if (c.includes("برتقال") || c.toLowerCase().includes("orange")) return 0;
      if (c.includes("سيلفر") || c.toLowerCase().includes("silver")) return 1;
      if (c.includes("ازرق") || c.includes("أزرق") || c.toLowerCase().includes("blue")) return 2;
      return 3;
    };
    const iphone18Keywords = ["ايفون 18", "iphone 18", "آيفون 18"];
    for (const cat of Object.keys(map)) {
      const isIphone18 = iphone18Keywords.some((kw) => cat.toLowerCase().includes(kw.toLowerCase()));
      if (isIphone18) {
        map[cat].sort((a, b) => {
          const priceA = a.salePrice ?? a.originalPrice ?? a.price ?? 0;
          const priceB = b.salePrice ?? b.originalPrice ?? b.price ?? 0;
          return priceA - priceB;
        });
      } else {
        map[cat].sort((a, b) => {
          const storageDiff = parseStorage(a.storage) - parseStorage(b.storage);
          if (storageDiff !== 0) return storageDiff;
          return colorOrder(a.color) - colorOrder(b.color);
        });
      }
    }
    return map;
  }, [products]);

  // If no settings configured yet, show all. Otherwise filter & sort by settings.
  const orderedCategories = useMemo(() => {
    const allCats = Object.keys(grouped).filter((c) => c !== "أخرى");
    if (!homeConfig) return allCats;
    const { settings, max } = homeConfig;
    const visibleSettings = settings.filter((s) => s.showInHome);
    if (visibleSettings.length === 0) return allCats;
    const orderedCats = visibleSettings
      .sort((a, b) => a.order - b.order)
      .slice(0, max)
      .map((s) => s.category)
      .filter((c, idx, arr) => arr.indexOf(c) === idx)
      .filter((c) => allCats.some((ac) => ac === c || ac.trim() === c.trim()));
    return orderedCats;
  }, [grouped, homeConfig]);

  if (!products.length) return <p className="text-center text-gray-400 py-10">لا توجد منتجات حالياً</p>;

  return (
    <section className="w-full py-6 sm:py-8 overflow-hidden">
    <div className="max-w-6xl mx-auto px-3 sm:px-4">
      {orderedCategories.map((category, catIdx) => (
        <div key={category}>
          <div className="-mx-3 sm:-mx-4 mb-4 sm:mb-6 border-t border-gray-100 pt-4 sm:pt-6">
            <CategoryBanner category={category} images={bannerMap[category]} />
          </div>
          <CategoryRow category={category} items={grouped[category]} isFirst={catIdx === 0} />
        </div>
      ))}
    </div>
    </section>
  );
}
