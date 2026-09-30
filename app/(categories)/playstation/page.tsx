import type { Metadata } from "next";
import PlaystationClient from "./PlaystationClient";
import { getCachedProducts } from "../../lib/products-cache";

export const revalidate = 60;

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
  const title = `أجهزة بلاي ستيشن | ${siteName}`;
  const description = `تسوق أحدث أجهزة بلاي ستيشن وإكس بوكس وملحقاتها بأفضل الأسعار وبالأقساط في ${siteName}.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${BACKEND}${company.logo}`)
    : "";
  return {
    title,
    description,
    keywords: ["بلاي ستيشن", "PS5", "PS4", "إكس بوكس", "ألعاب", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/playstation`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/playstation` },
  };
}

export default async function PlaystationPage() {
  const products = await getCachedProducts();
  return <PlaystationClient initialProducts={products} />;
}
