"use client";
import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";

const AUTO_PLAY_MS = 4500;
const SWIPE_THRESHOLD = 50;

function CategoryBannerSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const total = images.length;

  const goTo = useCallback(
    (i: number) => setCurrent((i + total) % total),
    [total]
  );

  useEffect(() => {
    if (total <= 1) return;
    intervalRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % total),
      AUTO_PLAY_MS
    );
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [total]);

  // Single banner optimization
  if (total === 1) {
    return (
      <div className="w-full px-3 sm:px-4 py-2">
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl aspect-[16/7] sm:aspect-[21/9] shadow-sm">
          <Image
            src={images[0]}
            alt="بانر القسم"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1100px"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 py-2">
      <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl aspect-[16/7] sm:aspect-[21/9] shadow-sm">
        {/* Slider track in LTR so translateX is uniform across all devices */}
        <div
          dir="ltr"
          className="flex h-full w-full transition-transform duration-500 ease-in-out will-change-transform"
          style={{ transform: `translateX(-${current * 100}%)` }}
          onTouchStart={(e) => {
            touchStart.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const diff = touchStart.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > SWIPE_THRESHOLD)
              goTo(current + (diff > 0 ? 1 : -1));
          }}
        >
          {images.map((src, i) => (
            <div key={i} className="relative shrink-0 w-full h-full">
              <Image
                src={src}
                alt={`بانر القسم ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1100px"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`الانتقال للبانر ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === current ? "bg-white scale-110 shadow" : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoryBanner({
  category,
  images: propImages,
}: {
  category: string;
  images?: string[];
}) {
  const images = propImages ?? [];
  if (!images.length) return null;
  return <CategoryBannerSlider images={images} />;
}
