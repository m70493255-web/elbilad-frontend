"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ContactSection from "../components/ContactSection";
import { useCompanyStore } from "../store/companyStore";

/* ── Intersection Observer hook ── */
function useInView(threshold = 0.1) {
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

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ── Animated Counter ── */
function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const { ref, visible } = useInView();
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(target.replace(/[^\d]/g, ""));
    if (isNaN(num) || num === 0) { setDisplay(target); return; }
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * num);
      setDisplay(start + suffix);
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(target);
    };
    requestAnimationFrame(step);
  }, [visible, target, suffix]);

  return <span ref={ref}>{display}</span>;
}

/* ── SVG Icons ── */
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconHeadset = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path d="M3 18v-6a9 9 0 0118 0v6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPercent = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <line x1="19" y1="5" x2="5" y2="19" strokeLinecap="round"/>
    <circle cx="6.5" cy="6.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <rect x="1" y="3" width="15" height="13" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 8h4l3 5v4h-7V8z" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconStore = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.2}>
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Data ── */
const stats = [
  { value: "١٠٠٪", label: "ضمان الجودة", Icon: IconShield, color: "#0F4C6E" },
  { value: "٢٤/٧", label: "دعم فني", Icon: IconHeadset, color: "#1F6F8B" },
  { value: "٠٪", label: "بدون فوائد", Icon: IconPercent, color: "#7CC043" },
  { value: "سريع", label: "توصيل", Icon: IconTruck, color: "#0a3550" },
];

const features = [
  "أجهزة إلكترونية أصلية بضمان معتمد",
  "أقساط ميسرة بدون فوائد",
  "توصيل سريع لجميع مناطق المملكة",
  "خدمة عملاء متاحة على مدار الساعة",
  "سياسة استبدال واسترجاع مرنة",
  "أسعار تنافسية وعروض مستمرة",
];

const sections = [
  {
    Icon: IconStore,
    title: "من نحن",
    color: "#0F4C6E",
    lightBg: "rgba(15, 76, 110, 0.08)",
    content: [
      "مؤسسة البلاد الثابته لتقنية المعلومات  هي متجر إلكتروني متخصص في تقديم المنتجات والخدمات بجودة عالية وتجربة شراء سهلة وآمنة تناسب احتياجات العملاء.",
      "نحن نحرص على توفير أفضل الحلول والعروض مع الاهتمام بالتفاصيل التي تمنح العميل تجربة احترافية بداية من تصفح المنتجات وحتى إتمام الطلب.",
      "مؤسسة البلاد الثابته لتقنية المعلومات  هي اختيارك الأول لشراء أحدث الأجهزة الإلكترونية بأقساط سهلة وبدون فوائد، وتلقى عندنا تجربة مختلفة تبدأ من جودة الخدمة وسرعة التوصيل إلى اهتمام كبير بخدمة ما بعد البيع — نتابعك خطوة بخطوة ونوفّر لك دعم فني وضمان يخليك واثق إنك تتعامل مع متجر يحط رضاك فوق كل اعتبار.",
    ],
  },
  {
    Icon: IconTarget,
    title: "رؤيتنا",
    color: "#0a3550",
    lightBg: "rgba(10, 53, 80, 0.08)",
    content: [
      "تقديم تجربة تسوق إلكترونية موثوقة وسريعة ومريحة، مع الحفاظ على أعلى معايير الجودة وخدمة العملاء.",
    ],
  },
  {
    Icon: IconStar,
    title: "رسالتنا",
    color: "#7CC043",
    lightBg: "rgba(124, 192, 67, 0.1)",
    content: [
      "نسعى إلى بناء ثقة طويلة الأمد مع عملائنا من خلال منتجات مميزة، دعم سريع، وشفافية كاملة في التعامل.",
    ],
  },
];

/* ── Component ── */
export default function AboutClient() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { whatsapp, email, fetchCompany } = useCompanyStore();

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const anim = (delay: number) => ({
    style: {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(30px)",
      transition: `opacity 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#E6F2F8] via-[#EEF6FB] to-[#F5FAFE] overflow-x-hidden" dir="rtl">

      {/* ════════ HERO ════════ */}
      <section
        className="relative w-full overflow-hidden min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] flex items-center"
        onMouseMove={handleMouseMove}
        style={{ background: "linear-gradient(135deg, #061e2f 0%, #0a3550 25%, #0F4C6E 50%, #1F6F8B 75%, #267a90 100%)" }}
      >
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
            style={{
              background: "radial-gradient(circle, #7CC043 0%, transparent 70%)",
              left: `${mousePos.x * 0.02}px`,
              top: `${mousePos.y * 0.02 - 100}px`,
              transition: "left 0.8s ease-out, top 0.8s ease-out",
            }}
          />
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#1F6F8B]/30 blur-[80px] animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#0F4C6E]/40 blur-[70px] animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02] blur-[60px]" />
        </div>

        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Floating geometric shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 right-[15%] w-3 h-3 rounded-full bg-[#7CC043]/40 animate-bounce" style={{ animationDuration: "3s" }} />
          <div className="absolute top-32 left-[20%] w-2 h-2 rounded-full bg-[#B8D8EC]/30 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
          <div className="absolute bottom-32 right-[25%] w-4 h-4 rounded-full border border-white/10 animate-bounce" style={{ animationDuration: "5s", animationDelay: "0.5s" }} />
          <div className="absolute top-1/2 left-[10%] w-2.5 h-2.5 rotate-45 bg-[#7CC043]/20 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "2s" }} />
        </div>

        <div className="relative w-full px-5 sm:px-12 lg:px-20 py-20 sm:py-28 text-center text-white">
          {/* Badge */}
          <div {...anim(100)}>
            <div className="inline-flex items-center gap-2.5 bg-white/[0.08] backdrop-blur-md border border-white/[0.15] rounded-full px-5 py-2 text-xs sm:text-sm font-medium text-[#B8D8EC] mb-7 shadow-lg shadow-black/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7CC043] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7CC043]" />
              </span>
عن مؤسسة البلاد الثابته لتقنية المعلومات             </div>
          </div>

          {/* Title */}
          <div {...anim(250)}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-5 sm:mb-6 leading-[1.15] tracking-tight">
              <span className="block">تعرّف على</span>
              <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #B8D8EC 0%, #ffffff 40%, #7CC043 100%)" }}>
                مؤسسة البلاد
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div {...anim(400)}>
            <p className="text-[#B8D8EC]/80 text-base sm:text-lg lg:text-xl max-w-xl mx-auto leading-relaxed mb-8">
              نقدم لك أفضل تجربة تسوق إلكتروني بأقساط ميسرة وخدمة احترافية
            </p>
          </div>

          {/* Scroll indicator */}
          <div {...anim(550)}>
            <div className="animate-bounce text-white/40 flex justify-center" style={{ animationDuration: "2s" }}>
              <IconArrowDown />
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 80" className="w-full h-14 sm:h-20" preserveAspectRatio="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="#E6F2F8" />
          </svg>
        </div>
      </section>

      {/* ════════ STATS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 -mt-4 sm:-mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 100}>
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white shadow-lg shadow-[#0F4C6E]/[0.06] p-4 sm:p-6 text-center overflow-hidden hover:shadow-xl hover:shadow-[#0F4C6E]/[0.1] hover:-translate-y-2 transition-all duration-400 cursor-default">
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}10 0%, transparent 70%)` }} />

                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-400 relative"
                  style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)` }}
                >
                  <s.Icon />
                </div>
                <p className="text-2xl sm:text-3xl font-black mb-1" style={{ color: s.color }}>
                  <AnimatedCounter target={s.value} />
                </p>
                <p className="text-[11px] sm:text-xs text-gray-500 font-bold tracking-wide">{s.label}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ════════ FEATURES STRIP ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 pt-10 sm:pt-14">
        <FadeUp>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white shadow-lg shadow-[#0F4C6E]/[0.06] p-6 sm:p-8 lg:p-10 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#0F4C6E]/5 blur-[60px]" />

            <h3 className="text-[#0a3550] font-extrabold text-lg sm:text-xl lg:text-2xl mb-5 sm:mb-6 relative">
              لماذا تختار البلاد؟
              <span className="block h-1 w-12 mt-2 rounded-full bg-[#7CC043]" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative">
              {features.map((f, i) => (
                <FadeUp key={i} delay={i * 60}>
                  <div className="flex items-center gap-3 bg-[#E6F2F8]/60 rounded-xl sm:rounded-2xl px-4 py-3 sm:py-4 border border-[#B8D8EC]/40 hover:bg-[#E6F2F8] hover:border-[#B8D8EC]/70 hover:shadow-md transition-all duration-300 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F4C6E] to-[#1F6F8B] flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                      <IconCheck />
                    </div>
                    <span className="text-[#0a3550] text-sm sm:text-base font-medium">{f}</span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════ SECTIONS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 py-10 sm:py-14 space-y-5 sm:space-y-6">
        {sections.map((s, i) => (
          <FadeUp key={s.title} delay={i * 120}>
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white shadow-lg shadow-[#0F4C6E]/[0.04] overflow-hidden hover:shadow-xl hover:shadow-[#0F4C6E]/[0.08] transition-all duration-400">
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(to left, ${s.color}, ${s.color}88)` }} />

              <div className="p-5 sm:p-8 lg:p-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-5 sm:mb-6">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-400 shadow-md"
                    style={{ background: s.lightBg, color: s.color }}
                  >
                    <s.Icon />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-gray-800">{s.title}</h2>
                    <div className="h-0.5 w-10 mt-1.5 rounded-full" style={{ background: `linear-gradient(to left, ${s.color}, transparent)` }} />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  {s.content.map((p, j) => (
                    <p key={j} className="text-gray-600 leading-[1.85] text-sm sm:text-[15px]">{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        ))}

        {/* Contact */}
        <ContactSection
          title="وسائل التواصل"
          phone={whatsapp}
          whatsapp={whatsapp}
          email={email}
          fadeDelay={300}
        />
      </section>

      <div className="h-10" />
    </main>
  );
}
