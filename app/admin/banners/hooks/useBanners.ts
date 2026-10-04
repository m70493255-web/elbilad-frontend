"use client";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { BannerItem } from "../types";
import { compressImage } from "@/app/lib/compress-image";

const BASE = "/api/admin/banners";

export function useBanners() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState<number | null>(null);
  const [addingBanner, setAddingBanner] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(BASE, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (!Array.isArray(data)) { setFetchError(true); return; }
        // Use stable index-based keys — real _id comes from backend
        setBanners(data.map((b: BannerItem, i: number) => ({ ...b, _id: b._id ?? `slot-${i}` })));
      })
      .catch(() => { if (!cancelled) setFetchError(true); });
    return () => { cancelled = true; };
  }, []);

  const handleUpload = async (index: number, file: File) => {
    setLoading(index);
    const form = new FormData();
    try {
      // Compress in-browser before sending — reduces upload from 3-10MB to <200KB
      const compressed = await compressImage(file, 1400, 1400, 0.82);
      form.append("image", compressed);
      const res = await fetch(`${BASE}/upload/${index}`, {
        method: "POST", credentials: "include", body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الرفع");
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, url: data.url } : b));
      toast.success("تم رفع البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteImage = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/${index}/image`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, url: "" } : b));
      toast.success("تم حذف الصورة");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteSlot = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/${index}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setBanners((prev) => prev.filter((_, i) => i !== index));
      toast.success("تم حذف البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setLoading(null);
    }
  };

  const handleToggle = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/toggle/${index}`, {
        method: "PATCH", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التعديل");
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, active: data.active } : b));
      toast.success(data.active ? "تم تفعيل البانر" : "تم إيقاف البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل التعديل");
    } finally {
      setLoading(null);
    }
  };

  const handleAddBanner = async () => {
    setAddingBanner(true);
    try {
      const res = await fetch(`${BASE}/add`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشلت الإضافة");
      setBanners((prev) => [...prev, { url: "", active: true, _id: `slot-${prev.length}` }]);
      toast.success("تمت إضافة بانر جديد");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشلت الإضافة");
    } finally {
      setAddingBanner(false);
    }
  };

  const handleReorder = async (newBanners: BannerItem[], order: number[]) => {
    // Optimistic update first
    setBanners(newBanners);
    try {
      const res = await fetch(`${BASE}/reorder`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) throw new Error("فشل حفظ الترتيب");
      toast.success("تم حفظ الترتيب");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل حفظ الترتيب");
    }
  };

  return {
    banners, loading, addingBanner, fetchError,
    inputRefs, handleUpload, handleDeleteImage,
    handleDeleteSlot, handleToggle, handleAddBanner, handleReorder,
  };
}
