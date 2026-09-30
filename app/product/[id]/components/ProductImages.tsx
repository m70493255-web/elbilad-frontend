"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { IoChevronBack, IoChevronForward, IoExpand, IoClose, IoAddOutline, IoRemoveOutline } from "react-icons/io5";

interface ProductImagesProps {
  images: string[];
  name: string;
  discountPercent?: number;
}

export default function ProductImages({ images, name, discountPercent = 0 }: ProductImagesProps) {
  const [sel, setSel] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const touchX = useRef(0);

  const go = (d: number) => setSel((s) => (s + d + images.length) % images.length);

  const openLightbox = () => { setLightbox(true); setZoom(1); setPos({ x: 0, y: 0 }); };
  const closeLightbox = () => { setLightbox(false); setZoom(1); setPos({ x: 0, y: 0 }); };

  const changeZoom = (delta: number) => {
    setZoom((z) => {
      const next = Math.min(8, Math.max(1, z + delta));
      if (next === 1) setPos({ x: 0, y: 0 });
      return next;
    });
  };

  // Close on Escape
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeLightbox(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPos({ x: dragStart.current.px + e.clientX - dragStart.current.mx, y: dragStart.current.py + e.clientY - dragStart.current.my });
  };
  const onMouseUp = () => setDragging(false);

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Main Image */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-lg shadow-black/[.06] group"
          style={{ aspectRatio: "1/1" }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const d = touchX.current - e.changedTouches[0].clientX;
            if (Math.abs(d) > 40) go(d > 0 ? 1 : -1);
          }}
        >
          {/* Badges */}
          <div className="absolute z-10 top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-2">
            {discountPercent > 0 && (
              <div className="bg-red-600 text-white text-[10px] sm:text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-lg shadow-red-600/30 text-center">
                خصم {discountPercent}%
              </div>
            )}
          </div>

          {/* Expand button */}
          <button onClick={openLightbox} className="absolute z-10 top-3 left-3 sm:top-4 sm:left-4 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/5 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:bg-black/10 transition">
            <IoExpand size={16} />
          </button>

          {/* Image */}
          {images.length > 0 ? (
            <div className="w-full h-full cursor-zoom-in" onClick={openLightbox}>
              <Image
                src={images[sel]}
                alt={name}
                fill
                className="object-contain p-8 sm:p-12"
                priority
                sizes="(max-width:1024px) 100vw, 58vw"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📱</div>
          )}

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button onClick={() => go(1)} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                <IoChevronBack size={18} />
              </button>
              <button onClick={() => go(-1)} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                <IoChevronForward size={18} />
              </button>
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setSel(i)} className={`rounded-full transition-all duration-300 ${i === sel ? "w-6 h-2 bg-[#1F7A8C]" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 sm:gap-3 justify-center px-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSel(i)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 bg-white ${
                  i === sel
                    ? "ring-2 ring-[#1F7A8C] ring-offset-2 shadow-lg scale-105"
                    : "border border-gray-200 opacity-50 hover:opacity-100 hover:border-[#1F7A8C]/30"
                }`}
              >
                <Image src={img} alt="" fill className="object-contain p-2" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button onClick={() => changeZoom(1)} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
              <IoAddOutline size={20} />
            </button>
            <button onClick={() => changeZoom(-1)} disabled={zoom <= 1} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition disabled:opacity-30">
              <IoRemoveOutline size={20} />
            </button>
            <span className="w-9 h-9 rounded-xl bg-white/10 text-white text-xs flex items-center justify-center font-bold">{zoom}x</span>
            <button onClick={closeLightbox} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
              <IoClose size={20} />
            </button>
          </div>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button onClick={() => { go(1); setZoom(1); setPos({ x: 0, y: 0 }); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10">
                <IoChevronBack size={22} />
              </button>
              <button onClick={() => { go(-1); setZoom(1); setPos({ x: 0, y: 0 }); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10">
                <IoChevronForward size={22} />
              </button>
            </>
          )}

          {/* Zoomable Image */}
          <div
            className="relative w-[90vw] h-[85vh] overflow-hidden"
            style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onClick={() => { if (!dragging) changeZoom(zoom < 8 ? 1 : -zoom + 1); }}
          >
            <div
              style={{
                transform: `scale(${zoom}) translate(${pos.x / zoom}px, ${pos.y / zoom}px)`,
                transition: dragging ? "none" : "transform 0.2s ease",
                width: "100%",
                height: "100%",
              }}
            >
              <Image
                src={images[sel]}
                alt={name}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </div>
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button key={i} onClick={() => { setSel(i); setZoom(1); setPos({ x: 0, y: 0 }); }} className={`rounded-full transition-all duration-300 ${i === sel ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
