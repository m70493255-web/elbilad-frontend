import type { Metadata } from "next";
import AudioClient from "./AudioClient";
import { getCachedProducts } from "../../lib/products-cache";

export const revalidate = false;

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
  const title = `أجهزة صوت وسماعات | ${siteName}`;
  const description = `تسوق سماعات أبل وأجهزة الصوت بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${BACKEND}${company.logo}`)
    : "";
  return {
    title,
    description,
    keywords: ["سماعات", "أجهزة صوت", "AirPods", "أبل", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/audio`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/audio` },
  };
}

export default async function AudioPage() {
  const products = await getCachedProducts();
  return <AudioClient initialProducts={products} />;
}
