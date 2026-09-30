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
const IconLockShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8.01" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const policies = [
  {
    Icon: IconDoc,
    num: "01",
    title: "استخدام الموقع",
    desc: "باستخدامك لهذا الموقع فإنك توافق على الالتزام بالشروط والأحكام والسياسات المعمول بها داخل مؤسسة البلاد الحديثة للإلكترونيات.",
    accent: "#1F7A8C",
    lightBg: "rgba(31,122,140,0.08)",
  },
  {
    Icon: IconShield,
    num: "02",
    title: "الخصوصية وحماية البيانات",
    desc: "نلتزم بالحفاظ على خصوصية بيانات العملاء وعدم استخدامها إلا في حدود معالجة الطلبات وتحسين الخدمة والتواصل عند الحاجة.",
    accent: "#155E6F",
    lightBg: "rgba(21,94,111,0.08)",
  },
  {
    Icon: IconInfo,
    num: "03",
    title: "دقة المعلومات",
    desc: "نحرص على عرض المعلومات والمنتجات والأسعار بأكبر قدر ممكن من الدقة، ومع ذلك قد تحدث تحديثات أو تعديلات دون إشعار مسبق.",
    accent: "#0F4C6E",
    lightBg: "rgba(15,76,110,0.08)",
  },
  {
    Icon: IconChat,
    num: "04",
    title: "الطلبات والتواصل",
    desc: "يحق للمتجر مراجعة أو تأكيد الطلبات والتواصل مع العميل عند الحاجة لإتمام البيانات أو تأكيد تفاصيل الشحن والدفع.",
    accent: "#1F7A8C",
    lightBg: "rgba(31,122,140,0.08)",
  },
];

const commitments = [
  "لا نشارك بياناتك الشخصية مع أي طرف ثالث",
  "نستخدم تشفير آمن لحماية معلومات الدفع",
  "يمكنك طلب حذف بياناتك في أي وقت",
  "نحتفظ بالبيانات فقط للمدة اللازمة لإتمام الخدمة",
];

export default function PrivacyClient() {
  const [heroVis, setHeroVis] = useState(false);
  const { nameAr, phone, whatsapp, email, addressAr, taxNumber, fetchCompany } = useCompanyStore();

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
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0a3550 0%, #0F4C6E 35%, #1F7A8C 70%, #155E6F 100%)" }} />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(109,190,0,0.12) 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 -left-32 w-[350px] h-[350px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[200px]" style={{ background: "radial-gradient(ellipse, rgba(31,122,140,0.3) 0%, transparent 70%)" }} />
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative w-full px-5 sm:px-12 lg:px-20 pt-24 pb-28 sm:pt-32 sm:pb-36 text-center text-white">
          <div style={anim(100)} className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold text-blue-100 mb-7">
            <IconLockShield />
            <span>بياناتك في أمان</span>
          </div>

          <h1 style={anim(220)} className="text-3xl sm:text-5xl lg:text-[3.5rem] font-black mb-5 leading-[1.2] tracking-tight">
            سياسة الخصوصية
            <br />
            <span className="bg-gradient-to-l from-[#6DBE00] via-[#8fd43a] to-[#6DBE00] bg-clip-text text-transparent">
              واتفاقية الاستخدام
            </span>
          </h1>

          <p style={anim(360)} className="text-white/70 text-sm sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            نحرص على حماية خصوصيتك — تعرّف على الشروط العامة المنظمة لاستخدام الموقع وحماية بياناتك
          </p>

          <div style={anim(500)} className="mt-10 flex justify-center">
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
              <div className="w-1.5 h-3 rounded-full bg-white/50 animate-bounce" />
            </div>
          </div>
        </div>

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
              <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 overflow-hidden">
                <div className="h-1 w-full" style={{ background: `linear-gradient(to left, ${p.accent}, ${p.accent}88)` }} />
                <div className="p-5 sm:p-7">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: p.lightBg, color: p.accent }}
                    >
                      <p.Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] sm:text-xs font-black tracking-widest" style={{ color: p.accent, opacity: 0.5 }}>{p.num}</span>
                      <h3 className="text-base sm:text-lg font-extrabold text-gray-800 leading-snug">{p.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed pr-0 sm:pr-[4.5rem]">{p.desc}</p>
                </div>
                <div
                  className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
                  style={{ background: p.accent }}
                />
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ════════ COMMITMENTS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 mt-12 sm:mt-16">
        <FadeUp>
          <div className="relative bg-gradient-to-br from-[#0F4C6E] to-[#1F7A8C] rounded-2xl sm:rounded-3xl p-6 sm:p-10 overflow-hidden">
            <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(109,190,0,0.15) 0%, transparent 70%)" }} />
            <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)" }} />

            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-[#6DBE00]">
                  <IconEye />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">التزاماتنا تجاه خصوصيتك</h2>
                  <div className="h-0.5 w-10 mt-1.5 rounded-full bg-[#6DBE00]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {commitments.map((item, i) => (
                  <FadeUp key={i} delay={i * 100}>
                    <div className="flex items-start gap-3 bg-white/8 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/10 hover:bg-white/12 transition-colors duration-300">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#6DBE00] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#6DBE00]/30">
                        <IconCheck />
                      </div>
                      <p className="text-white/90 text-sm sm:text-[15px] leading-relaxed font-medium pt-1">{item}</p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════ STORE INFO ════════ */}
      {nameAr && (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 mt-10 sm:mt-14">
          <FadeUp>
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="h-1 w-full" style={{ background: "linear-gradient(to left, #0F4C6E, #1F7A8C)" }} />
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(15,76,110,0.08)", color: "#0F4C6E" }}>
                    <IconLock />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">معلومات المتجر</h2>
                    <div className="h-0.5 w-8 mt-1 rounded-full bg-gradient-to-l from-[#0F4C6E] to-[#1F7A8C]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    nameAr && { label: "اسم الجهة", value: nameAr },
                    addressAr && { label: "العنوان", value: addressAr },
                    phone && { label: "الهاتف", value: phone },
                    email && { label: "البريد الإلكتروني", value: email },
                    taxNumber && { label: "الرقم الضريبي", value: taxNumber },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f0f7fb]">
                      <div className="w-6 h-6 rounded-lg bg-[#1F7A8C] flex items-center justify-center text-white shrink-0 mt-0.5">
                        <IconCheck />
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        <span className="font-bold text-gray-700">{item && (item as {label:string;value:string}).label}:</span>{" "}
                        {item && (item as {label:string;value:string}).value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </section>
      )}

      {/* ════════ CONTACT ════════ */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 mt-8 sm:mt-12">
        <ContactSection
          title="وسائل التواصل"
          phone={whatsapp}
          whatsapp={whatsapp}
          email={email}
          fadeDelay={200}
        />
      </section>

      <div className="h-16" />
    </main>
  );
}
