"use client";

import { useMemo, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "../../components/products/ProductCard";
import type { Product } from "../../components/products/types";
import { slugConfigs } from "../../lib/categoryConfig";
import { IoGridOutline, IoChevronBack, IoChevronForward, IoHome } from "react-icons/io5";

function filterProducts(products: Product[], slug: string): Product[] {
  const config = slugConfigs[slug];
  if (!config) return products;
  const { brand, category, nameIncludes } = config.filters;
  return products.filter((p) => {
    const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
    const matchCategory = category ? p.category?.trim().toLowerCase() === category.trim().toLowerCase() : false;
    const matchName = nameIncludes?.length
      ? nameIncludes.some((kw) => p.name?.toLowerCase().includes(kw.toLowerCase()))
      : false;
    if (nameIncludes?.length && category) return (matchBrand && matchName) || matchCategory;
    if (nameIncludes?.length) return matchBrand && matchName;
    if (category) return matchCategory;
    return matchBrand;
  });
}

export default function CategoryPageClient({ slug, initialProducts }: { slug: string; initialProducts: Product[] }) {
  const config = slugConfigs[slug];
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const products = useMemo(() => {
    if (!config) return [];
    const filtered = filterProducts(initialProducts, slug);
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
    return [...filtered].sort((a, b) => {
      const storageDiff = parseStorage(a.storage) - parseStorage(b.storage);
      return storageDiff !== 0 ? storageDiff : colorOrder(a.color) - colorOrder(b.color);
    });
  }, [initialProducts, slug, config]);

  if (!config) return notFound();

  const label = config.label ?? slug;
  const parentLabel = config.parentLabel ?? "";
  const parentHref = config.parentHref ?? "/";
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);



  return (
    <>
      <style>{`
        @keyframes heroGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hero-cat {
          background: linear-gradient(-45deg, #0a3550, #1F7A8C, #155E6F, #0d4a5e);
          background-size: 300% 300%;
          animation: heroGradient 8s ease infinite;
        }
        .slide-up { animation: slideUp 0.5s ease forwards; }
        .card-reveal { animation: cardReveal 0.45s ease forwards; }
        .particle-cat {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          animation: floatParticle linear infinite;
        }
        .feature-strip-cat::-webkit-scrollbar { display: none; }
        .feature-strip-cat { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f7f9" }}>
        {/* Hero Banner */}
        <div className="hero-cat relative overflow-hidden">
          {/* Particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="particle-cat" style={{
              left: `${10 + (i * 11) % 80}%`,
              bottom: "0",
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              animationDuration: `${3 + (i % 4) * 1.2}s`,
              animationDelay: `${(i * 0.5) % 3}s`,
            }} />
          ))}

          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 pt-6 sm:pt-10 pb-12 sm:pb-16">
            {/* Breadcrumb */}
            <div className="slide-up flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6">
              <Link href="/" className="text-white/60 hover:text-white/90 transition flex items-center gap-1">
                <IoHome size={13} />
                الرئيسية
              </Link>
              <IoChevronBack size={12} className="text-white/30" />
              <Link href={parentHref} className="text-white/60 hover:text-white/90 transition">{parentLabel}</Link>
              <IoChevronBack size={12} className="text-white/30" />
              <span className="text-white font-semibold">{label}</span>
            </div>

            {/* Title */}
            <div className="slide-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3" style={{ animationDelay: "0.1s" }}>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">{label}</h1>
                <p className="text-sm sm:text-base text-white/60 mt-1.5">
                  {`${products.length} منتج متوفر`}
                </p>
              </div>
              {products.length > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 self-start sm:self-auto">
                  <IoGridOutline size={14} className="text-white/70" />
                  <span className="text-xs text-white/70 font-medium">صفحة {page} من {totalPages || 1}</span>
                </div>
              )}
            </div>
          </div>

          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 50" fill="none" className="w-full" preserveAspectRatio="none">
              <path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,30 1440,25 L1440,50 L0,50 Z" fill="#f5f7f9" />
            </svg>
          </div>
        </div>



        {/* Products Grid */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
          {!products.length ? (
            <div className="flex flex-col items-center justify-center py-20 sm:py-28 gap-4 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#1F7A8C]/10 to-[#1F7A8C]/5 flex items-center justify-center">
                <span className="text-4xl sm:text-5xl">📦</span>
              </div>
              <p className="text-gray-600 text-base sm:text-lg font-bold">المنتجات ستُضاف قريباً</p>
              <p className="text-gray-400 text-sm">هذا القسم قيد التحضير، تابعنا للمزيد</p>
              <Link href="/" className="mt-2 text-sm text-white bg-[#1F7A8C] hover:bg-[#155E6F] px-6 py-2.5 rounded-xl font-bold transition">
                ← العودة إلى الرئيسية
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((p, i) => (
                  <div key={p._id} className="card-reveal" style={{ animationDelay: `${0.04 * i}s` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#1F7A8C] hover:text-[#1F7A8C] transition shadow-sm"
                  >
                    <IoChevronForward size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-bold transition shadow-sm ${
                        page === n
                          ? "bg-[#1F7A8C] text-white border border-[#1F7A8C] shadow-md shadow-[#1F7A8C]/20"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-[#1F7A8C] hover:text-[#1F7A8C]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#1F7A8C] hover:text-[#1F7A8C] transition shadow-sm"
                  >
                    <IoChevronBack size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
