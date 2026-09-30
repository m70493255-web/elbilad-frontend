import type { Metadata } from "next";
import { slugConfigs } from "../../lib/categoryConfig";
import CategoryPageClient from "./CategoryPageClient";
import { getCachedProducts, getCachedCompany } from "../../lib/products-cache";

export const revalidate = 60;

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
const SITE_URL = "https://www.albiladksa.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = slugConfigs[slug];
  const company = await getCachedCompany();

  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const label = config?.label ?? slug;
  const parentLabel = config?.parentLabel ?? "";

  const title = parentLabel ? `${label} - ${parentLabel}` : label;
  const description = `تسوق ${label} بأفضل الأسعار وبالأقساط في ${siteName}. ${parentLabel ? `ضمن قسم ${parentLabel}.` : ""} شحن سريع وضمان معتمد.`;

  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${BACKEND}${company.logo}`)
    : "";

  return {
    title,
    description,
    keywords: [label, parentLabel, siteName, "أقساط", "شراء", "السعودية"].filter(Boolean),
    openGraph: {
      type: "website",
      url: `${SITE_URL}/categories/${slug}`,
      title: `${title} | ${siteName}`,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: logoUrl ? [logoUrl] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/categories/${slug}`,
    },
  };
}

export default async function CategorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getCachedProducts();
  return <CategoryPageClient slug={slug} initialProducts={products} />;
}
