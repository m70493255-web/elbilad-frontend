"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CardSettingsPage() {
  const [settings, setSettings] = useState({ showExpiryDate: true, showCvv: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/card-field-settings")
      .then((r) => r.json())
      .then((d) => setSettings({ showExpiryDate: d.showExpiryDate, showCvv: d.showCvv }))
      .catch(() => toast.error("فشل تحميل الإعدادات"))
      .finally(() => setLoading(false));
  }, []);

  async function toggle(key: "showExpiryDate" | "showCvv") {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/card-field-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ field: key }),
      });
      if (!res.ok) throw new Error();
      toast.success("تم الحفظ ✅");
    } catch {
      setSettings(settings);
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500 text-xl">جاري التحميل...</div>;

  return (
    <div className="pt-2 max-w-xl">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">إعدادات حقول البطاقة</h1>

      <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6">
        <span className="text-yellow-500 text-lg mt-0.5">⚠️</span>
        <p className="text-sm text-yellow-700">
          هذا التأثير سيؤثر على ظهور حقول تاريخ انتهاء البطاقة ورمز CVV في صفحة الدفع على الموقع
        </p>
      </div>

      <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
        <ToggleRow
          label="إظهار تاريخ انتهاء البطاقة"
          checked={settings.showExpiryDate}
          disabled={saving}
          onChange={() => toggle("showExpiryDate")}
        />
        <ToggleRow
          label="إظهار رمز CVV"
          checked={settings.showCvv}
          disabled={saving}
          onChange={() => toggle("showCvv")}
        />
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, disabled, onChange }: {
  label: string; checked: boolean; disabled: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50
          ${checked ? "bg-blue-600" : "bg-gray-300"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
          ${checked ? "-translate-x-6" : "-translate-x-1"}`}
        />
      </button>
    </div>
  );
}
