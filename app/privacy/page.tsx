import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";
import { getCachedCompany } from "../lib/products-cache";

const SITE_URL = "https://www.albiladksa.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCachedCompany();
  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const title = `سياسة الخصوصية واتفاقية الاستخدام | ${siteName}`;
  const description = `تعرف على سياسة الخصوصية واتفاقية الاستخدام وحماية البيانات الشخصية المعتمدة لدى ${siteName}.`;

  return {
    title,
    description,
    keywords: ["سياسة الخصوصية", "اتفاقية الاستخدام", "حماية البيانات", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/privacy`,
      title,
      description,
      locale: "ar_SA",
      siteName,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: { canonical: `${SITE_URL}/privacy` },
  };
}

export default function PrivacyPage() {
  return <PrivacyClient />;
}
