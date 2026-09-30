"use client";

import Image from "next/image";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { Icon } from "@iconify/react";
import { FaWifi } from "react-icons/fa";
import PaymentMethodSelector, { ApplePayPanel } from "./TrustBadges";
import { useState } from "react";

const MADA_BINS = ["588845","440647","440795","446404","457865","968208","457997","474491","543357","434107","431361","604906","521076","588848","968210","968211","968212","968213","968214","968215","968216","968217","968218","968219","968220","531095","531196","532013","535825","535989","536023","537767","539931","543085","549760","558563","585265","588850","588982","589005","589206","604906","636120","968201","968202","968203","968204","968205","968206","968207"];

const getCardType = (num: string): "Visa" | "Mastercard" | "Mada" | null => {
  if (!num) return null;
  if (num.length >= 6 && MADA_BINS.includes(num.slice(0, 6))) return "Mada";
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "Mastercard";
  return null;
};

const inputBase = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b7d]/30 focus:border-[#1a6b7d] focus:bg-white transition-all placeholder:text-gray-400";
const inputErr  = "w-full bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:bg-white transition-all placeholder:text-gray-400";

interface CheckoutPaymentProps {
  shippingConfirmed: boolean;
  selectedPayment: "mada" | "mastercard" | "applepay" | null;
  setSelectedPayment: (v: "mada" | "mastercard" | "applepay" | null) => void;
  cardNumber: string;
  setCardNumber: (v: string) => void;
  cardExpiry: string;
  setCardExpiry: (v: string) => void;
  cardCvv: string;
  setCardCvv: (v: string) => void;
  cardHolder: string;
  setCardHolder: (v: string) => void;
  cardNumberError: string;
  setCardNumberError: (v: string) => void;
  cardExpiryError: string;
  setCardExpiryError: (v: string) => void;
  loading: boolean;
  blocked: boolean;
  fmtTime: string;
  onCardSubmit: () => void;
  submitLabel: string;
}

export default function CheckoutPayment({
  selectedPayment,
  setSelectedPayment,
  cardNumber,
  setCardNumber,
  cardExpiry,
  setCardExpiry,
  cardCvv,
  setCardCvv,
  cardHolder,
  setCardHolder,
  cardNumberError,
  setCardNumberError,
  cardExpiryError,
  setCardExpiryError,
  loading,
  blocked,
  onCardSubmit,
  submitLabel,
}: CheckoutPaymentProps) {
  const [flipped, setFlipped] = useState(false);

  // Map internal selectedPayment to TrustBadges PaymentMethod
  const method = selectedPayment === "applepay" ? "apple" : "card";
  const setMethod = (m: "card" | "stc" | "apple") => {
    if (m === "apple") setSelectedPayment("applepay");
    else setSelectedPayment("mada");
  };

  const rawCard = cardNumber.replace(/\s/g, "");
  const cardType = getCardType(rawCard);
  const cardBg = cardType === "Mada" ? "from-green-500 to-green-800" : cardType === "Visa" ? "from-blue-600 to-blue-900" : cardType === "Mastercard" ? "from-orange-500 to-red-800" : "from-slate-600 to-slate-900";

  return (
    <div className="space-y-4">
      <PaymentMethodSelector value={method} onChange={setMethod} />

      {method === "card" && (
        <>
          {/* Card Preview */}
          <div className="w-full max-w-sm mx-auto" style={{ perspective: "1000px" }}>
            <div
              className="relative w-full transition-transform duration-700"
              style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", height: "clamp(170px, 48vw, 200px)" }}
            >
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cardBg} text-white p-5 shadow-2xl select-none overflow-hidden`}
                style={{ backfaceVisibility: "hidden" }}
                dir="ltr"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <FaWifi className="rotate-90 opacity-60" size={18} />
                  {cardType === "Mada" && <Image src="/mada975b.png" alt="Mada" width={48} height={26} className="object-contain brightness-200" />}
                  {(cardType === "Visa" || cardType === "Mastercard") && <Image src="/cc975b.png" alt={cardType} width={56} height={26} className="object-contain brightness-200" />}
                  {!cardType && <span className="text-xs opacity-40 font-semibold tracking-widest">BANK CARD</span>}
                </div>
                <div className="mt-2 w-8 h-5 rounded bg-yellow-300/80 flex items-center justify-center">
                  <div className="w-5 h-3.5 rounded-sm border border-yellow-500/60 grid grid-cols-3 gap-px p-0.5">
                    {[...Array(6)].map((_, i) => <div key={i} className="bg-yellow-500/50 rounded-sm" />)}
                  </div>
                </div>
                <div className="mt-2 tracking-[0.2em] text-lg font-mono font-semibold">{cardNumber || "0000 0000 0000 0000"}</div>
                <div className="flex justify-between items-end mt-3">
                  <div>
                    <p className="text-[9px] opacity-50 uppercase tracking-widest">Card Holder</p>
                    <p className="text-xs font-bold tracking-wide truncate max-w-[160px]">{cardHolder || "FULL NAME"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] opacity-50 uppercase tracking-widest">Expires</p>
                    <p className="text-xs font-bold">{cardExpiry || "MM/YY"}</p>
                  </div>
                </div>
              </div>
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cardBg} text-white shadow-2xl select-none overflow-hidden`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                dir="ltr"
              >
                <div className="w-full h-9 bg-black/70 mt-7" />
                <div className="px-5 mt-4">
                  <p className="text-[9px] opacity-50 uppercase tracking-widest mb-1">CVV</p>
                  <div className="bg-white/90 rounded-lg h-9 flex items-center px-4">
                    <span className="text-gray-800 font-mono font-bold tracking-[0.3em] text-sm">
                      {cardCvv ? "•".repeat(cardCvv.length) : "•••"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
                  <CreditCard size={15} className="text-[#1a6b7d]" />
                </div>
                <h2 className="text-sm font-bold text-gray-800">بيانات البطاقة</h2>
              </div>
              <Image src="/فيزا ماستر مدى.webp" alt="بطاقات الدفع" width={110} height={32} className="object-contain opacity-70" />
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">رقم البطاقة <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"><CreditCard size={16} /></span>
                  <input
                    autoComplete="cc-number" type="text" maxLength={19} dir="ltr"
                    inputMode="numeric" pattern="[0-9 ]*"
                    value={cardNumber}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      v = v.match(/.{1,4}/g)?.join(" ") ?? v;
                      setCardNumber(v);
                      setCardNumberError("");
                    }}
                    className={`${cardNumberError ? inputErr : inputBase} !pr-10 ${cardType ? "!pl-14" : ""} font-mono tracking-wider`}
                  />
                  {cardType && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      {cardType === "Visa" && <Icon icon="logos:visa" width={34} height={22} />}
                      {cardType === "Mastercard" && <Icon icon="logos:mastercard" width={30} height={22} />}
                      {cardType === "Mada" && <Image src="/mada975b.png" alt="Mada" width={34} height={18} className="object-contain" />}
                    </span>
                  )}
                </div>
                {cardNumberError && <p className="text-red-400 text-xs">{cardNumberError}</p>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">تاريخ الانتهاء <span className="text-red-400">*</span></label>
                  <input
                    autoComplete="cc-exp" type="text" maxLength={5} dir="ltr"
                    inputMode="numeric" pattern="[0-9/]*" placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, "");
                      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                      setCardExpiry(v);
                      setCardExpiryError("");
                    }}
                    className={`${cardExpiryError ? inputErr : inputBase} text-center font-mono tracking-wider`}
                  />
                  {cardExpiryError && <p className="text-red-400 text-xs">{cardExpiryError}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">رمز CVV <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={13} /></span>
                    <input
                      autoComplete="cc-csc" type="password" maxLength={3} dir="ltr"
                      inputMode="numeric" pattern="[0-9]*" placeholder="•••"
                      value={cardCvv}
                      onFocus={() => setFlipped(true)}
                      onBlur={() => setFlipped(false)}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      className={`${inputBase} !pr-9 text-center font-mono tracking-[0.3em]`}
                    />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">اسم حامل البطاقة <span className="text-red-400">*</span></label>
                  <input
                    autoComplete="cc-name" type="text" dir="ltr"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value.replace(/[^a-zA-Z ]/g, "").toUpperCase())}
                    className={`${inputBase} uppercase tracking-wide`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-center gap-2">
              <ShieldCheck size={13} className="text-[#7CC043]" />
              <span className="text-xs text-gray-400">جميع البيانات مشفرة وآمنة بنسبة 100%</span>
            </div>
          </div>

          <button
            onClick={onCardSubmit}
            disabled={loading || blocked}
            className="w-full py-4 bg-gradient-to-bl from-[#1a6b7d] to-[#155e6f] text-white rounded-xl font-extrabold text-base shadow-lg shadow-[#1a6b7d]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Lock size={15} />
            {loading ? "جاري المعالجة..." : submitLabel}
          </button>
        </>
      )}

      {method === "apple" && (
        <ApplePayPanel onBack={() => setSelectedPayment("mada")} />
      )}
    </div>
  );
}
