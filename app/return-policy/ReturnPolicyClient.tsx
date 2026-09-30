"use client";
import { useEffect, useRef, useState, ReactNode } from "react";
import ContactSection from "../components/ContactSection";
import { useCompanyStore } from "../store/companyStore";

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

function FadeUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ── Icons ── */
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconBan = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const IconXCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const policies = [
  {
    Icon: IconBox,
    num: "01",
    title: "حالة المنتج",
    desc: "يشترط أن يكون المنتج في حالته الأصلية وغير مستخدم، مع الحفاظ على التغليف والملحقات والفاتورة إن وجدت.",
    accent: "#1F7A8C",
    lightBg: "rgba(31,122,140,0.08)",
  },
  {
    Icon: IconClock,
    num: "02",
    title: "مدة طلب الاسترجاع",
    desc: "يتم تقديم طلبات الاستبدال أو الاسترجاع خلال المدة المحددة حسب سياسة المتجر، وبعد مراجعة حالة الطلب والمنتج.",
    accent: "#155E6F",
    lightBg: "rgba(21,94,111,0.08)",
  },
  {
    Icon: IconBan,
    num: "03",
    title: "المنتجات غير القابلة للاسترجاع",
    desc: "بعض المنتجات قد لا تكون قابلة للاسترجاع أو الاستبدال بعد فتحها أو استخدامها، وخاصة المنتجات الشخصية أو الرقمية أو التي تم تجهيزها بطلب خاص.",
    accent: "#0F4C6E",
    lightBg: "rgba(15,76,110,0.08)",
  },
  {
    Icon: IconXCircle,
    num: "04",
    title: "إلغاء الطلبات",
    desc: "يمكن إلغاء الطلب قبل التجهيز أو الشحن، أما إذا تم شحن الطلب فيتم التعامل معه وفق سياسة الاسترجاع المعتمدة.",
    accent: "#1F7A8C",
    lightBg: "rgba(31,122,140,0.08)",
  },
];



export default function ReturnPolicyClient() {
  const [heroVis, setHeroVis] = useState(false);
  const { phone, whatsapp, email, fetchCompany } = useCompanyStore();

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  const anim = (delay: number): React.CSSProperties => ({
    opacity: heroVis ? 1 : 0,
    transform: heroVis ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f7fb] to-[#e4eff6] overflow-x-hidden" dir="rtl">

      {/* ════════ HERO ════════ */}
      <section className="relative w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a3550 0%, #0F4C6E 35%, #1F7A8C 70%, #155E6F 100%)" }} />

        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(109,190,0,0.12) 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 -left-32 w-[350px] h-[350px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[200px]" style={{ background: "radial-gradient(ellipse, rgba(31,122,140,0.3) 0%, transparent 70%)" }} />
        </div>

        {/* Grid pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative w-full px-5 sm:px-12 lg:px-20 pt-24 pb-28 sm:pt-32 sm:pb-36 text-center text-white">
          {/* Badge */}
          <div style={anim(100)} className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold text-blue-100 mb-7">
            <IconShield />
            <span>حقوقك محفوظة</span>
          </div>

          {/* Title */}
          <h1 style={anim(220)} className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black mb-5 leading-[1.2] tracking-tight">
            سياسة الاستبدال
            <br />
            <span className="bg-gradient-to-l from-[#6DBE00] via-[#8fd43a] to-[#6DBE00] bg-clip-text text-transparent">
              والاسترجاع
            </span>
          </h1>

          {/* Subtitle */}
          <p style={anim(360)} className="text-white/70 text-sm sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            نحرص على رضاك التام — تعرّف على الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع
          </p>

          {/* Scroll indicator */}
          <div style={anim(500)} className="mt-10 flex justify-center">
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
              <div className="w-1.5 h-3 rounded-full bg-white/50 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 80" className="w-full h-14 sm:h-20" preserveAspectRatio="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="#f0f7fb" />
          </svg>
        </div>
      </section>

      {/* ════════ POLICY CARDS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 -mt-4 sm:-mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {policies.map((p, i) => (
            <FadeUp key={p.title} delay={i * 100}>
              <div
                className="group relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 overflow-hidden"
              >
                {/* Top accent line */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(to left, ${p.accent}, ${p.accent}88)` }} />

                <div className="p-5 sm:p-7">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: p.lightBg, color: p.accent }}
                    >
                      <p.Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] sm:text-xs font-black tracking-widest" style={{ color: p.accent, opacity: 0.5 }}>{p.num}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-gray-800 leading-snug">{p.title}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed pr-0 sm:pr-[4.5rem]">
                    {p.desc}
                  </p>
                </div>

                {/* Hover glow */}
                <div
                  className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
                  style={{ background: p.accent }}
                />
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

     

      {/* ════════ HIGHLIGHTS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 mt-10 sm:mt-14">
        <FadeUp>
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100/80 shadow-sm p-5 sm:p-8">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-800 mb-5">ملاحظات مهمة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "يحق للمتجر رفض الطلب إذا لم تتوفر الشروط المطلوبة",
                "يتم استرداد المبلغ بنفس طريقة الدفع الأصلية",
                "قد تستغرق عملية الاسترداد من 5 إلى 14 يوم عمل",
                "تكاليف الشحن غير قابلة للاسترداد في بعض الحالات",
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f0f7fb] group">
                  <div className="w-6 h-6 rounded-lg bg-[#1F7A8C] flex items-center justify-center text-white shrink-0 mt-0.5">
                    <IconCheck />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════ CONTACT ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 mt-8 sm:mt-12">
        <ContactSection
          title="التواصل بخصوص الطلبات"
          phone={phone}
          whatsapp={whatsapp}
          email={email}
          fadeDelay={200}
        />
      </section>

      <div className="h-16" />
    </main>
  );
}
