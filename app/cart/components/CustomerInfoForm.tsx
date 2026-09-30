"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiUser3Line, RiIdCardLine, RiWhatsappLine, RiMapPin2Line, RiArrowLeftLine, RiErrorWarningLine } from "react-icons/ri";
import type { CustomerInfo } from "../../store/cartStore";

interface Props {
  initialData?: Partial<CustomerInfo>;
  onNext: (info: Partial<CustomerInfo>) => void;
}

const inputBase =
  "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b7d]/25 focus:border-[#1a6b7d] focus:bg-white transition-all placeholder:text-gray-400";
const inputErr =
  "w-full bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400/25 focus:bg-white transition-all placeholder:text-gray-400";

const fields = [
  { key: "name",       label: "الاسم كاملاً",           icon: RiUser3Line,     placeholder: "أدخل اسمك بالكامل",      dir: "rtl" },
  { key: "nationalId", label: "رقم الهوية / الإقامة",   icon: RiIdCardLine,    placeholder: "رقم الهوية",              dir: "ltr" },
  { key: "whatsapp",   label: "رقم الواتساب",            icon: RiWhatsappLine,  placeholder: "05XXXXXXXX",              dir: "ltr" },
  { key: "address",    label: "عنوان التوصيل",           icon: RiMapPin2Line,   placeholder: "المدينة - الحي - الشارع", dir: "rtl" },
];

export default function CustomerInfoForm({ initialData, onNext }: Props) {
  const [values, setValues] = useState({
    name:       initialData?.name       ?? "",
    nationalId: initialData?.nationalId ?? "",
    whatsapp:   initialData?.whatsapp   ?? "",
    address:    initialData?.address    ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const refs = {
    name:       useRef<HTMLDivElement>(null),
    nationalId: useRef<HTMLDivElement>(null),
    whatsapp:   useRef<HTMLDivElement>(null),
    address:    useRef<HTMLDivElement>(null),
  };

  const set = (key: string, val: string) => {
    setValues(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  const handleChange = (key: string, raw: string) => {
    if (key === "name")       return set(key, raw.replace(/[0-9]/g, ""));
    if (key === "nationalId") return set(key, raw.replace(/\D/g, "").slice(0, 10));
    if (key === "whatsapp")   return set(key, raw.replace(/\D/g, "").slice(0, 10));
    set(key, raw);
  };

  const getInputProps = (key: string) => {
    if (key === "nationalId") return { inputMode: "numeric" as const, pattern: "[0-9]*", maxLength: 10 };
    if (key === "whatsapp")   return { inputMode: "numeric" as const, pattern: "[0-9]*", maxLength: 10 };
    return {};
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.name.trim()) e.name = "الاسم مطلوب";
    if (!values.nationalId.trim()) e.nationalId = "رقم الهوية مطلوب";
    else if (!/^[12]\d{9}$/.test(values.nationalId.trim())) e.nationalId = "يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام";
    if (!values.whatsapp.trim()) e.whatsapp = "رقم الواتساب مطلوب";
    else if (!/^05\d{8}$/.test(values.whatsapp.trim())) e.whatsapp = "يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!values.address.trim()) e.address = "العنوان مطلوب";
    setErrors(e);
    const first = ["name", "nationalId", "whatsapp", "address"].find(k => e[k]);
    if (first) refs[first as keyof typeof refs].current?.scrollIntoView({ behavior: "smooth", block: "center" });
    return Object.keys(e).length === 0;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
          <RiUser3Line size={16} className="text-[#1a6b7d]" />
        </div>
        <h2 className="text-sm font-bold text-gray-800">معلومات العميل</h2>
      </div>

      {/* Fields */}
      <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ key, label, icon: Icon, placeholder, dir }) => (
          <div key={key} ref={refs[key as keyof typeof refs]} className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
              <Icon size={12} className="text-[#1a6b7d]" />
              {label} <span className="text-red-400">*</span>
            </label>
            <input
              value={values[key as keyof typeof values]}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={placeholder}
              dir={dir}
              type={key === "whatsapp" ? "tel" : "text"}
              {...getInputProps(key)}
              className={errors[key] ? inputErr : inputBase}
            />
            <AnimatePresence>
              {errors[key] && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs flex items-center gap-1"
                >
                  <RiErrorWarningLine size={12} /> {errors[key]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="px-5 pb-5">
        <button
          onClick={() => { if (validate()) onNext(values); }}
          className="w-full py-3.5 bg-gradient-to-l from-[#1a6b7d] to-[#1d8fa5] text-white rounded-xl font-extrabold text-sm shadow-lg shadow-[#1a6b7d]/20 hover:shadow-[#1a6b7d]/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
        >
          التالي — اختيار طريقة الدفع
          <RiArrowLeftLine size={16} />
        </button>
      </div>
    </div>
  );
}
