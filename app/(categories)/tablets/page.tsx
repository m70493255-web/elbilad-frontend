import type { Metadata } from "next";
import TabletsClient from "./TabletsClient";
import { getCachedProducts, getCachedCompany } from "../../lib/products-cache";

export const revalidate = 300;

const SITE_URL = "https://www.albiladksa.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCachedCompany();
  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const title = `الأجهزة اللوحية وايبادات | ${siteName}`;
  const description = `تسوق أجهزة أيباد اللوحية بأفضل الأسعار وبالأقساط المريحة في ${siteName}.`;

  return {
    title,
    description,
    keywords: ["ايباد", "تابلت", "أجهزة لوحية", "أبل", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/tablets`,
      title,
      description,
      siteName,
      locale: "ar_SA",
    },
    alternates: { canonical: `${SITE_URL}/tablets` },
  };
}

export default async function TabletsPage() {
  const products = await getCachedProducts();
  return <TabletsClient initialProducts={products} />;
}
