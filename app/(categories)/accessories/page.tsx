import type { Metadata } from "next";
import AccessoriesClient from "./AccessoriesClient";
import { getCachedProducts, getCachedCompany } from "../../lib/products-cache";

export const revalidate = 300;

const SITE_URL = "https://www.albiladksa.com";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCachedCompany();
  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const title = `الإكسسوارات والبطاريات المتنقلة | ${siteName}`;
  const description = `تسوق كفرات الهواتف، واقي الشاشة، والبطاريات المتنقلة والشواحن الأصلية في ${siteName}.`;

  return {
    title,
    description,
    keywords: ["إكسسوارات", "بطاريات متنقلة", "كفرات", "واقي شاشة", "أنكر", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/accessories`,
      title,
      description,
      siteName,
      locale: "ar_SA",
    },
    alternates: { canonical: `${SITE_URL}/accessories` },
  };
}

export default async function AccessoriesPage() {
  const products = await getCachedProducts();
  return <AccessoriesClient initialProducts={products} />;
}
