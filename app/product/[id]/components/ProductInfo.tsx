"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoCartOutline, IoCheckmarkCircle, IoShieldCheckmark, IoTimeOutline, IoCarOutline, IoCheckmarkDoneCircle, IoFlash, IoStorefront } from "react-icons/io5";
import type { Product } from "../../../components/products/types";

const fmt = (n: number) => n.toLocaleString("en-US");

interface ProductInfoProps {
  product: Product;
  addedToCart: boolean;
  onAddToCart: (updatedProduct: Product) => void;
  onVariantChange?: (images: string[]) => void;
  onPriceChange?: (price: number) => void;
  onNameChange?: (name: string) => void;
  onProductChange?: (updatedProduct: Product) => void;
  isIPhone18?: boolean;
}

export default function ProductInfo({ product, addedToCart, onAddToCart, onVariantChange, onPriceChange, onNameChange, onProductChange, isIPhone18 = false }: ProductInfoProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(
    hasVariants ? product.variants![0].defaultStorage : (product.storage ?? "")
  );

  const activeVariant = hasVariants ? product.variants![selectedVariantIdx] : null;
  const activeStorageOption = activeVariant?.storageOptions.find(s => s.storage === selectedStorage)
    ?? activeVariant?.storageOptions[0];

  const handleSelectVariant = (idx: number) => {
    setSelectedVariantIdx(idx);
    const variant = product.variants![idx];
    setSelectedStorage(variant.defaultStorage);
    onVariantChange?.(variant.images);
    const opt = variant.storageOptions.find(s => s.storage === variant.defaultStorage) ?? variant.storageOptions[0];
    onPriceChange?.(opt?.salePrice ?? opt?.originalPrice ?? product.salePrice ?? product.originalPrice ?? 0);
  };

  const handleAdd = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // إنشاء نسخة محدثة من المنتج مع اللون والسعة والسعر المختارين
      const updatedProduct = {
        ...product,
        name: displayName,
        color: activeVariant?.color || product.color,
        storage: selectedStorage || product.storage,
        originalPrice: displayOriginal,
        salePrice: displayPrice,
        price: displayPrice,
        image: activeVariant?.images?.[0] || product.image,
        images: activeVariant?.images || product.images,
      };
      
      onAddToCart(updatedProduct);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }, 600);
  };
  const { name, brand, color, storage, network, taxIncluded, installment, freeDelivery, deliveryTime, inStock } = product;
  const displayPrice = activeStorageOption?.salePrice ?? activeStorageOption?.originalPrice ?? product.salePrice ?? product.originalPrice ?? 0;
  const displayOriginal = activeStorageOption?.originalPrice ?? product.originalPrice ?? 0;
  const salePrice = hasVariants ? displayPrice : (product.salePrice ?? undefined);
  const originalPrice = hasVariants ? displayOriginal : (product.originalPrice ?? 0);
  const hasDiscount = salePrice != null && salePrice !== originalPrice;

  // بناء الاسم الديناميكي بناءً على اللون والسعة المختارين
  const displayName = hasVariants && activeVariant
    ? (() => {
        // استخراج الجزء الأساسي من الاسم (قبل أول سعة أو لون)
        const baseName = name.split(/،\s*\d+\s*(جيجابايت|GB|تيرابايت|TB)/i)[0];
        return `${baseName}، ${selectedStorage}، ${activeVariant.color}`;
      })()
    : name;

  // تحديث الاسم في الـ parent component عند تغييره
  useEffect(() => {
    if (onNameChange) {
      onNameChange(displayName);
    }
  }, [displayName, onNameChange]);

  // تحديث المنتج الكامل في الـ parent component عند أي تغيير
  useEffect(() => {
    if (onProductChange && hasVariants && activeVariant) {
      const updatedProduct = {
        ...product,
        name: displayName,
        color: activeVariant.color,
        storage: selectedStorage,
        originalPrice: displayOriginal,
        salePrice: displayPrice,
        price: displayPrice,
        image: activeVariant.images?.[0] || product.image,
        images: activeVariant.images || product.images,
      };
      onProductChange(updatedProduct);
    }
  }, [displayName, selectedStorage, activeVariant, displayPrice, displayOriginal, onProductChange, hasVariants]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Price Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg shadow-black/[.04] border border-gray-100/80">
        {/* Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${inStock ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-red-500"}`} />
            {inStock ? "متوفر الآن" : "غير متوفر"}
          </div>
          {brand && (
            <span className="text-[10px] sm:text-xs font-bold text-[#1F7A8C] bg-[#1F7A8C]/8 px-3 py-1.5 rounded-lg">{brand}</span>
          )}
        </div>

        {/* Name */}
        <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 leading-relaxed mb-3">{displayName}</h2>

        {/* Tags */}
        {!hasVariants && (color || storage || network) && (
          <div className="flex gap-2 mb-5 flex-wrap">
            {[color, storage, network].filter(Boolean).map((t, i) => (
              <span key={i} className="text-[10px] sm:text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">{t}</span>
            ))}
          </div>
        )}

        {/* Variant Color Picker */}
        {hasVariants && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 mb-2">
              اللون: <span className="text-gray-800">{activeVariant?.color}</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.variants!.map((v, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectVariant(i)}
                  title={v.color}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedVariantIdx === i
                      ? "border-[#1F7A8C] scale-110 shadow-md"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{ background: v.colorCode }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Storage Selector */}
        {hasVariants && activeVariant && (
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-500 mb-2">السعة</p>
            <div className="flex gap-2 flex-wrap">
              {activeVariant.storageOptions.map((opt) => (
                <button
                  key={opt.storage}
                  onClick={() => {
                    setSelectedStorage(opt.storage);
                    onPriceChange?.(opt.salePrice ?? opt.originalPrice ?? product.salePrice ?? product.originalPrice ?? 0);
                  }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    selectedStorage === opt.storage
                      ? "bg-[#1F7A8C] text-white border-[#1F7A8C] shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:border-[#1F7A8C]"
                  }`}
                >
                  {opt.storage}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-gradient-to-l from-transparent via-gray-200 to-transparent mb-5" />

        {/* Price */}
        <div className="flex items-end gap-3 flex-wrap">
          {hasDiscount ? (
            <>
              <span className="text-3xl sm:text-4xl font-black text-red-600 leading-none">{fmt(salePrice)}</span>
              <span className="text-sm font-bold text-red-600/70 mb-1">ر.س</span>
              <div className="flex items-center gap-2 mr-2">
                <span className="text-sm text-gray-400 line-through">{fmt(originalPrice)}</span>
                <span className="text-[10px] sm:text-xs font-extrabold text-white bg-red-500 px-2.5 py-1 rounded-lg shadow-sm shadow-red-500/20">
                  وفّر {fmt(originalPrice - salePrice)}
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="text-3xl sm:text-4xl font-black text-red-600 leading-none">{fmt(originalPrice)}</span>
              <span className="text-sm font-bold text-red-600/70 mb-1">ر.س</span>
            </>
          )}
        </div>
        {taxIncluded && <p className="text-[10px] sm:text-xs text-gray-400 mt-2">شامل ضريبة القيمة المضافة</p>}

        {/* Installment */}
        {installment?.available && (
          <div className="mt-4 bg-gradient-to-l from-[#f0fbe4] to-[#f7fdf0] rounded-2xl px-4 py-3.5 border border-[#7CC043]/15">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#7CC043]/15 flex items-center justify-center shrink-0">
                <IoFlash size={16} className="text-[#5a9030]" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-[#3d6b1a] font-bold">
                  تقسيط متاح {installment.downPayment ? `• مقدم ${fmt(installment.downPayment)} ر.س` : ""}
                </p>
                {installment.note && <p className="text-[10px] sm:text-xs text-[#7CC043] mt-0.5">{installment.note}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {[
          { icon: IoCarOutline, label: freeDelivery ? "توصيل مجاني" : "توصيل مدفوع", sub: deliveryTime, accent: "#1F7A8C" },
          { icon: IoShieldCheckmark, label: product.category === "بلاستيشن وملحقاته" ? "ضمان الالكترونيات الحديثه" : "ضمان حاسبات العرب", sub: "سنتين", accent: "#0d4a5e" },
          { icon: IoStorefront, label: inStock ? "متوفر بالمخزون" : "غير متوفر", sub: null, accent: inStock ? "#16a34a" : "#dc2626" },
          { icon: IoTimeOutline, label: "شحن سريع", sub: "خلال 24-48 ساعة", accent: "#7c3aed" },
        ].map((f, i) => (
          <div key={i} className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-gray-100/80 flex items-center gap-3 hover:shadow-md hover:border-gray-200 transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${f.accent}12` }}>
              <f.icon size={18} style={{ color: f.accent }} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-bold text-gray-800 leading-snug">{f.label}</p>
              {f.sub && <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{f.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Cart */}
      <div className="relative">
        {/* Popup */}
        {showPopup && (
          <div className="absolute -top-14 left-0 right-0 z-20 pdp-popup">
            <div className="bg-gradient-to-l from-[#1a6b7d] to-[#155e6f] rounded-2xl px-4 py-3 shadow-lg shadow-[#1a6b7d]/30 flex items-center gap-3">
              <IoCheckmarkDoneCircle size={18} className="text-white shrink-0" />
              <span className="text-sm font-bold text-white">تمت إضافة المنتج للسلة بنجاح</span>
            </div>
          </div>
        )}

        {!addedToCart ? (
          <button
            onClick={handleAdd}
            disabled={loading || !inStock}
            className="product-page-cart-btn group w-full disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="product-page-cart-btn-shine" />
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              {loading ? (
                <svg className="animate-spin" width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : !inStock ? (
                <span>المنتج غير متوفر حالياً</span>
              ) : (
                <><IoCartOutline size={22} className="transition-transform group-hover:scale-110" /> أضف للسلة</>
              )}
            </span>
          </button>
        ) : (
          <button
            onClick={() => router.push("/cart")}
            className="product-page-cart-btn group w-full bg-gradient-to-l from-[#1a6b7d] to-[#155e6f] shadow-lg shadow-[#1a6b7d]/30"
          >
            <span className="relative z-10 flex items-center justify-center gap-2.5 font-bold">
              <IoCartOutline size={22} /> عرض السلة وإتمام الطلب
            </span>
          </button>
        )}

      </div>
    </div>
  );
}
