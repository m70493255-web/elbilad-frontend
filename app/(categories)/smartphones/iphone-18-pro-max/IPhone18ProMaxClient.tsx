"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "../../../components/products/types";
import { useCartStore } from "../../../store/cartStore";
import { IoHome, IoChevronBack, IoCartOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { Icon } from "@iconify/react";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => {
  if (src.startsWith("http")) {
    const idx = src.indexOf("https://", 8);
    return idx > 0 ? src.substring(idx) : src;
  }
  return `${API}${src.startsWith("/") ? src : "/" + src}`;
};

function IPhone18ProMaxCard({ product, index }: { product: Product; index: number }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const image = product.images?.[0] || product.image;
  const resolvedImage = image ? resolveImg(image) : undefined;
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const hasDiscount = product.salePrice != null && product.salePrice !== originalPrice;
  const displayPrice = hasDiscount ? product.salePrice! : originalPrice;

  // استخراج البيانات من اسم المنتج
  const extractInfo = (name: string) => {
    const info: { storage?: string; network?: string; screenSize?: string; color?: string } = {};
    
    // استخراج السعة (256GB, 512GB, 1TB, 2TB)
    const storageMatch = name.match(/(\d+)\s*(جيجابايت|GB|تيرابايت|TB)/i);
    if (storageMatch) {
      const size = storageMatch[1];
      const unit = storageMatch[2];
      if (unit.includes('تيرا') || unit.includes('TB')) {
        info.storage = `${size}TB`;
      } else {
        info.storage = `${size}GB`;
      }
    }
    
    
    
    // استخراج اللون (آخر كلمة عادة)
    const colorMatch = name.match(/،\s*([^،]+)$/);
    if (colorMatch) {
      info.color = colorMatch[1].trim();
    }
    
    return info;
  };

  const extractedInfo = extractInfo(product.name);
  const storage = product.storage || extractedInfo.storage;
  const network = product.network || extractedInfo.network;
  const screenSize = product.screenSize || extractedInfo.screenSize;
  const color = product.color || extractedInfo.color;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      router.push("/cart");
    }, 800);
  }, [addItem, product, router]);

  return (
    <div
      className="i18pm-card group cursor-pointer"
      style={{ animationDelay: `${0.05 * index}s` }}
      dir="rtl"
      onClick={() => router.push(`/product/${product._id}`)}
    >
      {/* image */}
      <div className="i18pm-img-wrap">
        <div className="absolute inset-0 flex items-center justify-center">
          {resolvedImage ? (
            <Image
              src={resolvedImage}
              alt={product.name}
              fill
              className="object-contain scale-[1.4] transition-transform duration-500 group-hover:scale-[1.5]"
              sizes="(max-width:640px) 50vw, 33vw"
            />
          ) : (
            <span className="text-5xl opacity-20">📱</span>
          )}
        </div>

        {(product.discountPercent ?? 0) > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-xl shadow-md shadow-red-400/40">
            <Icon icon="solar:tag-price-bold" width={11} />
            {product.discountPercent}%-
          </div>
        )}
        <div className={`absolute top-2 left-2 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-xl shadow-md ${
          product.inStock 
            ? "bg-emerald-500 text-white" 
            : "bg-gray-400 text-white"
        }`}>
          <Icon icon={product.inStock ? "solar:check-circle-bold" : "solar:close-circle-bold"} width={11} />
          {product.inStock ? "متوفر" : "نفذ"}
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col flex-1 px-3 pt-2 pb-3 gap-1">
        <h3 className="text-[11px] sm:text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 min-h-[28px]">
          {product.name}
        </h3>

        {/* بادجات السعة واللون والشبكة */}
        {(storage || color || network || screenSize) && (
          <div className="flex flex-wrap gap-1">
            {[
              storage && { icon: "solar:database-bold", label: storage },
              color && { icon: "solar:pallete-2-bold", label: color },
              network && { icon: "solar:wifi-router-bold", label: network },
              screenSize && { icon: "solar:monitor-smartphone-bold", label: screenSize },
            ].filter(Boolean).map((s: any) => (
              <span key={s.label} className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-[#155E6F] bg-[#155E6F]/8 border border-[#155E6F]/15 px-1.5 py-0.5 rounded-lg">
                <Icon icon={s.icon} width={10} />
                {s.label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto">
          {hasDiscount && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] text-gray-400 line-through">{fmt(originalPrice)} ر.س</span>
              <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-lg">
                وفّر {fmt(originalPrice - product.salePrice!)}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-black text-[#155E6F]">{fmt(displayPrice)}</span>
            <span className="text-[10px] font-semibold text-[#155E6F]/70">ر.س</span>
          </div>
        </div>

        {/* زر التقسيط */}
        {product.installment?.available && (
          <div className="flex items-center gap-1.5 bg-[#6DBE00]/10 border border-[#6DBE00]/20 rounded-xl px-2 py-1">
            <span className="text-sm">💳</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#4a8a00]">
              تقسيط {product.installment.downPayment ? `من ${fmt(product.installment.downPayment)} ر.س` : "متاح"}
            </span>
          </div>
        )}

        {/* زر تسوق الآن */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold rounded-xl py-2 mt-1 transition-all duration-300 shadow-md ${
            added
              ? "!bg-none !bg-green-600 !shadow-green-400/40 text-white"
              : product.inStock
              ? "cart-btn-v2"
              : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
          }`}
        >
          {!added && product.inStock && <span className="cart-btn-v2-bg" />}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            {added ? (
              <>
                <IoCheckmarkCircleOutline className="text-sm" />
                تمت الإضافة
              </>
            ) : (
              <>
                <IoCartOutline className="text-sm" />
                أضف للسلة
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function IPhone18ProMaxClient({ products }: { products: Product[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const sorted = [...products].sort((a, b) => {
    const priceA = a.salePrice ?? a.originalPrice ?? a.price ?? 0;
    const priceB = b.salePrice ?? b.originalPrice ?? b.price ?? 0;
    return priceA - priceB;
  });

  // حساب عدد الصفحات
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  
  // الحصول على المنتجات الحالية للصفحة
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sorted.slice(indexOfFirstItem, indexOfLastItem);

  // دوال التنقل بين الصفحات
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return (
    <>
      <style>{`
        @keyframes i18pmSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes i18pmCardReveal { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .i18pm-card {
          display:flex; flex-direction:column;
          background:#fff;
          border-radius:16px;
          overflow:hidden;
          border:1px solid #e5e7eb;
          box-shadow:0 2px 8px rgba(0,0,0,.06);
          animation: i18pmCardReveal .45s ease forwards;
          opacity:0;
          transition: all 0.3s ease;
        }
        .i18pm-card:hover {
          box-shadow:0 4px 16px rgba(0,0,0,.1);
          transform: translateY(-2px);
        }
        .i18pm-img-wrap {
          position:relative; 
          width:100%; 
          padding-bottom:85%;
          background: linear-gradient(to bottom, #eef7f9, #f8fcfd);
          display:flex; 
          align-items:center; 
          justify-content:center;
          overflow:hidden;
        }
        .i18pm-slide-up { animation: i18pmSlideUp .5s ease forwards; }
        .i18pm-slide-up-1 { animation: i18pmSlideUp .5s .1s ease both; }
        .i18pm-slide-up-2 { animation: i18pmSlideUp .5s .2s ease both; }
        
        /* زر تسوق الآن بنفس أسلوب cart-btn-v2 */
        .cart-btn-v2 {
          position: relative;
          overflow: hidden;
          color: white;
        }
        .cart-btn-v2-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #1F7A8C, #155E6F);
          transition: transform 0.3s ease;
        }
        .cart-btn-v2:hover .cart-btn-v2-bg {
          transform: scale(1.05);
        }
        .cart-btn-v2:active .cart-btn-v2-bg {
          transform: scale(0.98);
        }
      `}</style>

      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f7f9" }}>

        {/* ── HERO ── */}
        <div className="relative overflow-hidden" style={{ height: 400 }}>
          <Image
            src="https://res.cloudinary.com/dllmx2yf3/image/upload/v1789348035/fc7c6460-6a02-40eb-86ef-3fa23b06c673_1_hccf4o.webp"
            alt="iPhone 18 Pro Max Hero"
            fill
            className="object-cover object-center"
            priority
          />
          {/* dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

          <div className="relative z-10 h-full flex flex-col justify-between max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {/* breadcrumb */}
            <div className="i18pm-slide-up flex items-center gap-1.5 text-xs sm:text-sm">
              <Link href="/" className="text-white/70 hover:text-white transition flex items-center gap-1">
                <IoHome size={13} />الرئيسية
              </Link>
              <IoChevronBack size={11} className="text-white/30" />
              <Link href="/smartphones" className="text-white/70 hover:text-white transition">الهواتف</Link>
              <IoChevronBack size={11} className="text-white/30" />
              <span className="text-white font-semibold">iPhone 18 Pro Max</span>
            </div>

            {/* title bottom */}
            <div className="i18pm-slide-up-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-[#7dd3e8] text-xs sm:text-sm font-semibold mb-1 tracking-wide">متاح الآن</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  iPhone 18 Pro Max
                </h1>
                <p className="text-sm text-white/60 mt-2">
                  {sorted.length} موديل متاح · اشترِ الآن واستلم فوراً
                </p>
              </div>
              <div className="i18pm-slide-up-2 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/20 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs sm:text-sm text-white font-semibold">متوفر للشراء</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION HEADER ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 sm:mt-14 mb-5 sm:mb-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-800">الموديلات المتاحة</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                {sorted.length} منتج · صفحة {currentPage} من {totalPages}
              </p>
            </div>
            <div className="h-px flex-1 mx-4 bg-gradient-to-l from-gray-200 to-transparent" />
            <span className="text-[10px] sm:text-xs font-bold text-[#1F7A8C] bg-[#1F7A8C]/10 border border-[#1F7A8C]/20 px-3 py-1.5 rounded-xl">
              iPhone 18 Pro Max
            </span>
          </div>
        </div>

        {/* ── GRID ── */}
        <div className="max-w-6xl mx-auto px-2 sm:px-6 pb-14 sm:pb-20">
          {!products.length ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-[#1F7A8C]/10 flex items-center justify-center text-4xl">📦</div>
              <p className="text-gray-600 font-bold">المنتجات ستُضاف قريباً</p>
              <Link href="/" className="text-sm text-white bg-[#1F7A8C] hover:bg-[#155E6F] px-6 py-2.5 rounded-xl font-bold transition">
                ← العودة للرئيسية
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5">
                {currentProducts.map((p, i) => (
                  <IPhone18ProMaxCard key={p._id} product={p} index={i} />
                ))}
              </div>

              {/* ── PAGINATION ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 sm:mt-14" dir="rtl">
                  {/* زر السابق */}
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-[#1F7A8C] border border-[#1F7A8C]/20 hover:bg-[#1F7A8C] hover:text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    <span>السابق</span>
                    <IoChevronBack size={16} className="rotate-180" />
                  </button>

                  {/* أرقام الصفحات */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // عرض الصفحة الحالية + صفحتين قبلها وبعدها
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`min-w-[40px] h-[40px] rounded-xl font-bold text-sm transition-all ${
                              currentPage === page
                                ? "bg-[#1F7A8C] text-white shadow-lg scale-110"
                                : "bg-white text-gray-700 border border-gray-200 hover:border-[#1F7A8C]/30 hover:bg-[#1F7A8C]/5"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        (page === currentPage - 2 && currentPage > 3) ||
                        (page === currentPage + 2 && currentPage < totalPages - 2)
                      ) {
                        return (
                          <span key={page} className="text-gray-400 px-1">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* زر التالي */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-[#1F7A8C] border border-[#1F7A8C]/20 hover:bg-[#1F7A8C] hover:text-white shadow-md hover:shadow-lg"
                    }`}
                  >
                    <IoChevronBack size={16} />
                    <span>التالي</span>
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
