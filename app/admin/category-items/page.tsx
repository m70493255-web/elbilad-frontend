"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

type SubCat = { name: string; category: string; count: number };
type Settings = { category: string; subCategory: string; showInHome: boolean; order: number };

export default function CategoryItemsPage() {
  const [items, setItems] = useState<SubCat[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [max, setMax] = useState(4);
  const [maxInput, setMaxInput] = useState(4);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/sub-categories", { credentials: "include" }).then((r) => r.json()),
      apiFetch("/api/admin/sub-categories/settings", { credentials: "include" }).then((r) => r.json()),
      apiFetch("/api/admin/sub-categories/settings/max", { credentials: "include" }).then((r) => r.json()),
    ]).then(([subs, sets, maxData]) => {
      setItems(Array.isArray(subs) ? subs : []);
      setSettings(Array.isArray(sets) ? sets : []);
      const m = maxData?.max ?? 4;
      setMax(m);
      setMaxInput(m);
      setLoading(false);
    });
  }, []);

  async function handleSaveMax() {
    if (maxInput < 1) return toast.error("الحد الأدنى 1");
    setSaving(true);
    const res = await apiFetch("/api/admin/sub-categories/settings/max", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ max: maxInput }),
    });
    setSaving(false);
    if (!res.ok) return toast.error("حدث خطأ");
    setMax(maxInput);
    toast.success(`تم تحديث الحد إلى ${maxInput} ✅`);
  }

  const visible = settings
    .filter((s) => s.showInHome && s.category !== "__config__")
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const item = items.find((i) => i.category === s.category && i.name === s.subCategory);
      return { ...s, count: item?.count ?? 0 };
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">التصنيفات في الرئيسية</h1>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${visible.length >= max ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}>
          {visible.length}/{max}
        </span>
      </div>

      {/* Max control */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-600 font-medium">الحد الأقصى للتصنيفات في الرئيسية:</span>
        <input
          type="number"
          min={1}
          max={20}
          value={maxInput}
          onChange={(e) => setMaxInput(parseInt(e.target.value) || 1)}
          className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSaveMax}
          disabled={saving || maxInput === max}
          className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
        {visible.length > maxInput && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
            ⚠️ يوجد {visible.length} تصنيف مختار، سيظهر أول {maxInput} فقط
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[500px]">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm">
              <tr>
                <th className="px-4 py-3">الترتيب</th>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">النوع</th>
                <th className="px-4 py-3">عدد المنتجات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">جاري التحميل...</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">لا توجد تصنيفات معروضة في الرئيسية</td></tr>
              ) : (
                visible.map((s, i) => (
                  <tr key={`${s.category}-${s.subCategory}`} className={`hover:bg-gray-50 ${i >= max ? "opacity-40" : ""}`}>
                    <td className="px-4 py-3 text-gray-400 font-medium text-xs sm:text-sm">
                      {i + 1}
                      {i >= max && <span className="mr-1 text-xs text-red-400">(مخفي)</span>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs sm:text-sm">{s.category}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-xs sm:text-sm">{s.subCategory}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${s.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {s.count} منتج
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
