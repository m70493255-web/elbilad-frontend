"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ProductSection } from "../../../components/products/types";

function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useVisible();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity .7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform .7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function SectionDivider() {
  return (
    <div className="w-full flex items-center justify-center py-8 sm:py-12">
      <div className="flex items-center gap-3">
        <div className="w-12 sm:w-20 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#1F7A8C]/40 to-[#1F7A8C]/60" />
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-[#1F7A8C]/50 animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#1F7A8C]/30 animate-ping" />
        </div>
        <div className="w-12 sm:w-20 h-[2px] rounded-full bg-gradient-to-l from-transparent via-[#1F7A8C]/40 to-[#1F7A8C]/60" />
      </div>
    </div>
  );
}

function ExpandableText({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      {title && <h4 className="text-sm sm:text-lg font-black text-white mb-1.5 leading-tight drop-shadow-lg">{title}</h4>}
      {desc && (
        <p className="text-xs sm:text-sm text-white/90 leading-relaxed drop-shadow-md line-clamp-3">
          {desc}
        </p>
      )}
    </div>
  );
}

function ExpandableTextDark({ desc }: { desc: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsExpansion = desc && desc.length > 150;
  return (
    <div>
      <p className={`text-xs sm:text-sm text-gray-600 leading-relaxed ${!expanded && needsExpansion ? "line-clamp-3" : ""}`}>
        {desc}
      </p>
      {needsExpansion && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1F7A8C] hover:text-[#155E6F] transition-colors"
        >
          {expanded ? <>عرض أقل <span>▲</span></> : <>عرض المزيد <span>▼</span></>}
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   DESIGN SECTION
══════════════════════════════════════════ */
function DesignSection({ section }: { section: ProductSection }) {
  const content = section.content as {
    features: {
      id: string; label: string; title: string; image: string;
      colors?: { name: string; colorCode: string; image: string; title: string }[];
    }[];
  };
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const feature = content.features[activeIdx];
  const currentImage = feature.colors?.[selectedColorIdx]?.image ?? feature.image;
  const currentTitle = feature.colors?.[selectedColorIdx]?.title ?? feature.title;

  return (
    <section className="w-full bg-white" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-6">
        <Reveal>
          <h2 className="text-xl sm:text-3xl font-black text-gray-900 mb-6">{section.title}</h2>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={0.05}>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
            {content.features.map((f, i) => (
              <button
                key={f.id}
                onClick={() => { setActiveIdx(i); setSelectedColorIdx(0); }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  i === activeIdx
                    ? "bg-[#1F7A8C] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Card: image as background + text overlay */}
        <Reveal delay={0.1}>
          <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "16/10" }}>
            <Image
              key={currentImage}
              src={currentImage}
              alt={feature.label}
              fill
              className="object-cover transition-all duration-500"
              sizes="(max-width:1024px) 100vw, 1200px"
              priority
            />
            {/* gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* bottom overlay content */}
            <div className="absolute bottom-0 right-0 left-0 p-5 sm:p-8">
              <h3 className="text-sm sm:text-lg font-black text-white leading-snug mb-3 drop-shadow-lg">
                {currentTitle}
              </h3>
              {feature.colors && (
                <div className="flex gap-2 flex-wrap">
                  {feature.colors.map((c, idx) => (
                    <button
                      key={`${c.name}-${idx}`}
                      onClick={() => setSelectedColorIdx(idx)}
                      title={c.name}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all duration-200 ${
                        idx === selectedColorIdx
                          ? "ring-2 ring-white ring-offset-1 ring-offset-black/30 scale-110"
                          : "ring-1 ring-white/50 hover:scale-110"
                      }`}
                      style={{ background: c.colorCode }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════
   CAMERA SECTION
══════════════════════════════════════════ */
function CameraSection({ section }: { section: ProductSection }) {
  const content = section.content as {
    hero: { image: string; stats: { value: string; label: string }[]; description: string };
    zoomLevels: { label: string; image: string }[];
    zoomFooter: { text: string; image: string };
    lensesCard: { image: string; lenses: { name: string; model: string; specs: string[] }[] };
    proPhotos: { title: string; items: { image: string; label: string }[] };
    video: { title: string; subtitle: string; description: string; image: string };
    proVideo: { title: string; items: { image: string; label: string }[] };
  };
  const [activeZoom, setActiveZoom] = useState(0);

  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white" dir="rtl">

      {/* Hero */}
      <div className="relative w-full" style={{ minHeight: "220px", aspectRatio: "16/9" }}>
        <Image src={content.hero.image} alt="camera" fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-10 py-5 sm:py-12 max-w-6xl mx-auto">
          <Reveal>
            <span className="inline-block text-[10px] font-black tracking-widest uppercase text-[#4dd0e8] mb-2 px-3 py-1 rounded-full bg-[#4dd0e8]/10 border border-[#4dd0e8]/30">
              {section.title}
            </span>
            <h2 className="text-base sm:text-3xl font-black text-white leading-tight mb-2 sm:mb-4">
              {section.subtitle}
            </h2>
            <ExpandableText title="" desc={content.hero.description} />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
              {content.hero.stats.map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2.5 sm:px-5 sm:py-4">
                  <p className="text-lg sm:text-3xl font-black text-[#4dd0e8] mb-0.5">{s.value}</p>
                  <p className="text-[10px] sm:text-xs text-white/75 leading-tight font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <SectionDivider />

      {/* Zoom Levels */}
      {content.zoomLevels?.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
          <Reveal>
            <div className="text-center mb-5 sm:mb-8">
              <h3 className="text-lg sm:text-2xl font-black text-gray-900 mb-1">
                فتحة العدسة المتغيرة
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                تكيف تلقائي لأفضل أداء في كل الظروف
              </p>
            </div>
          </Reveal>
          
          <div className="flex gap-2 flex-wrap justify-center mb-6 sm:mb-10">
            {content.zoomLevels.map((z, i) => (
              <button
                key={z.label}
                onClick={() => setActiveZoom(i)}
                className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  i === activeZoom
                    ? "bg-[#1F7A8C] text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-[#1F7A8C] hover:text-[#1F7A8C]"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
          
          <Reveal delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: "4/3" }}>
              <Image
                key={activeZoom}
                src={content.zoomLevels[activeZoom].image}
                alt={content.zoomLevels[activeZoom].label}
                fill
                className="object-cover transition-all duration-500"
                sizes="100vw"
              />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl">
                <span className="text-white font-bold text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4dd0e8] animate-pulse" />
                  {content.zoomLevels[activeZoom].label}
                </span>
              </div>
            </div>
          </Reveal>
          
          {content.zoomFooter && (
            <Reveal delay={0.15}>
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed px-4">
                  {content.zoomFooter.text}
                </p>
              </div>
            </Reveal>
          )}
        </div>
      )}

    </section>
  );
}

/* ══════════════════════════════════════════
   PERFORMANCE SECTION
══════════════════════════════════════════ */
function PerformanceSection({ section }: { section: ProductSection }) {
  const content = section.content as {
    description: string;
    chips: { name: string; description: string }[];
  };
  const media = section.media?.[0];

  return (
    <section className="w-full bg-white" dir="rtl">
      {media && (
        <div className="relative w-full" style={{ minHeight: "220px", aspectRatio: "16/9" }}>
          <Image src={media.url} alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-10 py-5 sm:py-12 max-w-6xl mx-auto">
            <Reveal>
              <p className="text-[10px] font-black tracking-widest uppercase text-[#4dd0e8] mb-1">{section.title}</p>
              <h2 className="text-base sm:text-2xl font-black text-white mb-2">{section.subtitle}</h2>
              <ExpandableText title="" desc={content.description} />
            </Reveal>
          </div>
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════
   BATTERY SECTION
══════════════════════════════════════════ */
function BatterySection({ section }: { section: ProductSection }) {
  const content = section.content as {
    description: string;
    stats: { value: string; unit: string; label: string }[];
  };
  const media = section.media?.[0];

  return (
    <section className="w-full bg-gradient-to-b from-gray-50/40 via-white to-gray-50/40" dir="rtl">
      {media && (
        <div className="relative w-full" style={{ minHeight: "200px", aspectRatio: "16/9" }}>
          <Image src={media.url} alt="" fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-10 py-5 sm:py-10 max-w-6xl mx-auto">
            <Reveal>
              <p className="text-[10px] font-black tracking-widest uppercase text-[#4dd0e8] mb-1">{section.title}</p>
              <h2 className="text-sm sm:text-2xl font-black text-white mb-2 leading-tight">{section.subtitle}</h2>
              <ExpandableText title="" desc={content.description} />
            </Reveal>
          </div>
        </div>
      )}

     
    </section>
  );
}

/* ══════════════════════════════════════════
   SPEC GROUPS
══════════════════════════════════════════ */
/* REMOVED */

/* ══════════════════════════════════════════
   GALLERY
══════════════════════════════════════════ */
/* REMOVED */

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
interface IPhone18SectionsProps {
  sections?: ProductSection[];
  gallery?: { url: string; caption: string }[];
  specGroups?: { group: string; items: { key: string; value: string }[] }[];
}

export default function IPhone18Sections({ sections, gallery, specGroups }: IPhone18SectionsProps) {
  if (!sections?.length) return null;

  const activeSections = (sections ?? [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="w-full mt-8 overflow-hidden rounded-3xl border border-gray-100 shadow-lg" dir="rtl">
      {activeSections.map((section, idx) => (
        <div key={section.type}>
          {idx > 0 && <SectionDivider />}
          {section.type === "design" && <DesignSection section={section} />}
          {section.type === "camera" && <CameraSection section={section} />}
          {section.type === "performance" && <PerformanceSection section={section} />}
          {section.type === "battery" && <BatterySection section={section} />}
        </div>
      ))}
    </div>
  );
}
