"use client";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

interface CategoryDownPayment {
  category: string;
  amounts: number[];
}

export default function DownPaymentsPage() {
  // Global Down Payments State
  const [amounts, setAmounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [globalError, setGlobalError] = useState("");

  // Category Down Payments State
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryDownPayments, setCategoryDownPayments] = useState<CategoryDownPayment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [catAmounts, setCatAmounts] = useState<number[]>([]);
  const [initialCatAmounts, setInitialCatAmounts] = useState<number[]>([]);
  const [newCatAmount, setNewCatAmount] = useState("");
  const [catAmountError, setCatAmountError] = useState("");
  const [savingCat, setSavingCat] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Delete Confirmation Modal State
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/down-payments", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/sub-categories", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/product-down-payments", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([dpData, catsData, cdpData]) => {
        if (dpData?.amounts && Array.isArray(dpData.amounts)) {
          setAmounts([...dpData.amounts].sort((a, b) => a - b));
        }
        if (Array.isArray(catsData)) {
          const names = catsData
            .map((c: { name: string }) => c.name)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, "ar"));
          setCategories(names);
        }
        if (Array.isArray(cdpData)) {
          setCategoryDownPayments(cdpData);
        }
      })
      .catch(() => toast.error("فشل تحميل البيانات"))
      .finally(() => setLoading(false));
  }, []);

  // Sync category amounts when selected category changes
  useEffect(() => {
    if (!selectedCategory) {
      setCatAmounts([]);
      setInitialCatAmounts([]);
      return;
    }
    const existing = categoryDownPayments.find((c) => c.category === selectedCategory);
    const initial = existing ? [...existing.amounts].sort((a, b) => a - b) : [];
    setCatAmounts(initial);
    setInitialCatAmounts(initial);
    setNewCatAmount("");
    setCatAmountError("");
  }, [selectedCategory, categoryDownPayments]);

  const hasUnsavedCatChanges = useMemo(() => {
    if (catAmounts.length !== initialCatAmounts.length) return true;
    return catAmounts.some((val, idx) => val !== initialCatAmounts[idx]);
  }, [catAmounts, initialCatAmounts]);

  // Handle switching category safely with unsaved changes check
  function handleSelectCategory(cat: string) {
    if (hasUnsavedCatChanges) {
      if (!window.confirm("لديك تعديلات غير محفوظة لهذا الموديل، هل تريد تجاهلها والانتقال؟")) {
        return;
      }
    }
    setSelectedCategory(cat);
  }

  // Save Global amounts
  async function saveGlobal(updated: number[]) {
    const sorted = Array.from(new Set(updated)).sort((a, b) => a - b);
    setSavingGlobal(true);
    try {
      const res = await fetch("/api/admin/down-payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amounts: sorted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setAmounts(data.amounts ?? sorted);
      toast.success("تم حفظ الدفعات العامة بنجاح ✅");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSavingGlobal(false);
    }
  }

  function addGlobalAmount() {
    const val = Number(newAmount);
    if (!newAmount.trim() || isNaN(val) || !Number.isInteger(val) || val <= 0) {
      setGlobalError("أدخل رقمًا صحيحًا أكبر من صفر");
      return;
    }
    if (amounts.includes(val)) {
      setGlobalError("هذه القيمة مضافة بالفعل");
      return;
    }
    setGlobalError("");
    setNewAmount("");
    saveGlobal([...amounts, val]);
  }

  function removeGlobalAmount(amount: number) {
    if (amounts.length <= 1) {
      toast.error("يجب الإبقاء على دفعة عامة واحدة على الأقل");
      return;
    }
    saveGlobal(amounts.filter((a) => a !== amount));
  }

  // Category amounts helpers
  function addCatAmount() {
    const val = Number(newCatAmount);
    if (!newCatAmount.trim() || isNaN(val) || !Number.isInteger(val) || val <= 0) {
      setCatAmountError("أدخل رقمًا صحيحًا أكبر من صفر");
      return;
    }
    if (catAmounts.includes(val)) {
      setCatAmountError("هذه القيمة موجودة بالفعل في قائمة الموديل");
      return;
    }
    setCatAmountError("");
    setNewCatAmount("");
    setCatAmounts((prev) => Array.from(new Set([...prev, val])).sort((a, b) => a - b));
  }

  function removeCatAmount(amount: number) {
    setCatAmounts((prev) => prev.filter((a) => a !== amount));
  }

  function copyFromGlobal() {
    if (amounts.length === 0) {
      toast.error("لا توجد دفعات عامة لنسخها");
      return;
    }
    setCatAmounts([...amounts]);
    toast.success("تم نسخ الدفعات العامة ✅");
  }

  // Save custom down payments for selected category
  async function saveCategoryDownPayments() {
    if (!selectedCategory) return;
    if (catAmounts.length === 0) {
      toast.error("أضف مبلغ دفعة واحداً على الأقل، أو احذف الإعدادات للعودة للافتراضي");
      return;
    }
    const sorted = Array.from(new Set(catAmounts)).sort((a, b) => a - b);
    setSavingCat(true);
    try {
      const res = await fetch(`/api/admin/product-down-payments/${encodeURIComponent(selectedCategory)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amounts: sorted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");

      setCategoryDownPayments((prev) => {
        const filtered = prev.filter((c) => c.category !== selectedCategory);
        return [...filtered, { category: data?.category ?? selectedCategory, amounts: data?.amounts ?? sorted }];
      });
      setInitialCatAmounts(sorted);
      toast.success(`تم حفظ دفعات ${selectedCategory} بنجاح ✅`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSavingCat(false);
    }
  }

  // Delete category custom down payments (reset to global)
  async function deleteCategoryDownPayments(category: string) {
    try {
      const res = await fetch(`/api/admin/product-down-payments/${encodeURIComponent(category)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setCategoryDownPayments((prev) => prev.filter((c) => c.category !== category));
      if (selectedCategory === category) {
        setCatAmounts([]);
        setInitialCatAmounts([]);
      }
      toast.success("تمت استعادة الدفعات الافتراضية للموديل ✅");
    } catch {
      toast.error("فشل حذف الإعدادات");
    } finally {
      setConfirmDeleteCat(null);
    }
  }

  // Filtered configured categories for search
  const filteredCategoryDownPayments = useMemo(() => {
    if (!categorySearch.trim()) return categoryDownPayments;
    const term = categorySearch.toLowerCase().trim();
    return categoryDownPayments.filter((cdp) => cdp.category.toLowerCase().includes(term));
  }, [categoryDownPayments, categorySearch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">جاري تحميل إعدادات الدفعات...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-10" dir="rtl">
      {/* ── العنوان الرئيسي ── */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
          إدارة خيارات الدفعة الأولى
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
          خيارات الدفعة الأولى المتاحة للعميل عند اختيار نظام التقسيط في سلة الشراء
        </p>
      </div>

      {/* ══ القسم الأول: الدفعات العامة ══ */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">🌐</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">الدفعات العامة (الافتراضية)</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            تنطبق هذه الخيارات افتراضياً على جميع المنتجات، ما لم يتم تحديد دفعات مخصصة لموديل معين.
          </p>
        </div>

        {/* عرض الخيارات الحالية */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-bold text-gray-600 mb-3">الخيارات المفعلة حالياً</h3>
          {amounts.length === 0 ? (
            <p className="text-gray-400 text-xs sm:text-sm text-center py-4 bg-gray-50 rounded-lg">لا توجد خيارات مضافة</p>
          ) : (
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {amounts.map((amount) => (
                <div
                  key={amount}
                  className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2 shadow-2xs hover:bg-blue-100/70 transition-colors"
                >
                  <span className="font-bold text-blue-800 text-sm">{amount.toLocaleString("en-US")} ر.س</span>
                  <button
                    onClick={() => removeGlobalAmount(amount)}
                    disabled={savingGlobal}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-40"
                    title="حذف هذا الخيار"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* إضافة خيار عام جديد */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <h3 className="text-xs sm:text-sm font-bold text-gray-600 mb-3">إضافة خيار عام جديد</h3>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="flex-1">
              <input
                type="number"
                min={1}
                step={1}
                value={newAmount}
                onChange={(e) => {
                  setNewAmount(e.target.value);
                  setGlobalError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && addGlobalAmount()}
                placeholder="مثال: 2500"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {globalError && <p className="text-red-500 text-xs mt-1.5 font-medium">{globalError}</p>}
            </div>
            <button
              onClick={addGlobalAmount}
              disabled={savingGlobal}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {savingGlobal ? "جاري الإضافة..." : "+ إضافة"}
            </button>
          </div>
        </div>
      </section>

      {/* ══ القسم الثاني: الدفعات المخصصة لكل موديل ══ */}
      <section className="space-y-4">
        <div className="border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-green-100 text-green-700 rounded-lg text-sm">📱</span>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">دفعات مخصصة لموديل محدد</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            عند تخصيص خيارات لموديل معين (مثل iPhone 16 Pro Max)، ستظهر هذه المبالغ فقط للعميل بدلاً من الدفعات العامة عند إضافة هذا الموديل للسلة.
          </p>
        </div>

        {/* الموديلات المضبوطة حالياً مع فلتر بحث */}
        {categoryDownPayments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-gray-700">
                الموديلات المضبوطة حالياً ({categoryDownPayments.length})
              </h3>
              {categoryDownPayments.length > 3 && (
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="ابحث عن موديل..."
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-48"
                />
              )}
            </div>

            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto scrollbar-thin">
              {filteredCategoryDownPayments.map((cdp) => (
                <div key={cdp.category} className="py-2.5 flex items-start justify-between gap-3 hover:bg-gray-50/70 rounded-lg px-2 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{cdp.category}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {cdp.amounts.map((a) => (
                        <span
                          key={a}
                          className="text-xs font-semibold bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-md"
                        >
                          {a.toLocaleString("en-US")} ر.س
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSelectCategory(cdp.category)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => setConfirmDeleteCat(cdp.category)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
              {filteredCategoryDownPayments.length === 0 && (
                <p className="text-gray-400 text-xs py-3 text-center">لا توجد نتائج مطابقة لبحثك</p>
              )}
            </div>
          </div>
        )}

        {/* نموذج إضافة وتعديل دفعات الموديل */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-gray-700">إضافة / تعديل دفعات موديل</h3>
            {hasUnsavedCatChanges && selectedCategory && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                ● تعديلات غير محفوظة
              </span>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">اختر الموديل أو التصنيف الفرعي</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleSelectCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">-- اضغط لاختيار الموديل --</option>
              {categories.map((cat) => {
                const isCustom = categoryDownPayments.some((c) => c.category === cat);
                return (
                  <option key={cat} value={cat}>
                    {cat} {isCustom ? "★ (مضبوط)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedCategory && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-gray-600 font-semibold">
                  الدفعات المحددة لـ <span className="text-blue-600">{selectedCategory}</span>:
                </p>
                <button
                  onClick={copyFromGlobal}
                  type="button"
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  📋 نسخ من الدفعات العامة
                </button>
              </div>

              {catAmounts.length === 0 ? (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                  لا توجد دفعات مخصصة لهذا الموديل حالياً. سيستخدم المتجر الدفعات العامة.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  {catAmounts.map((amount) => (
                    <div
                      key={amount}
                      className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 shadow-2xs"
                    >
                      <span className="font-bold text-green-800 text-xs sm:text-sm">{amount.toLocaleString("en-US")} ر.س</span>
                      <button
                        onClick={() => removeCatAmount(amount)}
                        className="text-red-400 hover:text-red-600 text-sm font-bold w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50"
                        title="إزالة هذا المبلغ"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* إضافة مبلغ للموديل */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={newCatAmount}
                    onChange={(e) => {
                      setNewCatAmount(e.target.value);
                      setCatAmountError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && addCatAmount()}
                    placeholder="أدخل مبلغ الدفعة (مثال: 3000)"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {catAmountError && <p className="text-red-500 text-xs mt-1.5 font-medium">{catAmountError}</p>}
                </div>
                <button
                  onClick={addCatAmount}
                  type="button"
                  className="w-full sm:w-auto px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  + إضافة للقائمة
                </button>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={saveCategoryDownPayments}
                  disabled={savingCat || catAmounts.length === 0}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {savingCat ? "جاري حفظ الدفعات..." : "💾 حفظ دفعات هذا الموديل"}
                </button>

                {categoryDownPayments.some((c) => c.category === selectedCategory) && (
                  <button
                    onClick={() => setConfirmDeleteCat(selectedCategory)}
                    type="button"
                    className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    استعادة الافتراضي
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ نافذة تأكيد الحذف ══ */}
      {confirmDeleteCat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h3 className="text-lg font-bold text-gray-800">استعادة الدفعات الافتراضية؟</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              سيتم حذف الدفعات المخصصة لموديل <strong className="text-gray-900">« {confirmDeleteCat} »</strong> وسيعود لاستخدام الدفعات العامة.
            </p>
            <div className="flex gap-2.5 justify-center pt-2">
              <button
                onClick={() => deleteCategoryDownPayments(confirmDeleteCat)}
                className="flex-1 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                نعم، استعد الافتراضي
              </button>
              <button
                onClick={() => setConfirmDeleteCat(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
