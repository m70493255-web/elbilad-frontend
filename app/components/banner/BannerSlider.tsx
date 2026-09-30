"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AUTO_PLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

export default function BannerSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStart = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const total = images.length;

  const goTo = useCallback(
    (i: number, dir?: number) => {
      const next = (i + total) % total;
      setDirection(dir ?? (next > current ? 1 : -1));
      setCurrent(next);
    },
    [total, current]
  );

  // Auto-play timer (pure timeout without continuous 30ms state re-renders)
  useEffect(() => {
    if (total <= 1) return;
    timeoutRef.current = setTimeout(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % total);
    }, AUTO_PLAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, total]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) goTo(current + (diff > 0 ? 1 : -1), diff > 0 ? 1 : -1);
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, scale: 1.05, x: d > 0 ? 50 : -50 }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, scale: 0.96, x: d > 0 ? -50 : 50 }),
  };

  return (
    <section className="w-full px-1.5 sm:px-4 lg:px-6 pt-4 pb-3" dir="rtl">
      {/* Outer glow wrapper */}
      <div className="relative rounded-2xl sm:rounded-3xl p-[2px] bg-gradient-to-br from-[#6DBE00]/60 via-white/10 to-[#1F7A8C]/50 shadow-xl shadow-black/15">
        {/* Image container */}
        <div
          className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl"
          style={{ aspectRatio: "2/1" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={images[current]}
                alt={`بانر ${current + 1}`}
                fill
                className="object-cover"
                priority={current === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </motion.div>
          </AnimatePresence>

          {/* Bottom fade overlay + dots inside banner */}
          {total > 1 && (
            <div className="absolute bottom-0 inset-x-0 z-10 pb-3 pt-8 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`الانتقال للشريحة ${i + 1}`}
                  aria-current={i === current ? "true" : undefined}
                  className="relative overflow-hidden cursor-pointer"
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 relative overflow-hidden ${
                      i === current
                        ? "w-10 sm:w-14 bg-white/40"
                        : "w-3 sm:w-4 bg-white/30 hover:bg-white/50"
                    }`}
                  >
                    {i === current && (
                      <motion.div
                        key={current}
                        className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-[#6DBE00] to-[#4fa800]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: AUTO_PLAY_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
