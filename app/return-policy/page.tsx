import type { Metadata } from "next";
import ReturnPolicyClient from "./ReturnPolicyClient";

const SITE_URL = "https://www.albiladksa.com";

export const metadata: Metadata = {
  title: "سياسة الاستبدال والاسترجاع",
  description: "الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع داخل مؤسسة البلاد الحديثة للإلكترونيات.",
  keywords: ["سياسة الاسترجاع", "استبدال", "إلغاء طلب", "البلاد الحديثة", "السعودية"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/return-policy`,
    title: "سياسة الاستبدال والاسترجاع | مؤسسة البلاد الحديثة للإلكترونيات",
    description: "الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع داخل مؤسسة البلاد الحديثة للإلكترونيات.",
    locale: "ar_SA",
    siteName: "مؤسسة البلاد الحديثة للإلكترونيات",
  },
  alternates: { canonical: `${SITE_URL}/return-policy` },
};

export default function ReturnPolicyPage() {
  return <ReturnPolicyClient />;
}
