"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState(true);
  const [description, setDescription] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [gallery, setGallery] = useState<{ mode: "upload" | "url" | "existing"; file?: File; preview?: string; url?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories", { credentials: "include" })
      .then((r) => r.json())
      .then((data: string[]) => setCategories(data.filter(Boolean).sort()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/admin/products/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((p) => {
        setName(p.name || "");
        setOriginalPrice(p.originalPrice != null ? String(p.originalPrice) : "");
        setSalePrice(p.salePrice != null ? String(p.salePrice) : "");
        setCategory(p.category || "");
        setInStock(p.inStock ?? true);
        setDescription(p.description || "");
        setCurrentImage(p.image || "");
        if (p.images?.length) {
          setGallery(p.images.map((url: string) => ({ mode: "existing" as const, url })));
        }
      })
      .catch(() => toast.error("فشل تحميل المنتج"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function clearMainImage() {
    setImageFile(null);
    setImagePreview("");
    setImageUrl("");
    setCurrentImage("");
  }

  function addGalleryFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newItems = Array.from(files).map((f) => ({
      mode: "upload" as const,
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setGallery((prev) => [...prev, ...newItems]);
    e.target.value = "";
  }

  function addGalleryUrl() {
    setGallery((prev) => [...prev, { mode: "url", url: "" }]);
  }

  function updateGalleryUrl(index: number, url: string) {
    setGallery((prev) => prev.map((item, i) => (i === index ? { ...item, url } : item)));
  }

  function removeGalleryItem(index: number) {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("originalPrice", originalPrice);
      fd.append("salePrice", salePrice);
      fd.append("category", category);
      fd.append("inStock", String(inStock));
      fd.append("description", description);

      if (imageMode === "upload" && imageFile) {
        fd.append("image", imageFile);
      } else if (imageMode === "url" && imageUrl.trim()) {
        fd.append("imageUrl", imageUrl.trim());
      } else if (!imageFile && !imageUrl && !currentImage) {
        fd.append("removeImage", "true");
      }

      const galleryUrls: string[] = [];
      gallery.forEach((item) => {
        if (item.mode === "upload" && item.file) {
          fd.append("galleryFiles", item.file);
        } else if ((item.mode === "url" || item.mode === "existing") && item.url?.trim()) {
          galleryUrls.push(item.url.trim());
        }
      });
      if (galleryUrls.length) fd.append("galleryUrls", JSON.stringify(galleryUrls));
      fd.append("hasGallery", "true");

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      toast.success("تم حفظ التعديلات بنجاح ✅");
      router.push("/admin/products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayImage = imageMode === "upload" ? (imagePreview || currentImage) : imageUrl;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-4 py-4">
      <h1 className="text-xl font-bold text-gray-800">تعديل المنتج</h1>

      {/* Main Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">صورة المنتج الرئيسية</label>
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={() => setImageMode("upload")} className={`px-3 py-1.5 text-xs rounded-lg border ${imageMode === "upload" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"}`}>
            رفع صورة
          </button>
          <button type="button" onClick={() => { setImageMode("url"); if (!imageUrl && currentImage) setImageUrl(currentImage); }} className={`px-3 py-1.5 text-xs rounded-lg border ${imageMode === "url" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"}`}>
            رابط صورة
          </button>
        </div>

        {imageMode === "url" ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className={inputCls} dir="ltr" />
              {imageUrl && (
                <button type="button" onClick={clearMainImage} className="shrink-0 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs hover:bg-red-100 transition-colors">
                  حذف
                </button>
              )}
            </div>
            {imageUrl && <img src={imageUrl} alt="معاينة" className="w-full h-48 object-contain rounded-xl border border-gray-200 bg-gray-50" onError={(e) => (e.currentTarget.style.display = "none")} onLoad={(e) => (e.currentTarget.style.display = "")} />}
          </div>
        ) : (
          <>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
            {displayImage ? (
              <div className="relative w-full h-48 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden group">
                <img src={displayImage} alt="صورة المنتج" className="w-full h-full object-contain cursor-pointer" onClick={() => imageInputRef.current?.click()} />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-white text-sm font-medium">تغيير الصورة</span>
                </div>
                <button type="button" onClick={clearMainImage} className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10">
                  ×
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                <svg className="w-10 h-10 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gray-500 group-hover:text-blue-600">اضغط لاختيار صورة</p>
                <p className="text-xs text-gray-400">JPG, PNG, WEBP</p>
              </button>
            )}
          </>
        )}
      </div>

      {/* Gallery */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">معرض الصور (جاليري)</label>
        <div className="flex gap-2 mb-2">
          <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={addGalleryFiles} />
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
            + رفع صور
          </button>
          <button type="button" onClick={addGalleryUrl} className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
            + رابط صورة
          </button>
        </div>

        {gallery.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((item, i) => (
              <div key={i} className="relative group">
                {item.mode === "url" ? (
                  <div className="space-y-1">
                    <input type="url" value={item.url || ""} onChange={(e) => updateGalleryUrl(i, e.target.value)} placeholder="رابط الصورة" className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" dir="ltr" />
                    {item.url && <img src={item.url} alt="" className="w-full h-20 object-cover rounded-lg border" onError={(e) => (e.currentTarget.style.display = "none")} onLoad={(e) => (e.currentTarget.style.display = "")} />}
                  </div>
                ) : (
                  <img src={item.preview || item.url} alt="" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                )}
                <button type="button" onClick={() => removeGalleryItem(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {gallery.length === 0 && <p className="text-xs text-gray-400">لم يتم إضافة صور للمعرض بعد</p>}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          اسم المنتج <span className="text-red-500">*</span>
        </label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: iPhone 15 Pro Max" className={inputCls} required />
      </div>

      {/* Original Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          السعر قبل الخصم (ر.س) <span className="text-red-500">*</span>
        </label>
        <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="0" min="0" step="0.01" className={inputCls} required />
        <p className="text-xs text-gray-400 mt-1">هذا هو السعر المشطوب عليه</p>
      </div>

      {/* Sale Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع (ر.س)</label>
        <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="اتركه فارغاً إن لم يكن هناك خصم" min="0" step="0.01" className={inputCls} />
        <p className="text-xs text-red-400 mt-1">هذا هو السعر المعروض بالأحمر</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          <option value="">-- اختر تصنيف --</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          {category && !categories.includes(category) && (
            <option value={category}>{category}</option>
          )}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
        <select value={inStock ? "true" : "false"} onChange={(e) => setInStock(e.target.value === "true")} className={inputCls}>
          <option value="true">متوفر</option>
          <option value="false">غير متوفر</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف المنتج..." rows={4} className={inputCls + " resize-none"} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.push("/admin/products")} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50">
          إلغاء
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {saving ? "جاري الحفظ..." : "حفظ المنتج"}
        </button>
      </div>
    </form>
  );
}

const inputCls = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
