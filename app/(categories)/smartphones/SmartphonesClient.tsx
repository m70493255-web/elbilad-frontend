"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "../../components/products/ProductCard";
import type { Product } from "../../components/products/types";
import {
  IoGridOutline,
  IoChevronBack,
  IoChevronForward,
  IoHome,
  IoPhonePortraitOutline,
  IoCloseCircle,
  IoSearchOutline,
} from "react-icons/io5";

interface ModelFilterDef {
  id: string;
  label: string;
  brand: "apple" | "samsung";
  match: (p: Product) => boolean;
}

import { isSmartphone } from "../../lib/phoneUtils";


// ─── Navbar Phone Sorting Rank ─────────────────────────────────────
function getNavbarPhoneRank(p: Product): number {
  const text = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();

  // iPhone 18 series
  if (text.includes("18 برو ماكس") || text.includes("18 pro max")) return 1;
  if (text.includes("18 برو") || text.includes("18 pro")) return 2;
  if (text.includes("18 دو") || text.includes("18 duo") || text.includes("duo")) return 3;

  // iPhone 17 series
  if (text.includes("17 برو ماكس") || text.includes("17 pro max")) return 4;
  if (text.includes("17 برو") || text.includes("17 pro")) return 5;
  if (text.includes("17 اير") || text.includes("17 air")) return 6;
  if (text.includes("17")) return 7;

  // iPhone 16 series
  if (text.includes("16 برو ماكس") || text.includes("16 pro max")) return 8;
  if (text.includes("16 برو") || text.includes("16 pro")) return 9;
  if (text.includes("16 بلس") || text.includes("16 plus")) return 10;
  if (text.includes("16")) return 11;

  // iPhone 15 series
  if (text.includes("15 برو ماكس") || text.includes("15 pro max")) return 12;
  if (text.includes("15 برو") || text.includes("15 pro")) return 13;
  if (text.includes("15 بلس") || text.includes("15 plus")) return 14;
  if (text.includes("15")) return 15;

  // iPhone 14 series
  if (text.includes("14 برو ماكس") || text.includes("14 pro max")) return 16;
  if (text.includes("14 برو") || text.includes("14 pro")) return 17;
  if (text.includes("14 بلس") || text.includes("14 plus")) return 18;
  if (text.includes("14")) return 19;

  // iPhone 13 series
  if (text.includes("13 برو ماكس") || text.includes("13 pro max")) return 20;
  if (text.includes("13")) return 21;

  // Other iPhones
  if (text.includes("ايفون") || text.includes("iphone")) return 25;

  // Samsung Galaxy S series
  if (text.includes("s26") || (text.includes("26") && !text.includes("256"))) return 30;
  if ((text.includes("s25") || text.includes(" 25 ")) && (text.includes("الترا") || text.includes("ultra"))) return 31;
  if (text.includes("s25") || (text.includes(" 25") && !text.includes("256"))) return 32;
  if ((text.includes("s24") || text.includes(" 24 ")) && (text.includes("الترا") || text.includes("ultra"))) return 33;
  if (text.includes("s24") || text.includes(" 24")) return 34;
  if ((text.includes("s23") || text.includes(" 23 ")) && (text.includes("الترا") || text.includes("ultra"))) return 35;
  if (text.includes("s23") || text.includes(" 23")) return 36;
  if ((text.includes("s22") || text.includes(" 22 ")) && (text.includes("الترا") || text.includes("ultra"))) return 37;
  if (text.includes("s22") || text.includes(" 22")) return 38;

  if (
    text.includes("سامسونج") ||
    text.includes("samsung") ||
    text.includes("galaxy") ||
    text.includes("جالكسي") ||
    text.includes("جلاكسي") ||
    text.includes("جالاكسي")
  ) {
    return 40;
  }

  return 99;
}

// ─── Storage Extraction ────────────────────────────────────────────
function parsePhoneStorage(p: Product): number {
  const text = `${p.storage ?? ""} ${p.name ?? ""}`.toLowerCase();
  if (text.includes("2 تيرابايت") || text.includes("2tb") || text.includes("2 tb") || text.includes("2 تيرا")) return 2048;
  if (text.includes("تيرابايت") || text.includes("1tb") || text.includes("1 tb") || text.includes("1 تيرا") || text.includes("تيرا")) return 1024;
  if (text.includes("512")) return 512;
  if (text.includes("256")) return 256;
  if (text.includes("128")) return 128;
  return 0;
}

function parsePhoneColorOrder(c?: string): number {
  if (!c) return 99;
  const lower = c.toLowerCase();
  if (lower.includes("برغندي") || lower.includes("صحراوي")) return 0;
  if (lower.includes("أسود") || lower.includes("اسود") || lower.includes("black")) return 1;
  if (lower.includes("أبيض") || lower.includes("ابيض") || lower.includes("white")) return 2;
  if (lower.includes("فضي") || lower.includes("سيلفر") || lower.includes("silver")) return 3;
  if (lower.includes("جليدي")) return 4;
  if (lower.includes("أزرق") || lower.includes("ازرق") || lower.includes("blue")) return 5;
  return 6;
}

// ─── Samsung series helper ─────────────────────────────────────────
function matchSamsungSeries(p: Product, num: number): boolean {
  const t = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();
  const isSam =
    t.includes("سامسونج") ||
    t.includes("samsung") ||
    t.includes("galaxy") ||
    t.includes("جالكسي") ||
    t.includes("جلاكسي") ||
    t.includes("جالاكسي");
  if (!isSam) return false;
  const regex = new RegExp(`(s|اس|جالاكسي|جلاكسي|جالكسي)\\s*${num}(?!\\d)|${num}\\s*(الترا|ultra|plus|بلس|عادي|،|\\s|$)`, "i");
  return regex.test(t);
}

// ─── Model Filter Definitions ──────────────────────────────────────
const MODEL_FILTERS: ModelFilterDef[] = [
  {
    id: "iphone-18-pro-max",
    label: "🆕 آيفون 18 برو ماكس",
    brand: "apple",
    match: (p) => `${p.category ?? ""} ${p.name ?? ""}`.includes("18 برو ماكس"),
  },
  {
    id: "iphone-18-pro",
    label: "🆕 آيفون 18 برو",
    brand: "apple",
    match: (p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`;
      return t.includes("18 برو") && !t.includes("18 برو ماكس");
    },
  },
  {
    id: "iphone-18-duo",
    label: "🆕 آيفون 18 Duo",
    brand: "apple",
    match: (p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();
      return t.includes("18 دو") || t.includes("duo");
    },
  },
  {
    id: "iphone-17-pro-max",
    label: "آيفون 17 برو ماكس",
    brand: "apple",
    match: (p) => `${p.category ?? ""} ${p.name ?? ""}`.includes("17 برو ماكس"),
  },
  {
    id: "iphone-17-pro",
    label: "آيفون 17 برو",
    brand: "apple",
    match: (p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`;
      return t.includes("17 برو") && !t.includes("17 برو ماكس");
    },
  },
  {
    id: "iphone-17-air",
    label: "آيفون 17 Air",
    brand: "apple",
    match: (p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();
      return t.includes("17 اير") || t.includes("17 air");
    },
  },
  {
    id: "iphone-17",
    label: "آيفون 17 عادي",
    brand: "apple",
    match: (p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();
      return (t.includes("ايفون 17") || t.includes("iphone 17")) && !t.includes("برو") && !t.includes("اير") && !t.includes("air");
    },
  },
  {
    id: "iphone-16-pro-max",
    label: "آيفون 16 برو ماكس",
    brand: "apple",
    match: (p) => `${p.category ?? ""} ${p.name ?? ""}`.includes("16 برو ماكس"),
  },
  {
    id: "iphone-16-pro",
    label: "آيفون 16 برو",
    brand: "apple",
    match: (p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`;
      return t.includes("16 برو") && !t.includes("16 برو ماكس");
    },
  },
  {
    id: "iphone-16-plus",
    label: "آيفون 16 بلس",
    brand: "apple",
    match: (p) => `${p.category ?? ""} ${p.name ?? ""}`.includes("16 بلس"),
  },
  {
    id: "iphone-16",
    label: "آيفون 16 عادي",
    brand: "apple",
    match: (p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();
      return (t.includes("ايفون 16") || t.includes("iphone 16")) && !t.includes("برو") && !t.includes("بلس");
    },
  },
  {
    id: "iphone-15-pro-max",
    label: "آيفون 15 برو ماكس",
    brand: "apple",
    match: (p) => `${p.category ?? ""} ${p.name ?? ""}`.includes("15 برو ماكس"),
  },
  {
    id: "iphone-15-plus",
    label: "آيفون 15 بلس",
    brand: "apple",
    match: (p) => `${p.category ?? ""} ${p.name ?? ""}`.includes("15 بلس"),
  },
  {
    id: "iphone-14-pro-max",
    label: "آيفون 14 برو ماكس",
    brand: "apple",
    match: (p) => `${p.category ?? ""} ${p.name ?? ""}`.includes("14 برو ماكس"),
  },
  {
    id: "iphone-14-pro",
    label: "آيفون 14 برو",
    brand: "apple",
    match: (p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`;
      return t.includes("14 برو") && !t.includes("14 برو ماكس");
    },
  },
  {
    id: "samsung-s26",
    label: "سامسونج S26 الترا",
    brand: "samsung",
    match: (p) => matchSamsungSeries(p, 26),
  },
  {
    id: "samsung-s25",
    label: "سامسونج S25 الترا",
    brand: "samsung",
    match: (p) => matchSamsungSeries(p, 25),
  },
  {
    id: "samsung-s24",
    label: "سامسونج S24 الترا",
    brand: "samsung",
    match: (p) => matchSamsungSeries(p, 24),
  },
  {
    id: "samsung-s23",
    label: "سامسونج S23 الترا",
    brand: "samsung",
    match: (p) => matchSamsungSeries(p, 23),
  },
  {
    id: "samsung-s22",
    label: "سامسونج S22 الترا",
    brand: "samsung",
    match: (p) => matchSamsungSeries(p, 22),
  },
];

export default function SmartphonesClient({
  initialProducts,
  reserveMode = false,
}: {
  initialProducts: Product[];
  reserveMode?: boolean;
}) {
  const [selectedBrand, setSelectedBrand] = useState<"all" | "apple" | "samsung">("all");
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // 1. Strictly isolate phones from other catalog items
  const allPhones = useMemo(() => {
    return initialProducts.filter(isSmartphone);
  }, [initialProducts]);

  // 2. Compute available counts per model
  const modelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of MODEL_FILTERS) {
      counts[m.id] = allPhones.filter(m.match).length;
    }
    return counts;
  }, [allPhones]);

  const appleTotalCount = useMemo(() => {
    return allPhones.filter((p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();
      return t.includes("ايفون") || t.includes("iphone") || p.brand?.toLowerCase() === "apple";
    }).length;
  }, [allPhones]);

  const samsungTotalCount = useMemo(() => {
    return allPhones.filter((p) => {
      const t = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();
      return (
        t.includes("سامسونج") ||
        t.includes("samsung") ||
        t.includes("جالاكسي") ||
        t.includes("جالكسي") ||
        t.includes("جلاكسي") ||
        t.includes("galaxy")
      );
    }).length;
  }, [allPhones]);

  // 3. Filter products by Brand, Model, and Search
  const filteredProducts = useMemo(() => {
    return allPhones.filter((p) => {
      const text = `${p.category ?? ""} ${p.name ?? ""}`.toLowerCase();
      const isApple = text.includes("ايفون") || text.includes("iphone") || p.brand?.toLowerCase() === "apple";
      const isSamsung =
        text.includes("سامسونج") ||
        text.includes("samsung") ||
        text.includes("جالاكسي") ||
        text.includes("جالكسي") ||
        text.includes("جلاكسي") ||
        text.includes("galaxy");

      // Brand filter
      if (selectedBrand === "apple" && !isApple) return false;
      if (selectedBrand === "samsung" && !isSamsung) return false;

      // Model filter
      if (selectedModel !== "all") {
        const filterDef = MODEL_FILTERS.find((m) => m.id === selectedModel);
        if (filterDef && !filterDef.match(p)) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q) ||
          p.storage?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [allPhones, selectedBrand, selectedModel, searchQuery]);

  // 4. Sort strictly in Navbar order, then by Storage (256GB -> 512GB -> 1TB -> 2TB), then by Color
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const rankA = getNavbarPhoneRank(a);
      const rankB = getNavbarPhoneRank(b);
      if (rankA !== rankB) return rankA - rankB;

      const stA = parsePhoneStorage(a);
      const stB = parsePhoneStorage(b);
      if (stA !== stB) return stA - stB;

      const clrA = parsePhoneColorOrder(a.color);
      const clrB = parsePhoneColorOrder(b.color);
      if (clrA !== clrB) return clrA - clrB;

      return (a.name ?? "").localeCompare(b.name ?? "", "ar");
    });
  }, [filteredProducts]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

  // Filter chips to display based on active brand
  const visibleModelFilters = useMemo(() => {
    if (selectedBrand === "apple") {
      return MODEL_FILTERS.filter((m) => m.brand === "apple" && (modelCounts[m.id] ?? 0) > 0);
    }
    if (selectedBrand === "samsung") {
      return MODEL_FILTERS.filter((m) => m.brand === "samsung" && (modelCounts[m.id] ?? 0) > 0);
    }
    return MODEL_FILTERS.filter((m) => (modelCounts[m.id] ?? 0) > 0);
  }, [selectedBrand, modelCounts]);

  const handleBrandChange = (brand: "all" | "apple" | "samsung") => {
    setSelectedBrand(brand);
    setSelectedModel("all");
    setPage(1);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedBrand("all");
    setSelectedModel("all");
    setSearchQuery("");
    setPage(1);
  };

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
        .no-scrollbar::-webkit-scrollbar{display:none} .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f7f9" }}>
        {/* ─── Hero Header ────────────────────────────────────────── */}
        <div className="hero-cat relative overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="particle-cat"
              style={{
                left: `${10 + ((i * 11) % 80)}%`,
                bottom: "0",
                width: `${4 + (i % 3) * 2}px`,
                height: `${4 + (i % 3) * 2}px`,
                animationDuration: `${3 + (i % 4) * 1.2}s`,
                animationDelay: `${(i * 0.5) % 3}s`,
              }}
            />
          ))}
          <div className="absolute top-0 left-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 pt-6 sm:pt-10 pb-12 sm:pb-16">
            <div className="slide-up flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6">
              <Link href="/" className="text-white/60 hover:text-white/90 transition flex items-center gap-1">
                <IoHome size={13} />
                الرئيسية
              </Link>
              <IoChevronBack size={12} className="text-white/30" />
              <span className="text-white font-semibold">الهواتف الذكية</span>
            </div>

            <div className="slide-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white/90 border border-white/15 mb-3">
                  <IoPhonePortraitOutline size={14} className="text-[#02C39A]" />
                  هواتف ذكية أصلية 100% مع ضمان معتمد
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  الهواتف الذكية
                </h1>
                <p className="text-sm sm:text-base text-white/70 mt-1.5">
                  مرتبة حسب الأحدث والأقوى: آيفون 18، 17، 16 وسامسونج جالكسي S-Series
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2.5 border border-white/10 self-start sm:self-auto text-white shadow-sm">
                <IoGridOutline size={16} className="text-white/70" />
                <span className="text-xs sm:text-sm font-bold">
                  {sortedProducts.length} هاتف متوفر
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 50" fill="none" className="w-full" preserveAspectRatio="none">
              <path
                d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,30 1440,25 L1440,50 L0,50 Z"
                fill="#f5f7f9"
              />
            </svg>
          </div>
        </div>

        {/* ─── Main Content & Filters ─────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-12 sm:pb-16 -mt-3 sm:-mt-5 relative z-20">
          {/* ─── Control Bar (Brands + Search) ───────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Brand Tabs */}
              <div className="flex items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => handleBrandChange("all")}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                    selectedBrand === "all"
                      ? "bg-[#1F7A8C] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  <span>جميع الهواتف</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      selectedBrand === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {allPhones.length}
                  </span>
                </button>

                <button
                  onClick={() => handleBrandChange("apple")}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                    selectedBrand === "apple"
                      ? "bg-[#1F7A8C] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  <span>آبل آيفون</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      selectedBrand === "apple" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {appleTotalCount}
                  </span>
                </button>

                <button
                  onClick={() => handleBrandChange("samsung")}
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                    selectedBrand === "samsung"
                      ? "bg-[#1F7A8C] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  <span>سامسونج جالكسي</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      selectedBrand === "samsung" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {samsungTotalCount}
                  </span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <IoSearchOutline className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  type="text"
                  placeholder="ابحث بموديل الهاتف، السعة، أو اللون..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1F7A8C] focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <IoCloseCircle size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Model Badges / Filter Chips (Horizontally Scrollable) */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => handleModelChange("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    selectedModel === "all"
                      ? "bg-[#022B3A] text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>كل الموديلات</span>
                </button>

                {visibleModelFilters.map((m) => {
                  const isSelected = selectedModel === m.id;
                  const count = modelCounts[m.id] ?? 0;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleModelChange(m.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-[#1F7A8C] text-white border-[#1F7A8C] shadow-sm shadow-[#1F7A8C]/20"
                          : "bg-white text-gray-700 border-gray-200 hover:border-[#1F7A8C] hover:text-[#1F7A8C]"
                      }`}
                    >
                      <span>{m.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Filters Summary Strip */}
            {(selectedBrand !== "all" || selectedModel !== "all" || searchQuery) && (
              <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-semibold text-gray-700">التصفية النشطة:</span>
                  {selectedBrand !== "all" && (
                    <span className="bg-[#1F7A8C]/10 text-[#1F7A8C] px-2 py-0.5 rounded-md font-bold">
                      {selectedBrand === "apple" ? "آبل آيفون" : "سامسونج جالكسي"}
                    </span>
                  )}
                  {selectedModel !== "all" && (
                    <span className="bg-[#1F7A8C]/10 text-[#1F7A8C] px-2 py-0.5 rounded-md font-bold">
                      {MODEL_FILTERS.find((m) => m.id === selectedModel)?.label}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                      البحث: &quot;{searchQuery}&quot;
                    </span>
                  )}
                </div>

                <button
                  onClick={handleResetFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-bold transition flex items-center gap-1"
                >
                  <IoCloseCircle size={14} />
                  إلغاء كل الفلاتر
                </button>
              </div>
            )}
          </div>

          {/* ─── Products Grid ──────────────────────────────────────── */}
          {!sortedProducts.length ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 sm:py-24 px-4 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl sm:text-4xl mb-3">
                📱
              </div>
              <p className="text-gray-800 text-base sm:text-lg font-bold">لا توجد هواتف تطابق اختيارك</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-sm">
                جرّب اختيار موديل آخر أو إلغاء فلاتر التصفية لعرض جميع الهواتف الذكية المتاحة.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 text-xs sm:text-sm text-white bg-[#1F7A8C] hover:bg-[#155E6F] px-5 py-2.5 rounded-xl font-bold transition"
              >
                عرض جميع الهواتف ({allPhones.length})
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {sortedProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((p, i) => (
                  <div key={p._id} className="card-reveal" style={{ animationDelay: `${0.03 * (i % 6)}s` }}>
                    <ProductCard product={p} reserveMode={reserveMode} />
                  </div>
                ))}
              </div>

              {/* ─── Pagination ────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
                  <button
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    disabled={page === 1}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#1F7A8C] hover:text-[#1F7A8C] transition shadow-sm"
                    aria-label="Previous Page"
                  >
                    <IoChevronForward size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setPage(n);
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                        page === n
                          ? "bg-[#1F7A8C] text-white border border-[#1F7A8C] shadow-md shadow-[#1F7A8C]/20"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-[#1F7A8C] hover:text-[#1F7A8C]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    disabled={page === totalPages}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-[#1F7A8C] hover:text-[#1F7A8C] transition shadow-sm"
                    aria-label="Next Page"
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
