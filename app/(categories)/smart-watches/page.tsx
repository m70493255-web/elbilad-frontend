import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
const SITE_URL = "https://albilaad-ksa.com";

async function getCompany() {
  try {
    const r = await fetch(`${BACKEND}/api/admin/company`, { next: { revalidate: 3600 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const title = `الساعات الذكية | ${siteName}`;
  const description = `تسوق أحدث الساعات الذكية بأفضل الأسعار وبالأقساط في ${siteName}. Apple Watch وأكثر.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${BACKEND}${company.logo}`)
    : "";
  return {
    title,
    description,
    keywords: ["ساعات ذكية", "Apple Watch", "أبل ووتش", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website", url: `${SITE_URL}/smart-watches`, title, description, siteName, locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/smart-watches` },
  };
}

export default async function SmartWatchesPage() {
  return (
    <>
      <style>{`
        @keyframes heroGradient { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        .hero-cat{background:linear-gradient(-45deg,#0a3550,#1F7A8C,#155E6F,#0d4a5e);background-size:300% 300%;animation:heroGradient 8s ease infinite}
      `}</style>
      <main className="min-h-screen" dir="rtl" style={{ background: "#f5f7f9" }}>
        <div className="hero-cat relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 sm:w-64 sm:h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 pt-6 sm:pt-10 pb-12 sm:pb-16">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6">
              <Link href="/" className="text-white/60 hover:text-white/90 transition">الرئيسية</Link>
              <span className="text-white/30">/</span>
              <span className="text-white font-semibold">الساعات الذكية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">الساعات الذكية</h1>
            <p className="text-sm sm:text-base text-white/60 mt-1.5">اختر القسم المناسب</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0"><svg viewBox="0 0 1440 50" fill="none" className="w-full" preserveAspectRatio="none"><path d="M0,25 C360,50 720,0 1080,25 C1260,37 1380,30 1440,25 L1440,50 L0,50 Z" fill="#f5f7f9" /></svg></div>
        </div>
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link
              href="/smart-watches/smart-watches"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-md hover:shadow-xl hover:border-[#1F7A8C]/20 transition-all duration-300 flex flex-col items-center gap-3 text-center group hover:-translate-y-1"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1F7A8C]/10 flex items-center justify-center text-3xl group-hover:bg-[#1F7A8C]/15 transition">⌚</div>
              <p className="text-sm sm:text-base font-bold text-gray-700 group-hover:text-[#1F7A8C] transition">الساعات الذكية</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
