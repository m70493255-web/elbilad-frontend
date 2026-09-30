"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Product } from "../../../components/products/types";

const fmt = (n: number) => n.toLocaleString("ar-SA");

const specLabels: [keyof NonNullable<Product["specs"]>, string, string][] = [
  ["screen",       "الشاشة",            "solar:smartphone-2-bold"],
  ["processor",    "المعالج",           "solar:cpu-bolt-bold"],
  ["ram",          "الرام",             "solar:database-bold"],
  ["storage",      "التخزين",           "solar:hard-drive-bold"],
  ["rearCamera",   "الكاميرا الخلفية",  "solar:camera-bold"],
  ["frontCamera",  "الكاميرا الأمامية", "solar:user-rounded-bold"],
  ["battery",      "البطارية",          "solar:battery-full-bold"],
  ["batteryLife",  "عمر البطارية",      "solar:clock-circle-bold"],
  ["charging",     "الشحن",             "solar:bolt-bold"],
  ["os",           "نظام التشغيل",      "solar:settings-bold"],
  ["extras",       "مميزات إضافية",     "solar:star-bold"],
];

interface ProductDetailsProps {
  installment?: Product["installment"];
  description?: string;
  specs?: Product["specs"];
  isIPhone18?: boolean;
  specGroups?: { group: string; items: { key: string; value: string }[] }[];
}

type Tab = "specs" | "installment" | "description" | "performance";

const tabMeta: Record<Tab, { icon: string; label: string; color: string }> = {
  specs:       { icon: "solar:list-bold",          label: "المواصفات", color: "#1F7A8C" },
  description: { icon: "solar:document-text-bold", label: "الوصف",     color: "#6DBE00" },
  installment: { icon: "solar:card-bold",          label: "التقسيط",   color: "#f59e0b" },
  performance: { icon: "solar:cpu-bolt-bold",       label: "الأداء",    color: "#1F7A8C" },
};

// Component for expandable spec item
function SpecItem({ iconName, label, value }: { iconName: string; label: string; value: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = value.length > 100;
  const displayValue = shouldTruncate && !isExpanded ? value.substring(0, 100) + "..." : value;

  return (
    <div className="group relative bg-white hover:bg-gradient-to-l hover:from-[#f0fdf9] hover:to-white transition-all duration-300 rounded-xl p-4 border border-gray-100 hover:border-[#155E6F]/20 hover:shadow-sm">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#155E6F]/10 to-[#1F7A8C]/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Icon icon={iconName} width={20} className="text-[#1F7A8C]" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-400 mb-1.5">{label}</p>
          <p className="text-sm font-semibold text-gray-800 leading-relaxed break-words">
            {displayValue}
          </p>
          
          {/* Read More Button */}
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#1F7A8C] hover:text-[#155E6F] transition-colors"
            >
              <span>{isExpanded ? "عرض أقل" : "اقرأ المزيد"}</span>
              <Icon 
                icon={isExpanded ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"} 
                width={14}
                className="transition-transform duration-200"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails({ installment, description, specs, isIPhone18 = false, specGroups }: ProductDetailsProps) {
  const hasSpecs = specs && Object.values(specs).some(Boolean);
  const performanceGroup = specGroups?.find((g) => g.group === "الأداء");

  const tabs: { key: Tab; show: boolean }[] = [
    { key: "specs",       show: !!hasSpecs && !isIPhone18 },
    { key: "description", show: !!description && !isIPhone18 },
    { key: "performance", show: false },
    { key: "installment", show: !!installment?.available },
  ];
  const visibleTabs = tabs.filter((t) => t.show);
  const [active, setActive] = useState<Tab>(visibleTabs[0]?.key || "specs");

  if (!visibleTabs.length) return null;

  const currentTab = visibleTabs.some((t) => t.key === active) ? active : visibleTabs[0]?.key;

  return (
    <div className="mt-6 sm:mt-10" dir="rtl">
      {/* Tab buttons */}
      <div className="flex gap-2 sm:gap-3 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {visibleTabs.map((t) => {
          const m = tabMeta[t.key];
          const isActive = currentTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? "bg-[#155E6F] text-white border-[#155E6F] shadow-md shadow-[#155E6F]/20"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#155E6F]/40 hover:text-[#155E6F]"
              }`}
            >
              <Icon icon={m.icon} width={15} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* ── Specs ── */}
        {currentTab === "specs" && hasSpecs && (
          <div>
            {/* header */}
            <div className="relative overflow-hidden px-5 py-5 border-b border-gray-100 bg-gradient-to-l from-[#e6f7fa] via-[#f0fdf9] to-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#155E6F]/5 rounded-full blur-3xl"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#155E6F] to-[#1F7A8C] flex items-center justify-center shadow-lg shadow-[#155E6F]/20">
                  <Icon icon="solar:list-bold" width={22} className="text-white" />
                </div>
                <div>
                  <p className="text-base font-black text-gray-800">المواصفات التقنية</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">تفاصيل شاملة ومواصفات دقيقة</p>
                </div>
              </div>
            </div>
            
            {/* specs grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 bg-gradient-to-b from-gray-50/50 to-white">
              {specLabels.map(([key, label, iconName]) =>
                specs[key] ? (
                  <SpecItem
                    key={key}
                    iconName={iconName}
                    label={label}
                    value={specs[key]!}
                  />
                ) : null
              )}
            </div>
            
            {/* Footer decoration */}
            <div className="px-5 py-4 bg-gradient-to-l from-[#f0fdf9] to-white border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Icon icon="solar:shield-check-bold" width={16} className="text-[#1F7A8C]" />
                <span className="font-semibold">جميع المواصفات معتمدة من الشركة المصنعة</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Description ── */}
        {currentTab === "description" && description && (() => {
          const lines = description.split("\n").map(l => l.trim()).filter(Boolean);
          const title = lines[0];
          const items = lines.slice(1);
          return (
            <div>
              {/* header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-l from-[#f4fde8] to-white">
                <div className="w-9 h-9 rounded-xl bg-[#6DBE00]/15 flex items-center justify-center">
                  <Icon icon="solar:document-text-bold" width={18} className="text-[#6DBE00]" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-800">{title || "وصف المنتج"}</p>
                  <p className="text-[11px] text-gray-400">مميزات وتفاصيل</p>
                </div>
              </div>
              {/* items */}
              {items.length > 0 && (
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map((line, i) => (
                    <div key={i} className="flex items-start gap-3 bg-[#f8fafb] rounded-xl px-4 py-3 border border-gray-100">
                      <div className="w-6 h-6 rounded-lg bg-[#6DBE00]/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon icon="solar:check-circle-bold" width={14} className="text-[#6DBE00]" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                        {line.replace(/^[•\-\*]\s*/, "")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {/* warning */}
              <div className="mx-4 sm:mx-5 mb-5 flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <Icon icon="solar:danger-triangle-bold" width={18} className="text-amber-500 shrink-0" />
                <p className="text-[11px] sm:text-xs font-semibold text-amber-700">عدم استيفاء أي من الشروط أعلاه قد يؤدي إلى رفض الطلب</p>
              </div>
            </div>
          );
        })()}

        {/* ── Performance ── */}
        {currentTab === "performance" && performanceGroup && (
          <div className="p-4 sm:p-6 text-center text-gray-400 text-sm">لا توجد بيانات</div>
        )}

        {/* ── Installment ── */}
        {currentTab === "installment" && installment?.available && (
          <div>
            {/* header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-l from-[#fffbeb] to-white">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Icon icon="solar:card-bold" width={18} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-800">التقسيط الميسر</p>
                <p className="text-[11px] text-gray-400">أقساط شهرية مريحة بدون تعقيد</p>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* highlight card */}
              <div className="flex items-center gap-4 bg-gradient-to-l from-[#f0fbe4] to-[#f7fdf0] rounded-2xl p-4 border border-[#6DBE00]/20">
                <div className="w-11 h-11 rounded-xl bg-[#6DBE00]/20 flex items-center justify-center shrink-0">
                  <Icon icon="solar:wallet-money-bold" width={22} className="text-[#4fa800]" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#3d6b1a]">احصل عليه الآن بالتقسيط</p>
                  {installment.downPayment && (
                    <p className="text-xs text-[#6DBE00] font-semibold mt-0.5">مقدم {fmt(installment.downPayment)} ر.س فقط</p>
                  )}
                  {installment.note && <p className="text-[11px] text-gray-500 mt-0.5">{installment.note}</p>}
                </div>
              </div>

              {/* policy */}
              {installment.policy && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <Icon icon="solar:crown-bold" width={16} className="text-amber-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-amber-700">{installment.policy}</span>
                </div>
              )}

              {/* conditions */}
              {installment.conditions && installment.conditions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="solar:clipboard-list-bold" width={15} className="text-gray-400" />
                    <p className="text-xs font-bold text-gray-500">شروط التقديم</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {installment.conditions.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 bg-[#f8fafb] rounded-xl px-4 py-3 border border-gray-100">
                        <div className="w-5 h-5 rounded-md bg-[#1F7A8C]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon icon="solar:check-circle-bold" width={13} className="text-[#1F7A8C]" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
