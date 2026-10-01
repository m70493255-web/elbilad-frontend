import { useState } from "react";
import { imageFields, withCacheBust } from "../constants";
import type { CompanyData } from "../types";

interface CompanyImagesProps {
  data: CompanyData;
  onImageChange: (key: string, file: File) => void;
  onImageDelete: (key: string) => void;
}

export default function CompanyImages({ data, onImageChange, onImageDelete }: CompanyImagesProps) {
  const [deleteConfirmKey, setDeleteConfirmKey] = useState<string | null>(null);

  const handleDelete = (key: string) => {
    onImageDelete(key);
    setDeleteConfirmKey(null);
  };

  return (
    <div>
      <div className="flex items-start gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm w-full mb-3">
        <span className="shrink-0">ℹ️</span>
        <span>يتم رفع الصور وحفظها في السحابة فوراً بمجرد اختيارها. لحفظ النصوص وباقي البيانات اضغط &quot;حفظ البيانات&quot; بالأسفل.</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        {imageFields.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">{label}</label>
            {data[key] && (
              <div className="relative inline-block mb-2">
                <img src={withCacheBust(data[key])} alt={label} className="h-14 object-contain rounded border" />
                <button
                  type="button"
                  onClick={() => setDeleteConfirmKey(key)}
                  className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                  title="حذف الصورة"
                >
                  ×
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onImageChange(key, e.target.files[0])}
              className="w-full text-xs sm:text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 sm:file:py-1.5 sm:file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
            />
          </div>
        ))}
      </div>

      {deleteConfirmKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-sm text-center">
            <div className="text-3xl mb-2">🗑️</div>
            <h3 className="text-base font-bold text-gray-800 mb-1">تأكيد حذف الصورة</h3>
            <p className="text-sm text-gray-500 mb-4">
              هل أنت متأكد من حذف {imageFields.find((f) => f.key === deleteConfirmKey)?.label || "الصورة"}؟
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmKey)}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                نعم، احذف
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmKey(null)}
                className="border border-gray-300 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-50 transition"
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
