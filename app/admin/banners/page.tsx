"use client";
import { useRef, useState } from "react";
import { useBanners } from "./hooks/useBanners";
import BannersHeader from "./components/BannersHeader";
import BannerCard from "./components/BannerCard";
import type { BannerItem } from "./types";

export default function BannersPage() {
  const {
    banners, loading, addingBanner, inputRefs,
    handleUpload, handleDeleteImage, handleDeleteSlot, handleToggle, handleAddBanner, handleReorder,
  } = useBanners();

  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const filled = banners.filter((b) => b.url).length;
  const activeCount = banners.filter((b) => b.url && b.active).length;

  const onDragStart = (i: number) => { dragIndex.current = i; };
  const onDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) { setDragOver(null); return; }

    const newBanners = [...banners];
    const [moved] = newBanners.splice(from, 1);
    newBanners.splice(dropIndex, 0, moved);

    // build original-index order array
    const originalOrder = Array.from({ length: banners.length }, (_, i) => i);
    const [movedIdx] = originalOrder.splice(from, 1);
    originalOrder.splice(dropIndex, 0, movedIdx);

    dragIndex.current = null;
    setDragOver(null);
    handleReorder(newBanners, originalOrder);
  };
  const onDragEnd = () => { dragIndex.current = null; setDragOver(null); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -mx-3 -mt-0 sm:-mx-5 md:-mx-6">
      <BannersHeader
        activeCount={activeCount}
        filled={filled}
        total={banners.length}
        addingBanner={addingBanner}
        onAdd={handleAddBanner}
      />
      <div className="px-4 pt-3 pb-1 text-xs text-gray-400 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        اسحب البانرات لتغيير ترتيب ظهورها في الصفحة الرئيسية
      </div>
      <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {banners.map((banner: BannerItem, i: number) => (
          <div
            key={banner._id ?? i}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDrop={(e) => onDrop(e, i)}
            onDragEnd={onDragEnd}
            className={`cursor-grab active:cursor-grabbing transition-all duration-200 rounded-2xl ${
              dragOver === i ? "ring-2 ring-indigo-400 scale-[1.02] opacity-80" : ""
            } ${dragIndex.current === i ? "opacity-40" : ""}`}
          >
            <BannerCard
              banner={banner}
              index={i}
              isLoading={loading === i}
              inputRef={(el) => { inputRefs.current[i] = el; }}
              onUpload={handleUpload}
              onToggle={handleToggle}
              onDeleteImage={handleDeleteImage}
              onDeleteSlot={handleDeleteSlot}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
