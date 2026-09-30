"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const DEFAULT_SLIDES = [
  "/e5ae006f-b733-41d4-9e48-69994eeacbe4.webp",
  "/df3a0f08-fb1c-4b40-863c-58f8f562805d.webp",
  "/fe7ec25b-bb16-4ae3-ab3f-bdc18111d748.webp",
];

const RESERVATION_DATE = new Date(
  process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-12T23:00:00+03:00"
);

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

interface Props {
  modelName: string;
  slides?: string[];
}

export default function ComingSoon({ modelName, slides }: Props) {
  const images = slides?.length ? slides : DEFAULT_SLIDES;
  const [active, setActive] = useState(0);
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const calledRef = useRef(false);

  // Slideshow
  useEffect(() => {
    const id = setInterval(() => setActive((p) => (p + 1) % images.length), 4500);
    return () => clearInterval(id);
  }, [images.length]);

  // Countdown + refresh on expire
  useEffect(() => {
    const id = setInterval(() => {
      const t = getTimeLeft(RESERVATION_DATE);
      setTime(t);
      const expired = t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0;
      if (expired && !calledRef.current) {
        calledRef.current = true;
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col" dir="rtl">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={modelName}
          fill
          unoptimized
          priority={i === 0}
          className={`object-cover object-center transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

      <div className="relative z-10 flex flex-col items-center justify-end flex-1 gap-5 px-5 pb-12 pt-[clamp(120px,40vw,220px)]">

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-[#6DBE00] animate-pulse" />
          <span className="text-white/80 text-[11px] font-bold tracking-widest uppercase">قريباً</span>
        </div>

        <div className="text-center">
          <h1 style={{ fontSize: "clamp(2.5rem,8vw,5rem)" }} className="font-black text-white tracking-tight leading-none">
            {modelName}
          </h1>
          <p style={{ fontSize: "clamp(0.85rem,2.5vw,1.1rem)" }} className="text-white/60 mt-2 max-w-sm mx-auto leading-relaxed">
            انتظرونا قريباً
          </p>
        </div>

        <div className="flex gap-3">
          {[
            { label: "يوم", value: time.days },
            { label: "ساعة", value: time.hours },
            { label: "دقيقة", value: time.minutes },
            { label: "ثانية", value: time.seconds },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                style={{ width: "clamp(52px,12vw,72px)", height: "clamp(52px,12vw,72px)", fontSize: "clamp(1.1rem,4vw,1.6rem)" }}
                className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-extrabold text-white tabular-nums"
              >
                {pad(value)}
              </div>
              <span className="text-white/40 text-[10px]">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 w-full max-w-sm">
          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-center">
            <p className="text-[#6DBE00] text-[10px] font-semibold uppercase tracking-wider mb-0.5">فتح باب الحجز</p>
            <p className="text-white text-sm font-bold">13 سبتمبر 2026</p>
            <p className="text-white/60 text-xs">الساعة 3:00 م</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-center">
            <p className="text-[#6DBE00] text-[10px] font-semibold uppercase tracking-wider mb-0.5">موعد التوفير</p>
            <p className="text-white text-sm font-bold">18 سبتمبر 2026</p>
          </div>
        </div>

        <div className="flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${i === active ? "w-5 h-1.5 bg-[#6DBE00]" : "w-1.5 h-1.5 bg-white/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
