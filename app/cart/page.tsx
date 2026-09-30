"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import type { CustomerInfo } from "../store/cartStore";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import CartItemCard from "../components/checkout/CartItemCard";
import CustomerInfoForm from "./components/CustomerInfoForm";
import PaymentForm from "./components/PaymentForm";
import DiscountBanner from "./components/DiscountPopup";
import OrderReviewPopup from "./components/OrderReviewPopup";
import { RiShoppingCart2Line, RiArrowRightLine, RiHome4Line, RiArrowLeftSLine } from "react-icons/ri";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, totalPrice, totalItems, setCustomer, customer } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [customerDraft, setCustomerDraft] = useState<Partial<CustomerInfo>>(customer ?? {});
  const [reviewInfo, setReviewInfo] = useState<CustomerInfo | null>(null);
  const [installmentMonths, setInstallmentMonths] = useState<number | undefined>(undefined);
  const [downPaymentAmounts, setDownPaymentAmounts] = useState<number[]>([1000, 1500, 2000]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || items.length === 0) return;

    const categories = [...new Set(items.map((i) => i.product.category).filter(Boolean))].join(",");

    Promise.all([
      fetch("/api/admin/down-payments", { credentials: "include" }).then((r) => r.json()).catch(() => ({})),
      fetch(`/api/admin/product-down-payments/public?categories=${encodeURIComponent(categories)}`).then((r) => r.json()).catch(() => ({})),
    ]).then(([globalData, catData]) => {
      // لو كل المنتجات من نفس الكاتيجوري وعندها دفعات مخصصة، استخدمها
      const uniqueCategories = [...new Set(items.map((i) => i.product.category).filter((c): c is string => Boolean(c)))];
      const allSameCategory = uniqueCategories.length === 1 && catData[uniqueCategories[0]]?.length > 0;
      if (allSameCategory) {
        setDownPaymentAmounts(catData[uniqueCategories[0]]);
      } else if (globalData?.amounts?.length > 0) {
        setDownPaymentAmounts(globalData.amounts);
      }
    });

    const fallback = Math.max(...items.map((i) => i.product.installment?.months ?? 0)) || undefined;
    setInstallmentMonths(fallback);
  }, [mounted, items]);

  const total = mounted ? totalPrice() : 0;
  const count = mounted ? totalItems() : 0;

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f4f6f8]" dir="rtl">
        <CheckoutStepper currentStep={1} />
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 gap-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-[#1a6b7d]/10 rounded-full flex items-center justify-center"
          >
            <RiShoppingCart2Line size={42} className="text-[#1a6b7d]" />
          </motion.div>
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="text-center">
            <h2 className="text-xl font-extrabold text-gray-800">السلة فارغة</h2>
            <p className="text-gray-400 text-sm mt-1">لم تضف أي منتجات بعد</p>
          </motion.div>
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
            <Link href="/" className="inline-flex items-center gap-2 bg-[#1a6b7d] text-white px-7 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#1a6b7d]/25 hover:bg-[#155e6f] transition-colors">
              <RiArrowRightLine size={16} />
              تصفح المنتجات
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8]" dir="rtl">
      <style>{`body { background-color: #f4f6f8; }`}</style>
      <CheckoutStepper currentStep={step === 1 ? 1 : 2} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 pb-28">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
          <Link href="/" className="flex items-center gap-1 hover:text-[#1a6b7d] transition-colors">
            <RiHome4Line size={13} />
            الرئيسية
          </Link>
          <RiArrowLeftSLine size={14} className="text-gray-300" />
          <span className="text-gray-600 font-semibold">سلة التسوق</span>
          <span className="mr-auto bg-[#1a6b7d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {count} منتج
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* المنتجات */}
              <AnimatePresence>
                {items.map(({ product, qty }) => (
                  <CartItemCard
                    key={product._id}
                    product={product}
                    qty={qty}
                    onUpdateQty={updateQty}
                    onRemove={removeItem}
                  />
                ))}
              </AnimatePresence>

              {/* سطر الإجمالي */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium mb-0.5">إجمالي الطلب</p>
                  <p className="text-2xl font-extrabold text-[#1a6b7d] leading-none">
                    {fmt(total)} <span className="text-sm font-semibold text-gray-400">ر.س</span>
                  </p>
                </div>
                <span className="text-xs font-bold text-[#7CC043] bg-[#7CC043]/10 px-3 py-1.5 rounded-full border border-[#7CC043]/20">
                  🚚 شحن مجاني
                </span>
              </div>

              {/* بانر الخصم */}
              <DiscountBanner />

              {/* فورم البيانات */}
              <CustomerInfoForm
                initialData={customerDraft}
                onNext={(info) => {
                  setCustomerDraft(info);
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <PaymentForm
                total={total}
                itemCount={count}
                initialData={customerDraft}
                installmentMonths={installmentMonths}
                downPaymentAmounts={downPaymentAmounts}
                onBack={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onSubmit={(info: CustomerInfo) => {
                  setCustomer(info);
                  setReviewInfo(info);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {reviewInfo && (
        <OrderReviewPopup
          customer={reviewInfo}
          total={total}
          onDone={() => router.push("/checkout")}
        />
      )}
    </main>
  );
}
