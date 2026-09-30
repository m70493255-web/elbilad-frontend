"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCoupon2Line, RiFileCopyLine, RiCheckLine, RiCloseLine } from "react-icons/ri";
import { useCartStore } from "../../store/cartStore";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function DiscountBanner() {
  const { setPendingDiscountCode } = useCartStore();
  const [visible, setVisible] = useState(true);
  const [code] = useState(generateCode);
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setPendingDiscountCode(code);
    setCopied(true);
    setTimeout(() => setVisible(false), 900);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          dir="rtl"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="h-1 w-full bg-gradient-to-l from-[#1a6b7d] to-[#2a9db5]" />
          <div className="px-5 py-4 flex flex-col gap-3">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center shrink-0">
                  <RiCoupon2Line size={17} className="text-[#1a6b7d]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">لديك كود خصم 🎉</p>
                  <p className="text-xs text-gray-400">
                    وفّر <span className="text-[#1a6b7d] font-bold">100 ر.س</span> — استخدمه عند الدفع
                  </p>
                </div>
              </div>
              <button onClick={() => setVisible(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                <RiCloseLine size={20} />
              </button>
            </div>

            <button
              onClick={copyCode}
              className={`w-full flex items-center justify-between gap-3 border-2 border-dashed rounded-xl px-4 py-3 transition-all group ${
                copied
                  ? "bg-green-50 border-green-300"
                  : "bg-[#f4fbfc] border-[#1a6b7d]/25 hover:border-[#1a6b7d]/50"
              }`}
            >
              <span className={`font-mono font-black text-xl tracking-widest select-all ${copied ? "text-green-600" : "text-[#1a6b7d]"}`}>
                {code}
              </span>
              <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                copied ? "bg-green-500 text-white" : "bg-[#1a6b7d] text-white group-hover:bg-[#155e6f]"
              }`}>
                {copied ? <RiCheckLine size={14} /> : <RiFileCopyLine size={14} />}
                {copied ? "تم النسخ ✓" : "نسخ الكود"}
              </span>
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
