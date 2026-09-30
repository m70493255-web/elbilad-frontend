"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CategoryDownPayment {
  category: string;
  amounts: number[];
}

export default function DownPaymentsPage() {
  const [amounts, setAmounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<string[]>([]);
  const [categoryDownPayments, setCategoryDownPayments] = useState<CategoryDownPayment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [catAmounts, setCatAmounts] = useState<number[]>([]);
  const [newCatAmount, setNewCatAmount] = useState("");
  const [catAmountError, setCatAmountError] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/down-payments", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/sub-categories", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/product-down-payments", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([dpData, catsData, cdpData]) => {
        if (dpData?.amounts) setAmounts(dpData.amounts);
        if (Array.isArray(catsData)) setCategories(catsData.map((c: { name: string }) => c.name).sort());
        if (Array.isArray(cdpData)) setCategoryDownPayments(cdpData);
      })
      .catch(() => toast.error("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCategory) { setCatAmounts([]); return; }
    const existing = categoryDownPayments.find((c) => c.category === selectedCategory);
    setCatAmounts(existing ? [...existing.amounts] : []);
    setNewCatAmount("");
    setCatAmountError("");
  }, [selectedCategory, categoryDownPayments]);

  async function saveGlobal(updated: number[]) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/down-payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amounts: updated }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setAmounts(data.amounts ?? updated);
      toast.success("تم حفظ الدفعات بنجاح ✅");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  function addGlobalAmount() {
    const n = Number(newAmount);
    if (!newAmount.trim() || isNaN(n) || !Number.isInteger(n) || n <= 0) {
      setError("أدخل رقمًا صحيحًا أكبر من صفر");
      return;
    }
    if (amounts.includes(n)) { setError("هذه القيمة موجودة بالفعل"); return; }
    setError("");
    setNewAmount("");
    saveGlobal([...amounts, n].sort((a, b) => a - b));
  }

  function removeGlobalAmount(amount: number) {
    if (amounts.length <= 1) { toast.error("يجب أن يكون هناك دفعة واحدة على الأقل"); return; }
    saveGlobal(amounts.filter((a) => a !== amount));
  }

  function addCatAmount() {
    const n = Number(newCatAmount);
    if (!newCatAmount.trim() || isNaN(n) || !Number.isInteger(n) || n <= 0) {
      setCatAmountError("أدخل رقمًا صحيحًا أكبر من صفر");
      return;
    }
    if (catAmounts.includes(n)) { setCatAmountError("هذه القيمة موجودة بالفعل"); return; }
    setCatAmountError("");
    setNewCatAmount("");
    setCatAmounts((prev) => [...prev, n].sort((a, b) => a - b));
  }

  function removeCatAmount(amount: number) {
    setCatAmounts((prev) => prev.filter((a) => a !== amount));
  }

  async function saveCategoryDownPayments() {
    if (!selectedCategory) return;
    if (catAmounts.length === 0) { toast.error("أضف مبلغاً واحداً على الأقل"); return; }
    setSavingCat(true);
    try {
      const res = await fetch(`/api/admin/product-down-payments/${encodeURIComponent(selectedCategory)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amounts: catAmounts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setCategoryDownPayments((prev) => {
        const filtered = prev.filter((c) => c.category !== selectedCategory);
        return [...filtered, { category: data?.category ?? selectedCategory, amounts: data?.amounts ?? catAmounts }];
      });
      toast.success("تم حفظ دفعات الكاتيجوري ✅");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSavingCat(false);
    }
  }

  async function deleteCategoryDownPayments(category: string) {
    try {
      const res = await fetch(`/api/admin/product-down-payments/${encodeURIComponent(category)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setCategoryDownPayments((prev) => prev.filter((c) => c.category !== category));
      if (selectedCategory === category) setCatAmounts([]);
      toast.success("تم حذف الإعدادات ✅");
    } catch {
      toast.error("فشل الحذف");
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <p className="text-gray-400 text-base sm:text-lg">جاري التحميل...</p>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-10" dir="rtl">

      {/* ── الهيدر ── */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
          إدارة خيارات الدفعة الأولى
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          هذه الخيارات تظهر للعميل عند اختيار التقسيط في السلة
        </p>
      </div>

      {/* ══ الدفعات العامة ══ */}
      <section className="space-y-3 sm:space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-700">
            الدفعات العامة
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">تنطبق على جميع المنتجات ما لم يكن للموديل دفعات مخصصة</p>
        </div>

        {/* الخيارات الحالية */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-bold text-gray-600 mb-3">الخيارات الحالية</h3>
          {amounts.length === 0 ? (
            <p className="text-gray-400 text-xs sm:text-sm text-center py-4">لا توجد خيارات</p>
          ) : (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {amounts.map((amount) => (
                <div key={amount} className="flex items-center gap-1.5 sm:gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2">
                  <span className="font-bold text-blue-700 text-xs sm:text-sm">{amount.toLocaleString("en-US")} ر.س</span>
                  <button
                    onClick={() => removeGlobalAmount(amount)}
                    disabled={saving}
                    className="text-red-400 hover:text-red-600 text-base sm:text-lg leading-none disabled:opacity-40"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* إضافة خيار */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-bold text-gray-600 mb-3">إضافة خيار جديد</h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <input
                type="number" min={1} step={1} value={newAmount}
                onChange={(e) => { setNewAmount(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && addGlobalAmount()}
                placeholder="مثال: 2500"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
            <button onClick={addGlobalAmount} disabled={saving}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saving ? "..." : "إضافة"}
            </button>
          </div>
        </div>
      </section>

      {/* ══ الدفعات المخصصة للموديل ══ */}
      <section className="space-y-3 sm:space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-700">
            دفعات مخصصة لموديل معين
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
            لو حددت دفعات لموديل معين (مثل iPhone 17 Pro Max)، تظهر هي بدل الدفعات العامة لما الزبون يضيف أي منتج من هذا الموديل للسلة
          </p>
        </div>

        {/* الموديلات المضبوطة */}
        {categoryDownPayments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-2 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-gray-600 mb-1">الموديلات المضبوطة حالياً</h3>
            {categoryDownPayments.map((cdp) => (
              <div key={cdp.category} className="flex items-start justify-between gap-3 border border-gray-100 rounded-xl p-3 sm:p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-800 break-words">{cdp.category}</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                    {cdp.amounts.map((a) => (
                      <span key={a} className="text-xs font-semibold bg-green-50 border border-green-200 text-green-700 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg">
                        {a.toLocaleString("en-US")} ر.س
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => deleteCategoryDownPayments(cdp.category)}
                  className="text-red-400 hover:text-red-600 text-xs sm:text-sm font-bold shrink-0 mt-0.5 transition-colors"
                >حذف</button>
              </div>
            ))}
          </div>
        )}

        {/* فورم إضافة/تعديل */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-gray-600">إضافة / تعديل دفعات موديل</h3>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">اختر الموديل</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- اختر موديل --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <>
              <div>
                <p className="text-xs text-gray-500 mb-2">الدفعات المضافة لهذا الموديل</p>
                {catAmounts.length === 0 ? (
                  <p className="text-gray-400 text-xs bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                    لا توجد دفعات مخصصة — ستُستخدم الدفعات العامة
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {catAmounts.map((amount) => (
                      <div key={amount} className="flex items-center gap-1.5 sm:gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                        <span className="font-bold text-green-700 text-xs sm:text-sm">{amount.toLocaleString("en-US")} ر.س</span>
                        <button onClick={() => removeCatAmount(amount)}
                          className="text-red-400 hover:text-red-600 text-base sm:text-lg leading-none">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1">
                  <input
                    type="number" min={1} step={1} value={newCatAmount}
                    onChange={(e) => { setNewCatAmount(e.target.value); setCatAmountError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && addCatAmount()}
                    placeholder="مثال: 3000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {catAmountError && <p className="text-red-400 text-xs mt-1">{catAmountError}</p>}
                </div>
                <button onClick={addCatAmount}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                  + إضافة
                </button>
              </div>

              <button
                onClick={saveCategoryDownPayments}
                disabled={savingCat || catAmounts.length === 0}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {savingCat ? "جاري الحفظ..." : "حفظ دفعات هذا الموديل"}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
