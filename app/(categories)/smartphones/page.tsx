import type { Metadata } from "next";
import SmartphonesClient from "./SmartphonesClient";
import { getCachedProducts, getCachedCompany } from "../../lib/products-cache";
import { isSmartphone } from "../../lib/phoneUtils";

export const revalidate = 60;

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
const SITE_URL = "https://albilaad-ksa.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCachedCompany();
  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const title = `الهواتف الذكية | ${siteName}`;
  const description = `تسوق أحدث الهواتف الذكية الأصلية (آبل آيفون وسامسونج جالاكسي) بأفضل الأسعار وبالأقساط الميسرة مع الضمان في ${siteName}.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${BACKEND}${company.logo}`)
    : "";
  return {
    title,
    description,
    keywords: ["هواتف ذكية", "آيفون 18", "آيفون 17", "آيفون 16", "سامسونج جالاكسي", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/smartphones`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/smartphones` },
  };
}

export default async function SmartphonesPage() {
  const products = await getCachedProducts();
  const phoneProducts = products.filter(isSmartphone);
  return <SmartphonesClient initialProducts={phoneProducts} />;
}
