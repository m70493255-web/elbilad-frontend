"use client";

import { memo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoCartOutline, IoCheckmarkCircleOutline, IoInformationCircleOutline } from "react-icons/io5";
import { Icon } from "@iconify/react";
import type { Product } from "./types";
import { useCartStore } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => {
  if (src.startsWith("http")) {
    const idx = src.indexOf("https://", 8);
    return idx > 0 ? src.substring(idx) : src;
  }
  return `${API}${src.startsWith("/") ? src : "/" + src}`;
};

function ProductCard({ product, priority = false, reserveMode = false, largeImage = false }: { product: Product; priority?: boolean; reserveMode?: boolean; largeImage?: boolean }) {
  const { name, salePrice, discountPercent = 0, installment, inStock, color, storage } = product;
  const image = product.images?.[0] || product.image;
  const resolvedImage = image ? resolveImg(image) : undefined;
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const hasDiscount = salePrice != null && salePrice !== originalPrice;
  const displayPrice = hasDiscount ? salePrice! : originalPrice;
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      window.scrollTo(0, 0);
      router.push("/cart");
    }, 600);
  }, [addItem, product, router]);

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300" dir="rtl">
      {/* Clickable Image */}
      <Link href={`/product/${product._id}`} prefetch={false} className="block relative w-full bg-gradient-to-b from-[#eef7f9] to-[#f8fcfd]" style={{ paddingBottom: "85%" }}>
        <div className="absolute inset-0 flex items-center justify-center p-3">
          {resolvedImage ? (
            <Image
              src={resolvedImage}
              alt={name}
              fill
              className={`object-contain transition-transform duration-500 ${largeImage ? "scale-[1.25] group-hover:scale-[1.35]" : "p-3 group-hover:scale-105"}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="text-5xl opacity-30">📱</div>
          )}
        </div>

        {discountPercent > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-xl shadow-md shadow-red-400/40">
            <Icon icon="solar:tag-price-bold" width={11} />
            {discountPercent}%-
          </div>
        )}

        <div className={`absolute top-2 left-2 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-xl shadow-md ${
          inStock ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"
        }`}>
          <Icon icon={inStock ? "solar:check-circle-bold" : "solar:close-circle-bold"} width={11} />
          {inStock ? "متوفر" : "نفذ"}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 px-3 pt-2 pb-3 gap-1">
        <Link href={`/product/${product._id}`} prefetch={false}>
          <h3 className="text-[11px] sm:text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 min-h-[28px] hover:text-[#155E6F] transition-colors">
            {name}
          </h3>
        </Link>

        {(storage || color) && (
          <div className="flex flex-wrap gap-1">
            {[
              storage && { icon: "solar:database-bold", label: storage },
              color && { icon: "solar:pallete-2-bold", label: color },
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
                وفّر {fmt(originalPrice - salePrice!)}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-black text-[#155E6F]">{fmt(displayPrice)}</span>
            <span className="text-[10px] font-semibold text-[#155E6F]/70">ر.س</span>
          </div>
        </div>

        {installment?.available && (
          <div className="flex items-center gap-1.5 bg-[#6DBE00]/10 border border-[#6DBE00]/20 rounded-xl px-2 py-1">
            <span className="text-sm">💳</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-[#4a8a00]">
              تقسيط {installment.downPayment ? `من ${fmt(installment.downPayment)} ر.س` : "متاح"}
            </span>
          </div>
        )}

        {reserveMode ? (
          <div className="flex gap-1.5 mt-1">
            <Link
              href={`/product/${product._id}`}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#155E6F] bg-[#155E6F]/10 hover:bg-[#155E6F]/20 border border-[#155E6F]/20 rounded-xl py-2 transition text-center"
            >
              <IoInformationCircleOutline className="text-sm" />
              التفاصيل
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-white bg-[#1F7A8C] hover:bg-[#155E6F] rounded-xl py-2 transition shadow-md shadow-[#1F7A8C]/30"
            >
              أضف للسلة
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`cart-btn-v2 ${added ? "cart-btn-v2-added !bg-none !bg-green-600 !shadow-green-400/40" : ""}`}
          >
            <span className="cart-btn-v2-bg" />
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {added ? (
                <><IoCheckmarkCircleOutline className="text-sm" />تمت الإضافة</>
              ) : (
                <><IoCartOutline className="text-sm" />أضف للسلة</>
              )}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(ProductCard);
