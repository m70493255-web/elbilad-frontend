"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "../../components/products/ProductCard";
import type { Product } from "../../components/products/types";
import { IoGridOutline, IoChevronBack, IoChevronForward, IoHome } from "react-icons/io5";

const PS_CATEGORIES = ["ps5", "ps4", "xbox", "controller", "gaming-accessories", "بلاي ستيشن", "بلاستيشن وملحقاته"];

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "ps5", label: "PS5" },
  { key: "ps4", label: "PS4" },
];

function isPS(p: Product) {
  const cat = (p.category ?? "").toLowerCase();
  const sub = (p.subCategory ?? "").toLowerCase();
  return PS_CATEGORIES.some((c) => cat.includes(c.toLowerCase()) || sub.includes(c.toLowerCase()));
}

function matchFilter(p: Product, key: string) {
  const cat  = (p.category    ?? "").toLowerCase();
  const sub  = (p.subCategory ?? "").toLowerCase();
  const name = (p.name        ?? "").toLowerCase();
  if (key === "ps5") return cat.includes("ps5") || sub.includes("ps5") || name.includes("ps5") || name.includes("بلاي ستيشن 5");
  if (key === "ps4") return cat.includes("ps4") || sub.includes("ps4") || name.includes("ps4") || name.includes("بلاي ستيشن 4");
  return true;
}

export default function PlaystationClient({ initialProducts }: { initialProducts: Product[] }) {
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const ITEMS_PER_PAGE = 12;

  const allProducts = useMemo(
    () => initialProducts.filter(isPS),
    [initialProducts]
  );

  const products = useMemo(
    () => activeFilter === "all" ? allProducts : allProducts.filter((p) => matchFilter(p, activeFilter)),
    [allProducts, activeFilter]
  );

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const label = "أجهزة بلاي ستيشن";

  function handleFilter(key: string) {
    setActiveFilter(key);
    setPage(1);
  }



  return (
    <>
      <style>{`
        @keyframes heroGradient { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes floatParticle { 0%{transform:translateY(0) scale(1);opacity:.3} 50%{opacity:.6} 100%{transform:translateY(-100px) scale(.5);opacity:0} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardReveal { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .hero-cat{background:linear-gradient(-45deg,#0a3550,#1F7A8C,#155E6F,#0d4a5e);background-size:300% 300%;animation:heroGradient 8s ease infinite}
        .slide-up{animation:slideUp .5s ease forwards} .card-reveal{animation:cardReveal .45s ease forwards}
        .particle-cat{position:absolute;border-radius:50%;background:rgba(255,255,255,.15);animation:floatParticle linear infinite}
        .feature-strip-cat::-webkit-scrollbar{display:none} .feature-strip-cat{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f7f9" }}>
        <div className="hero-cat relative overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (<div key={i} className="particle-cat" style={{ left: `${10 + (i * 11) % 80}%`, bottom: "0", width: `${4 + (i % 3) * 2}px`, height: `${4 + (i % 3) * 2}px`, animationDuration: `${3 + (i % 4) * 1.2}s`, animationDelay: `${(i * 0.5) % 3}s` }} />))}
          <div className="absolute top-0 left-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 pt-6 sm:pt-10 pb-12 sm:pb-16">
            <div className="slide-up flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6">
              <Link href="/" className="text-white/60 hover:text-white/90 transition flex items-center gap-1"><IoHome size={13} />الرئيسية</Link>
              <IoChevronBack size={12} className="text-white/30" />
              <span className="text-white font-semibold">{label}</span>
            </div>
            <div className="slide-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3" style={{ animationDelay: "0.1s" }}>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">{label}</h1>
                <p className="text-sm sm:text-base text-white/60 mt-1.5">{`${products.length} منتج متوفر`}</p>
              </div>
              {products.length > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 self-start sm:self-auto">
                  <IoGridOutline size={14} className="text-white/70" /><span className="text-xs text-white/70 font-medium">صفحة {page} من {totalPages || 1}</span>
                </div>
              )}
            </div>
          </div>
          {/* Filter Pills inside hero */}
          <div className="relative z-10 hidden justify-center gap-2 pb-8">
            {FILTERS.map((f) => {
              const count = f.key === "all" ? allProducts.length : allProducts.filter((p) => matchFilter(p, f.key)).length;
              const active = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => handleFilter(f.key)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                    active
                      ? "bg-white text-[#1F7A8C] shadow-lg scale-105"
                      : "bg-white/15 text-white border border-white/30 hover:bg-white/25"
                  }`}
                >
                  {f.label}
                  <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${
                    active ? "bg-[#1F7A8C]/10 text-[#1F7A8C]" : "bg-white/20 text-white"
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="absolute bottom-0 left-0 right-0"><svg viewBox="0 0 1440 50" fill="none" className="w-full" preserveAspectRatio="none"><path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,30 1440,25 L1440,50 L0,50 Z" fill="#f5f7f9" /></svg></div>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
          {!products.length ? (
            <div className="flex flex-col items-center justify-center py-20 sm:py-28 gap-4 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#1F7A8C]/10 to-[#1F7A8C]/5 flex items-center justify-center"><span className="text-4xl sm:text-5xl">🎮</span></div>
              <p className="text-gray-600 text-base sm:text-lg font-bold">المنتجات ستُضاف قريباً</p>
              <p className="text-gray-400 text-sm">هذا القسم قيد التحضير، تابعنا للمزيد</p>
              <Link href="/" className="mt-2 text-sm text-white bg-[#1F7A8C] hover:bg-[#155E6F] px-6 py-2.5 rounded-xl font-bold transition">← العودة إلى الرئيسية</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((p, i) => (<div key={p._id} className="card-reveal" style={{ animationDelay: `${0.04 * i}s` }}><ProductCard product={p} /></div>))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
                  <button onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={page === 1} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#1F7A8C] hover:text-[#1F7A8C] transition shadow-sm"><IoChevronForward size={16} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (<button key={n} onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-bold transition shadow-sm ${page === n ? "bg-[#1F7A8C] text-white border border-[#1F7A8C] shadow-md shadow-[#1F7A8C]/20" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1F7A8C] hover:text-[#1F7A8C]"}`}>{n}</button>))}
                  <button onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={page === totalPages} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#1F7A8C] hover:text-[#1F7A8C] transition shadow-sm"><IoChevronBack size={16} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
