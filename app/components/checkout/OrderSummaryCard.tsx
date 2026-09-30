import { ShoppingCart, Truck, CreditCard, Wallet, CalendarDays, BadgePercent, Banknote } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("en-US");

interface OrderSummaryCardProps {
  total: number;
  itemCount: number;
  downPayment?: number;
  installmentType?: "full" | "installment";
  months?: number;
  cta?: React.ReactNode;
}

export default function OrderSummaryCard({
  total,
  itemCount,
  downPayment,
  installmentType,
  months,
  cta,
}: OrderSummaryCardProps) {
  const isInstallment = installmentType === "installment" && downPayment != null && downPayment > 0;
  const dueNow = isInstallment ? downPayment! : total;
  const remaining = isInstallment ? total - downPayment! : 0;
  const monthlyPayment = isInstallment && months && months > 0 ? Math.ceil(remaining / months) : 0;

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-[#1a6b7d]/15">
      {/* Header */}
      <div className="bg-gradient-to-bl from-[#0f3d4a] via-[#1a6b7d] to-[#1e7d91] px-4 py-3 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
          <ShoppingCart size={14} className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold text-white tracking-wide">ملخص الطلب</h3>
          <span className="text-[10px] text-white/50 bg-white/10 px-2 py-0.5 rounded-full">{itemCount} منتج</span>
        </div>
      </div>

      <div className="bg-white px-4 py-1 divide-y divide-gray-100">
        <div className="flex justify-between items-center py-2">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <ShoppingCart size={12} className="text-[#1a6b7d]" />مجموع السلة
          </span>
          <span className="text-xs font-bold text-gray-800">{fmt(total)} ر.س</span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-xs text-gray-500 flex items-center gap-1.5">
            <Truck size={12} className="text-[#1a6b7d]" />التوصيل
          </span>
          <span className="text-[11px] font-bold text-[#7CC043] bg-[#7CC043]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <BadgePercent size={10} />مجاني
          </span>
        </div>

        {isInstallment && (
          <>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <Wallet size={12} className="text-[#1a6b7d]" />الدفعة الأولى
              </span>
              <span className="text-xs font-bold text-gray-800">{fmt(downPayment!)} ر.س</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <CalendarDays size={12} className="text-[#1a6b7d]" />آلية التقسيط
              </span>
              <span className="text-[11px] font-semibold text-[#1a6b7d] bg-[#1a6b7d]/8 px-2 py-0.5 rounded-full">
                {months} شهر × {fmt(monthlyPayment)} ر.س
              </span>
            </div>
          </>
        )}

        {!isInstallment && (
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <CreditCard size={12} className="text-[#1a6b7d]" />طريقة الدفع
            </span>
            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">دفع كامل</span>
          </div>
        )}
      </div>

      {/* Due Now */}
      <div className="bg-gradient-to-bl from-[#0f3d4a] to-[#1a6b7d] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center">
              <Banknote size={13} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] text-white/60 font-medium">المطلوب دفعه الآن</p>
              {isInstallment && <p className="text-[9px] text-white/40">الدفعة الأولى فقط</p>}
            </div>
          </div>
          <div className="text-left">
            <span className="text-xl font-black text-white">{fmt(dueNow)}</span>
            <span className="text-xs text-white/60 mr-1">ر.س</span>
          </div>
        </div>
      </div>

      {cta && <div className="bg-white px-4 pb-4 pt-3">{cta}</div>}
    </div>
  );
}
