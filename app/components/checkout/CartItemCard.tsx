"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RiSubtractLine, RiAddLine, RiDeleteBin6Line } from "react-icons/ri";

const fmt = (n: number) => n.toLocaleString("ar-SA");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src}`;

interface CartItemCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    originalPrice?: number;
    images?: string[];
    image?: string;
  };
  qty: number;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItemCard({ product, qty, onUpdateQty, onRemove }: CartItemCardProps) {
  const price = product.salePrice ?? product.originalPrice ?? product.price;
  const hasDiscount = product.salePrice && product.originalPrice && product.salePrice < product.originalPrice;
  const rawImg = product.images?.[0] || product.image;
  const img = rawImg ? resolveImg(rawImg) : undefined;
  const lineTotal = price * qty;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
        {img ? (
          <Image src={img} alt={product.name} fill className="object-contain p-2" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-3xl">📱</span>
        )}
        {hasDiscount && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            خصم
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-extrabold text-[#1a6b7d]">{fmt(price)} ر.س</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">{fmt(product.originalPrice!)} ر.س</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Qty controls */}
          <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded-xl p-0.5">
            <button
              onClick={() => onUpdateQty(product._id, qty - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition text-gray-500"
            >
              <RiSubtractLine size={14} />
            </button>
            <AnimatePresence mode="wait">
              <motion.span
                key={qty}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-7 text-center text-sm font-bold text-gray-800"
              >
                {qty}
              </motion.span>
            </AnimatePresence>
            <button
              onClick={() => onUpdateQty(product._id, qty + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1a6b7d]/10 transition text-[#1a6b7d]"
            >
              <RiAddLine size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-gray-600">{fmt(lineTotal)} ر.س</span>
            <button
              onClick={() => onRemove(product._id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
            >
              <RiDeleteBin6Line size={15} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
