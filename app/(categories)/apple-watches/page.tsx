import type { Metadata } from "next";
import AppleWatchesClient from "./AppleWatchesClient";
import { getCachedProducts, getCachedCompany } from "../../lib/products-cache";

export const revalidate = 60;

const SITE_URL = "https://www.albiladksa.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCachedCompany();
  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const title = `ساعات أبل الذكية | ${siteName}`;
  const description = `تسوق ساعات أبل وApple Watch بأحدث الموديلات وبالأقساط المريحة في ${siteName}.`;

  return {
    title,
    description,
    keywords: ["ساعات أبل", "Apple Watch", "ساعات ذكية", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/apple-watches`,
      title,
      description,
      siteName,
      locale: "ar_SA",
    },
    alternates: { canonical: `${SITE_URL}/apple-watches` },
  };
}

export default async function AppleWatchesPage() {
  const products = await getCachedProducts();
  return <AppleWatchesClient initialProducts={products} />;
}
