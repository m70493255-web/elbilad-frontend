"use client";

import { useState, useMemo, useRef } from "react";
import { User, MapPin, CreditCard, ChevronDown, Calendar, Wallet, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomerInfo } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("en-US");

interface CustomerFormProps {
  total: number;
  itemCount: number;
  initialData?: CustomerInfo | null;
  installmentMonths?: number;
  onSubmit: (info: CustomerInfo) => void;
}

const inputBase =
  "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b7d]/30 focus:border-[#1a6b7d] focus:bg-white transition-all placeholder:text-gray-400";
const inputErr =
  "w-full bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:bg-white transition-all placeholder:text-gray-400";

export default function CustomerForm({ total, itemCount, initialData, installmentMonths, onSubmit }: CustomerFormProps) {
  const maxMonths = installmentMonths ?? 24;
  const MONTHS_OPTIONS = Array.from({ length: Math.floor(maxMonths / 2) }, (_, i) => (i + 1) * 2);
  const minDown = 500 * itemCount;
  const DOWN_OPTIONS = [
    { label: `${fmt(minDown)} ر.س`, value: 0, sub: "الحد الأدنى" },
    { label: `${fmt(minDown + 500)} ر.س`, value: 500, sub: "+500 ر.س" },
    { label: `${fmt(minDown + 1000)} ر.س`, value: 1000, sub: "+1000 ر.س" },
    { label: `${fmt(total)} ر.س`, value: total - minDown, sub: "دفع كامل" },
  ];

  const [name, setName] = useState(initialData?.name ?? "");
  const [nationalId, setNationalId] = useState(initialData?.nationalId ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [installmentType, setInstallmentType] = useState<"full" | "installment">(initialData?.installmentType ?? "installment");
  const [months, setMonths] = useState(initialData?.months ?? 12);
  const [downExtra, setDownExtra] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSchedule, setShowSchedule] = useState(false);

  // refs for auto-scroll
  const nameRef = useRef<HTMLDivElement>(null);
  const nationalIdRef = useRef<HTMLDivElement>(null);
  const whatsappRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  const downPayment = minDown + downExtra;
  const monthly = useMemo(() => {
    if (installmentType === "full") return 0;
    const rem = total - downPayment;
    return rem > 0 ? Math.ceil(rem / months) : 0;
  }, [total, months, installmentType, downPayment]);

  const schedule = useMemo(() => {
    const now = new Date();
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, now.getDate());
      return {
        index: i + 1,
        date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
        amount: monthly,
      };
    });
  }, [months, monthly]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "الاسم مطلوب";
    if (!nationalId.trim()) e.nationalId = "رقم الهوية مطلوب";
    else if (!/^[12]\d{9}$/.test(nationalId.trim())) e.nationalId = "يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام";
    if (!whatsapp.trim()) e.whatsapp = "رقم الواتساب مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim())) e.whatsapp = "يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!address.trim()) e.address = "العنوان مطلوب";
    setErrors(e);

    // auto-scroll to first error
    if (e.name) { scrollTo(nameRef); return false; }
    if (e.nationalId) { scrollTo(nationalIdRef); return false; }
    if (e.whatsapp) { scrollTo(whatsappRef); return false; }
    if (e.address) { scrollTo(addressRef); return false; }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit({ name, nationalId, whatsapp, address, installmentType, months, downPayment });
  };

  return (
    <div className="space-y-4">
      {/* ── Customer Info ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
            <User size={15} className="text-[#1a6b7d]" />
          </div>
          <h2 className="text-sm font-bold text-gray-800">معلومات العميل</h2>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div ref={nameRef} className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">الاسم كاملاً <span className="text-red-400">*</span></label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value.replace(/[0-9]/g, "")); setErrors(p => ({ ...p, name: "" })); }}
              placeholder="أدخل اسمك بالكامل"
              className={errors.name ? inputErr : inputBase}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs flex items-center gap-1">
                  <span>⚠</span> {errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div ref={nationalIdRef} className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">رقم الهوية / الإقامة <span className="text-red-400">*</span></label>
            <input
              value={nationalId}
              onChange={(e) => { setNationalId(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({ ...p, nationalId: "" })); }}
              placeholder="رقم الهوية"
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              className={errors.nationalId ? inputErr : inputBase}
            />
            <AnimatePresence>
              {errors.nationalId && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs flex items-center gap-1">
                  <span>⚠</span> {errors.nationalId}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div ref={whatsappRef} className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">رقم الواتساب <span className="text-red-400">*</span></label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => { setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({ ...p, whatsapp: "" })); }}
              placeholder="05XXXXXXXX"
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              className={errors.whatsapp ? inputErr : inputBase}
            />
            <AnimatePresence>
              {errors.whatsapp && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs flex items-center gap-1">
                  <span>⚠</span> {errors.whatsapp}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Address ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
            <MapPin size={15} className="text-[#1a6b7d]" />
          </div>
          <h2 className="text-sm font-bold text-gray-800">عنوان التوصيل</h2>
        </div>
        <div ref={addressRef} className="px-5 py-5 space-y-1.5">
          <label className="text-xs font-semibold text-gray-600">العنوان بالتفصيل <span className="text-red-400">*</span></label>
          <input
            value={address}
            onChange={(e) => { setAddress(e.target.value); setErrors(p => ({ ...p, address: "" })); }}
            placeholder="المدينة - الحي - الشارع"
            className={errors.address ? inputErr : inputBase}
          />
          <AnimatePresence>
            {errors.address && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs flex items-center gap-1">
                <span>⚠</span> {errors.address}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Payment Method ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
            <CreditCard size={15} className="text-[#1a6b7d]" />
          </div>
          <h2 className="text-sm font-bold text-gray-800">طريقة الدفع</h2>
        </div>
        <div className="px-5 py-5 space-y-5">

          {/* Full / Installment toggle */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "full", label: "دفع كامل", desc: "سداد المبلغ دفعة واحدة", icon: Wallet },
              { value: "installment", label: "تقسيط شهري", desc: "أقساط مريحة بدون فوائد", icon: Calendar },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = installmentType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInstallmentType(opt.value as "full" | "installment")}
                  className={`relative p-4 rounded-2xl border-2 text-right transition-all duration-200 overflow-hidden ${
                    active
                      ? "border-[#1a6b7d] bg-gradient-to-br from-[#1a6b7d]/8 to-[#1a6b7d]/3 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 left-2">
                      <CheckCircle2 size={14} className="text-[#1a6b7d]" />
                    </span>
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${active ? "bg-[#1a6b7d] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <Icon size={16} />
                  </div>
                  <p className={`text-sm font-bold leading-tight ${active ? "text-[#1a6b7d]" : "text-gray-700"}`}>{opt.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Installment options */}
          <AnimatePresence>
            {installmentType === "installment" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-5 pt-1">

                  {/* Months grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#1a6b7d]" />
                      عدد أشهر التقسيط
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {MONTHS_OPTIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMonths(m)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-2 ${
                            months === m
                              ? "border-[#1a6b7d] bg-[#1a6b7d] text-white shadow-md shadow-[#1a6b7d]/25"
                              : "border-gray-200 text-gray-600 hover:border-[#1a6b7d]/40 hover:text-[#1a6b7d] bg-white"
                          }`}
                        >
                          {m}
                          <span className="block text-[9px] font-medium opacity-70 mt-0.5">شهر</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Down payment buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <Wallet size={12} className="text-[#1a6b7d]" />
                      الدفعة الأولى
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {DOWN_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDownExtra(opt.value)}
                          className={`relative py-3 px-3 rounded-xl border-2 text-right transition-all duration-150 ${
                            downExtra === opt.value
                              ? "border-[#7CC043] bg-[#7CC043]/8 shadow-sm"
                              : "border-gray-200 hover:border-[#7CC043]/40 bg-white"
                          }`}
                        >
                          {downExtra === opt.value && (
                            <span className="absolute top-2 left-2">
                              <CheckCircle2 size={12} className="text-[#7CC043]" />
                            </span>
                          )}
                          <p className={`text-sm font-extrabold ${downExtra === opt.value ? "text-[#3b6a00]" : "text-gray-700"}`}>
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monthly summary pill */}
                  <div className="bg-gradient-to-r from-[#1a6b7d]/8 to-[#7CC043]/8 border border-[#1a6b7d]/15 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">القسط الشهري</p>
                      <p className="text-2xl font-extrabold text-[#1a6b7d] mt-0.5">
                        {fmt(monthly)} <span className="text-sm font-semibold text-gray-400">ر.س</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium">لمدة</p>
                      <p className="text-lg font-extrabold text-[#7CC043]">
                        {months} <span className="text-sm font-semibold text-gray-400">شهر</span>
                      </p>
                    </div>
                  </div>

                  {/* Schedule toggle */}
                  <button
                    type="button"
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full flex items-center justify-between text-xs text-[#1a6b7d] font-semibold bg-[#1a6b7d]/5 hover:bg-[#1a6b7d]/10 transition rounded-xl px-4 py-2.5"
                  >
                    <span>عرض جدول الأقساط التفصيلي</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showSchedule ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showSchedule && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl overflow-hidden border border-gray-100 max-h-52 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-[#1a6b7d] sticky top-0">
                              <tr>
                                <th className="py-2.5 px-3 text-right font-semibold text-white/80">#</th>
                                <th className="py-2.5 px-3 text-right font-semibold text-white/80">التاريخ</th>
                                <th className="py-2.5 px-3 text-right font-semibold text-white/80">المبلغ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schedule.map((row, i) => (
                                <tr key={row.index} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                                  <td className="py-2 px-3 text-[#1a6b7d] font-bold">{row.index}</td>
                                  <td className="py-2 px-3 text-gray-500">{row.date}</td>
                                  <td className="py-2 px-3 font-bold text-gray-800">{fmt(row.amount)} ر.س</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-bl from-[#1a6b7d] to-[#155e6f] text-white rounded-xl font-extrabold text-base shadow-lg shadow-[#1a6b7d]/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        متابعة إلى الدفع ←
      </button>
    </div>
  );
}
