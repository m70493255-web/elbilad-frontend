import type { Metadata } from "next";
import LaptopsClient from "./LaptopsClient";
import { getCachedProducts, getCachedCompany } from "../../lib/products-cache";

export const revalidate = 60;

const SITE_URL = "https://www.albiladksa.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCachedCompany();
  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const title = `لابتوبات وشاشات | ${siteName}`;
  const description = `تسوق أجهزة ماك بوك ولابتوبات وشاشات بأفضل الأسعار وبالأقساط في ${siteName}.`;

  return {
    title,
    description,
    keywords: ["لابتوبات", "ماك بوك", "شاشات", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/laptops`,
      title,
      description,
      siteName,
      locale: "ar_SA",
    },
    alternates: { canonical: `${SITE_URL}/laptops` },
  };
}

export default async function LaptopsPage() {
  const products = await getCachedProducts();
  return <LaptopsClient initialProducts={products} />;
}
