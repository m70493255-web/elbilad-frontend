"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Smartphone, AlertCircle } from "lucide-react";

export type PaymentMethod = "card" | "stc" | "apple";

interface Props {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  className?: string;
}

const methods = [
  { id: "card" as PaymentMethod, name: "بطاقة بنكية / مدى", img: "/فيزا ماستر مدى.webp", alt: "Visa Mastercard Mada" },
  { id: "stc" as PaymentMethod, name: "STC Pay", img: "/stc.png", alt: "STC Pay", hidden: true },
  { id: "apple" as PaymentMethod, name: "Apple Pay", img: "/Apple-Pay-01.png", alt: "Apple Pay" },
];

export default function PaymentMethodSelector({ value, onChange, className = "" }: Props) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm font-extrabold text-gray-800">اختر طريقة الدفع</p>
        <span className="text-[11px] font-medium text-gray-400">خيارات دفع آمنة وموثوقة</span>
      </div>

      <div className="p-3 sm:p-4 flex flex-row gap-2.5 sm:gap-3">
        {methods.filter((m) => !m.hidden).map((m) => {
          const isSelected = value === m.id;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`relative flex flex-row items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border-2 py-2.5 sm:py-3 px-3 sm:px-5 transition-all cursor-pointer flex-1
                ${isSelected
                  ? "border-[#1a6b7d] bg-[#1a6b7d]/5 shadow-md shadow-[#1a6b7d]/15 ring-1 ring-[#1a6b7d]/30"
                  : "border-gray-200 bg-gray-50/70 hover:border-[#1a6b7d]/40 hover:bg-[#1a6b7d]/5"
                }`}
            >
              {isSelected && (
                <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-2 h-2 rounded-full bg-[#1a6b7d] ring-2 ring-white" />
              )}

              {/* Logo */}
              <div className="flex items-center justify-center w-full h-8 sm:h-9">
                <Image
                  src={m.img}
                  alt={m.alt}
                  width={90}
                  height={36}
                  className={`object-contain max-h-7 sm:max-h-8 drop-shadow-sm ${
                    m.id === "apple"
                      ? "scale-[2.1] sm:scale-[2.3]"
                      : "scale-[1.4] sm:scale-[1.5]"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── STC Pay panel ── */
export function StcPayPanel({
  onSubmit,
  onBack,
  loading,
}: {
  onSubmit: (phone: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  const handlePay = async () => {
    const clean = phone.trim();
    if (!/^05\d{8}$/.test(clean)) {
      setErr("يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05 ومكوّن من 10 أرقام");
      return;
    }
    setErr("");
    await onSubmit(clean);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
            <Smartphone size={15} className="text-[#1a6b7d]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">الدفع عبر STC Pay</h2>
            <p className="text-[11px] text-gray-400">أدخل رقم جوالك المرتبط بمحفظة STC</p>
          </div>
          <Image src="/stc.png" alt="STC Pay" width={56} height={28} className="object-contain mr-auto opacity-80" />
        </div>

        <div className="px-5 py-5 space-y-2">
          <label className="text-xs font-semibold text-gray-600">
            رقم الجوال <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Smartphone size={15} className="text-gray-400" />
            </span>
            <input
              type="tel"
              maxLength={10}
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErr(""); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm font-mono tracking-wider text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b7d]/30 focus:border-[#1a6b7d] focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
          {err && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} /> {err}
            </p>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-center gap-2">
          <Lock size={13} className="text-[#7CC043]" />
          <span className="text-xs text-gray-400">جميع البيانات مشفرة وآمنة بنسبة 100%</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-4 rounded-xl text-sm hover:bg-gray-50 transition-all"
        >
          السابق
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="flex-[2] py-4 bg-gradient-to-bl from-[#1a6b7d] to-[#155e6f] text-white rounded-xl font-extrabold text-base shadow-lg shadow-[#1a6b7d]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock size={15} />
          {loading ? "جاري المعالجة..." : "تأكيد الدفع"}
        </button>
      </div>
    </div>
  );
}

/* ── Apple Pay panel ── */
export function ApplePayPanel({
  onBack,
  onSubmit,
  loading,
  dueNow,
}: {
  onBack: () => void;
  onSubmit?: () => Promise<void>;
  loading?: boolean;
  dueNow?: number;
}) {
  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000" className="w-4 h-4 fill-white">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.8 135.4-317.5 269-317.5 70.7 0 129.5 46.4 173.1 46.4 42.8 0 109.8-49 192.1-49 31 0 108.2 2.6 168.5 80.6z" />
                <path d="M554.5 88c33.5-44.8 57.8-107 57.8-169.2 0-8.7-.6-17.4-2-24.8-54.3 2-118.7 36.2-157.8 85.5-30.4 37.7-59.4 99.6-59.4 162.6 0 9.4 1.3 18.7 2 21.8 3.2.6 8.7 1.3 14.2 1.3 48.4 0 109.1-32.2 145.2-77.2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Apple Pay</p>
              <p className="text-[11px] text-gray-400">دفع سريع وآمن</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1a6b7d]/8 text-[#1a6b7d] text-[10px] font-bold border border-[#1a6b7d]/15">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a6b7d] animate-pulse" />
            جاهز
          </span>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">

          {/* Steps */}
          <div className="space-y-2.5">
            {[
              { step: "01", text: "اضغط زر الدفع أدناه" },
              { step: "02", text: "سيتم تحويلك لبوابة Stripe الآمنة" },
              { step: "03", text: "أكّد بـ Face ID أو بصمة الإصبع" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1a6b7d]/10 text-[#1a6b7d] text-[10px] font-black flex items-center justify-center shrink-0">
                  {step}
                </span>
                <span className="text-xs text-gray-600 font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Amount */}
          {dueNow != null && dueNow > 0 && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <span className="text-xs text-gray-500 font-medium">المبلغ المطلوب</span>
              <span className="text-base font-black text-[#1a6b7d]">{fmt(dueNow)} <span className="text-sm font-bold">ر.س</span></span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-5 py-2.5 flex items-center justify-center gap-2">
          <Lock size={12} className="text-[#7CC043]" />
          <span className="text-[11px] text-gray-400">معاملات مشفرة بنسبة 100% عبر Stripe</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-4 rounded-xl text-sm hover:bg-gray-50 transition-all"
        >
          السابق
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-[1.5] py-3 bg-black hover:bg-neutral-800 active:scale-[0.98] text-white rounded-xl shadow-sm shadow-black/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <span className="text-sm font-semibold tracking-wide">جاري التحويل...</span>
          ) : (
            <span className="flex items-center justify-center gap-[6px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 814 1000"
                className="w-[17px] h-[17px] fill-white flex-shrink-0 -mt-0.5"
              >
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.8 135.4-317.5 269-317.5 70.7 0 129.5 46.4 173.1 46.4 42.8 0 109.8-49 192.1-49 31 0 108.2 2.6 168.5 80.6z" />
                <path d="M554.5 88c33.5-44.8 57.8-107 57.8-169.2 0-8.7-.6-17.4-2-24.8-54.3 2-118.7 36.2-157.8 85.5-30.4 37.7-59.4 99.6-59.4 162.6 0 9.4 1.3 18.7 2 21.8 3.2.6 8.7 1.3 14.2 1.3 48.4 0 109.1-32.2 145.2-77.2z" />
              </svg>
              <span
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  lineHeight: 1,
                }}
              >
                Pay
              </span>
            </span>
          )}
        </button>

      </div>
    </div>
  );
}
