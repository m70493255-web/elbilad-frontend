import type { Metadata } from "next";
import AboutClient from "./AboutClient";

const SITE_URL = "https://www.albiladksa.com";

export const metadata: Metadata = {
  title: "عن مؤسسة البلاد الحديثة للإلكترونيات",
  description: "تعرف على مؤسسة البلاد الحديثة للإلكترونيات - رؤيتنا وخدماتنا في بيع الأجهزة الإلكترونية بالأقساط داخل المملكة العربية السعودية.",
  keywords: ["البلاد الحديثة", "عن المؤسسة", "أجهزة إلكترونية بالأقساط", "السعودية"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    title: "عن مؤسسة البلاد الحديثة للإلكترونيات",
    description: "تعرف على مؤسسة البلاد الحديثة للإلكترونيات - رؤيتنا وخدماتنا في بيع الأجهزة الإلكترونية بالأقساط داخل المملكة العربية السعودية.",
    locale: "ar_SA",
    siteName: "مؤسسة البلاد الحديثة للإلكترونيات",
  },
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return <AboutClient />;
}
