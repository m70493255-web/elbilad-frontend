"use client";
import { useState, useEffect, useRef, useCallback, ReactNode } from "react";
import Image from "next/image";
import ContactSection from "../components/ContactSection";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
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

/* ── Icons ── */
const IconMada = () => (
  <Image src="/mada975b.png" alt="مدى" width={72} height={44} className="object-contain w-auto h-auto max-w-[72px] max-h-[44px]" />
);
const IconVisa = () => (
  <Image src="/cc975b.png" alt="بطاقات ائتمان" width={72} height={44} className="object-contain w-auto h-auto max-w-[72px] max-h-[44px]" />
);
const IconInstallment = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="8" width="36" height="32" rx="4"/><path d="M16 24h16M16 30h10"/><path d="M24 8v4M16 8v4M32 8v4"/>
    <circle cx="34" cy="30" r="5" fill="white" fillOpacity=".2" stroke="white"/><path d="M32 30l1.5 1.5L35 28.5" strokeWidth="1.5"/>
  </svg>
);
const IconZeroInterest = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="18" fill="white" fillOpacity=".1"/>
    <path d="M16 32l16-16" strokeWidth="2.5"/>
    <circle cx="18" cy="19" r="4"/>
    <circle cx="30" cy="29" r="4"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 4l16 6v12c0 9-7 17-16 20C8 39 1 31 1 22V10l16-6z" fill="white" fillOpacity=".15"/><path d="M17 24l5 5 9-10"/>
  </svg>
);
const IconCurrency = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="18"/><path d="M24 10v28M18 16h9a5 5 0 010 10h-9v-10zM18 26h10a5 5 0 010 10h-10"/>
  </svg>
);
const IconShipping = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="14" width="28" height="20" rx="2"/><path d="M30 20h8l6 8v6h-14V20z"/><circle cx="12" cy="36" r="4"/><circle cx="36" cy="36" r="4"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="18"/><line x1="24" y1="16" x2="24" y2="16" strokeWidth="3"/><line x1="24" y1="22" x2="24" y2="34"/>
  </svg>
);
const IconArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.2}>
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Data ── */
const installmentHighlights = [
  { icon: "✦", title: "بدون فوائد", desc: "نسبة الفائدة 0% على جميع خطط التقسيط" },
  { icon: "📅", title: "أقساط مرنة", desc: "اختر عدد الأشهر الذي يناسب ميزانيتك" },
  { icon: "⚡", title: "موافقة فورية", desc: "لا انتظار، يتم تأكيد طلبك في دقائق" },
  { icon: "🔒", title: "آمن وموثوق", desc: "جميع المعاملات مشفّرة ومحمية بالكامل" },
];

const paymentMethods = [
  { title: "بطاقة مدى", desc: "ادفع بسهولة عبر بطاقة مدى المحلية.", color: "#0F4C6E", imgBg: true, Icon: IconMada },
  { title: "بطاقات الائتمان", desc: "نقبل فيزا وماستركارد وجميع البطاقات الائتمانية.", color: "#0a3550", imgBg: true, Icon: IconVisa },
  { title: "الأقساط", desc: "اشتري الآن وادفع على دفعات شهرية مريحة بدون فوائد.", color: "#7CC043", imgBg: false, Icon: IconInstallment },
];

const paymentFeatures = [
  "دفع آمن ومشفّر بالكامل",
  "بدون رسوم إضافية على المعاملات",
  "دعم جميع البطاقات المحلية والدولية",
  "أقساط بدون فوائد على منتجات مختارة",
];

const sections = [
  { title: "الدفع المعتمد", color: "#0F4C6E", lightBg: "rgba(15, 76, 110, 0.08)", Icon: IconShield, content: ["يتم توفير طرق دفع متعددة وآمنة تناسب احتياجات العملاء."] },
  { title: "العملة المستخدمة", color: "#7CC043", lightBg: "rgba(124, 192, 67, 0.1)", Icon: IconCurrency, content: ["العملة الرسمية المستخدمة في جميع المعاملات هي الريال السعودي (SAR)."] },
  { title: "التحويل والشحن", color: "#0a3550", lightBg: "rgba(10, 53, 80, 0.08)", Icon: IconShipping, content: ["يتم تنسيق الشحن بعد تأكيد الطلب حسب بيانات العميل."] },
  { title: "ملاحظة هامة", color: "#1F6F8B", lightBg: "rgba(31, 111, 139, 0.08)", Icon: IconInfo, content: ["نحرص في مؤسسة البلاد الثابته لتقنية المعلومات  على توفير تجربة دفع واضحة وآمنة.", "بعد إتمام الطلب سيتم مراجعة البيانات والتواصل مع العميل عند الحاجة لتأكيد التفاصيل أو استكمال إجراءات الطلب."] },
];

interface Company { phone?: string; whatsapp?: string; email?: string; [k: string]: string | undefined; }

export default function PaymentClient({ company }: { company: Company }) {
  const [heroVisible, setHeroVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

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
        </div>

        {/* Dot pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

        {/* Floating shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 right-[15%] w-3 h-3 rounded-full bg-[#7CC043]/40 animate-bounce" style={{ animationDuration: "3s" }} />
          <div className="absolute top-32 left-[20%] w-2 h-2 rounded-full bg-[#B8D8EC]/30 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
          <div className="absolute bottom-32 right-[25%] w-4 h-4 rounded-full border border-white/10 animate-bounce" style={{ animationDuration: "5s", animationDelay: "0.5s" }} />
        </div>

        <div className="relative w-full px-5 sm:px-12 lg:px-20 py-20 sm:py-28 text-center text-white">
          {/* Badge */}
          <div {...anim(100)}>
            <div className="inline-flex items-center gap-2.5 bg-white/[0.08] backdrop-blur-md border border-white/[0.15] rounded-full px-5 py-2 text-xs sm:text-sm font-medium text-[#B8D8EC] mb-7 shadow-lg shadow-black/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7CC043] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7CC043]" />
              </span>
              طرق الدفع المتاحة
            </div>
          </div>

          {/* Title */}
          <div {...anim(250)}>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-5 sm:mb-6 leading-[1.15] tracking-tight">
              <span className="block">وسائل الدفع</span>
              <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #B8D8EC 0%, #ffffff 40%, #7CC043 100%)" }}>
                الآمنة والمتعددة
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div {...anim(400)}>
            <p className="text-[#B8D8EC]/80 text-base sm:text-lg lg:text-xl max-w-xl mx-auto leading-relaxed mb-8">
              طرق دفع متعددة وآمنة تناسب احتياجات عملائنا داخل المملكة
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

      {/* ════════ PAYMENT METHODS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 -mt-4 sm:-mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-4 sm:gap-5">
          {paymentMethods.map((m, i) => (
            <FadeUp key={m.title} delay={i * 100}>
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white shadow-lg shadow-[#0F4C6E]/[0.06] p-4 sm:p-6 text-center overflow-hidden hover:shadow-xl hover:shadow-[#0F4C6E]/[0.1] hover:-translate-y-2 transition-all duration-400 cursor-default h-full flex flex-col items-center">
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" style={{ background: `radial-gradient(circle at 50% 0%, ${m.color}10 0%, transparent 70%)` }} />

                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-400 relative ${
                    m.imgBg ? "bg-white border border-gray-100 p-2 sm:p-3" : "text-white"
                  }`}
                  style={m.imgBg ? {} : { background: `linear-gradient(135deg, ${m.color}, ${m.color}dd)` }}
                >
                  <m.Icon />
                </div>
                <p className="text-sm sm:text-base font-black text-gray-800 mb-1">{m.title}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ════════ INSTALLMENT CARD ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 pt-10 sm:pt-12">
        <FadeUp>
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-l from-[#1a6b7d] to-[#7CC043]" />
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a6b7d] bg-[#1a6b7d]/8 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a6b7d] animate-pulse" />
                    نظام التقسيط الخاص بالمتجر
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                    قسّط مشترياتك <span className="text-[#1a6b7d]">بدون فوائد</span>
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-md">
                    نظام تقسيط مرن مباشر من المتجر دون الحاجة لبطاقة ائتمانية أو موافقة بنكية. اشترِ اليوم وادفع على دفعات شهرية تناسب ميزانيتك.
                  </p>
                </div>
                <div className="shrink-0 mx-auto sm:mx-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#1a6b7d]/20 bg-[#1a6b7d]/5 flex flex-col items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-black text-[#1a6b7d] leading-none">0</span>
                  <span className="text-xs font-bold text-gray-400 mt-0.5">% فائدة</span>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-[#f4f6f8] border border-gray-100 px-5 py-4">
                <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-right">
                  اختر التقسيط عند إتمام طلبك وسيتواصل معك فريقنا لترتيب خطة الدفع.
                </p>
                <a href="/" className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-[#1a6b7d] hover:bg-[#155e6f] transition-colors">
                  تسوق الآن
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </a>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════ FEATURES STRIP ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 pt-10 sm:pt-14">
        <FadeUp>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white shadow-lg shadow-[#0F4C6E]/[0.06] p-6 sm:p-8 lg:p-10 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#0F4C6E]/5 blur-[60px]" />

            <h3 className="text-[#0a3550] font-extrabold text-lg sm:text-xl lg:text-2xl mb-5 sm:mb-6 relative">
              مميزات الدفع لدينا
              <span className="block h-1 w-12 mt-2 rounded-full bg-[#7CC043]" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative">
              {paymentFeatures.map((f, i) => (
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
              <div className="h-1 w-full" style={{ background: `linear-gradient(to left, ${s.color}, ${s.color}88)` }} />

              <div className="p-5 sm:p-8 lg:p-10">
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

                <div className="space-y-3">
                  {s.content.map((p, j) => (
                    <p key={j} className="text-gray-600 leading-[1.85] text-sm sm:text-[15px]">{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        ))}

        <ContactSection
          title="التواصل بخصوص الدفع"
          phone={company.phone}
          whatsapp={company.whatsapp}
          email={company.email}
          fadeDelay={300}
        />
      </section>

      <div className="h-10" />
    </main>
  );
}
