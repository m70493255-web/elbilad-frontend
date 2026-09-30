import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";
import { getCachedCompany } from "../lib/products-cache";

const SITE_URL = "https://www.albiladksa.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCachedCompany();
  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const title = `طرق الدفع والتقسيط | ${siteName}`;
  const description = `تعرف على طرق الدفع المعتمدة (مدى، فيزا، ماستركارد) وخطط التقسيط الميسرة بدون فوائد لدى ${siteName}.`;

  return {
    title,
    description,
    keywords: ["طرق الدفع", "مدى", "فيزا", "ماستركارد", "تقسيط بدون فوائد", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/payment`,
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
    alternates: { canonical: `${SITE_URL}/payment` },
  };
}

export default async function PaymentPage() {
  const company = await getCachedCompany();
  return <PaymentClient company={company} />;
}
