"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, User, CreditCard } from "lucide-react";
import { RiUser3Line, RiIdCardLine, RiWhatsappLine, RiMapPin2Line } from "react-icons/ri";
import type { CustomerInfo } from "../../store/cartStore";

interface Props {
  customer: CustomerInfo;
  total: number;
  onDone: () => void;
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default function OrderReviewPopup({ customer, total, onDone }: Props) {
  const isInstallment = customer.installmentType === "installment";
  const duration = isInstallment ? 7000 : 3000;
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), duration);
    return () => clearTimeout(t);
  }, [duration]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(onDone, 2400);
      return () => clearTimeout(t);
    }
  }, [done, onDone]);

  const finalTotal = total - (customer.discountAmount ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm sm:px-4"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="w-full sm:max-w-sm bg-[#f4f6f8] sm:rounded-3xl rounded-none overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-[#1a6b7d] to-[#1d8fa5] px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium">ملخص طلبك</p>
            <h2 className="text-white font-extrabold text-xl sm:text-2xl mt-0.5">{fmt(finalTotal)} <span className="text-sm font-semibold text-white/70">ر.س</span></h2>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
            <CreditCard size={20} className="text-white" />
          </div>
        </div>

        <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-3">

          {/* بوكس بيانات العميل */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
              <div className="w-7 h-7 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
                <User size={13} className="text-[#1a6b7d]" />
              </div>
              <p className="text-xs font-extrabold text-gray-700">بيانات العميل</p>
            </div>
            <div className="px-4 py-3 space-y-3">
              {[
                { icon: RiUser3Line,    label: "الاسم",    value: customer.name,       ltr: false },
                { icon: RiIdCardLine,   label: "الهوية",   value: customer.nationalId, ltr: true  },
                { icon: RiWhatsappLine, label: "واتساب",   value: customer.whatsapp,   ltr: true  },
                { icon: RiMapPin2Line,  label: "العنوان",  value: customer.address,    ltr: false },
              ].map(({ icon: Icon, label, value, ltr }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={14} className="text-[#1a6b7d] shrink-0" />
                  <span className="text-xs text-gray-400 w-12 shrink-0">{label}</span>
                  <span className="text-sm font-bold text-gray-800 flex-1 truncate" dir={ltr ? "ltr" : "rtl"}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* بوكس بيانات الدفع */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
              <div className="w-7 h-7 bg-[#7CC043]/15 rounded-lg flex items-center justify-center">
                <CreditCard size={13} className="text-[#7CC043]" />
              </div>
              <p className="text-xs font-extrabold text-gray-700">بيانات الدفع</p>
            </div>
            <div className="px-4 py-3 space-y-3">
              <PayRow label="إجمالي الطلب" value={`${fmt(finalTotal)} ر.س`} highlight />
              {isInstallment ? (
                <>
                  <PayRow label="الدفعة الأولى"  value={`${fmt(customer.downPayment)} ر.س`} />
                  <PayRow label="جهة التقسيط"    value={customer.installmentProvider === "tabby" ? "Tabby" : customer.installmentProvider === "store" ? "نظام المتجر" : "Tamara"} />
                  <PayRow label="عدد الأشهر"     value={`${customer.months} شهر`} />
                </>
              ) : (
                <PayRow label="طريقة الدفع" value="كاش كامل" />
              )}
              {customer.discountAmount ? (
                <PayRow label="خصم مطبّق" value={`- ${fmt(customer.discountAmount)} ر.س`} green />
              ) : null}
            </div>
          </div>

          {/* Spinner / Success */}
          <div className="bg-white rounded-2xl px-4 py-5 flex flex-col items-center gap-3 shadow-sm">
            <AnimatePresence mode="wait">
              {!done ? (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-2.5"
                >
                  <div className="w-12 h-12 rounded-full border-[3.5px] border-gray-100 border-t-[#1a6b7d] animate-spin" />
                  <p className="text-sm font-bold text-gray-700">جاري مراجعة طلبك</p>
                  {isInstallment && (
                    <p className="text-xs text-gray-400 text-center">جاري متابعة إمكانية قبول التقسيط لحسابك</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="flex flex-col items-center gap-2.5"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 size={26} className="text-green-500" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center space-y-1"
                  >
                    <p className="text-green-600 font-extrabold text-sm">تمت الموافقة ✓</p>
                    <p className="text-xs text-green-500 leading-relaxed">
                      {isInstallment
                        ? "تمت الموافقة على تنفيذ عملية البيع بالتقسيط لحسابك"
                        : "تمت مراجعة طلبك بنجاح"}
                      <br />جاري تحويلك إلى صفحة الدفع…
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

function PayRow({ label, value, highlight, green }: { label: string; value: string; highlight?: boolean; green?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-extrabold ${highlight ? "text-[#1a6b7d] text-base" : green ? "text-green-600" : "text-gray-800"}`}>
        {value}
      </span>
    </div>
  );
}
