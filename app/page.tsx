import { Banner } from "./components/banner";
import { ProductGrid } from "./components/products";
import CustomerReviews from "./components/CustomerReviews";
import ShopByCategory from "./components/ShopByCategory";
import {
  getCachedProducts,
  getCachedHomeConfig,
  getCachedBannerMap,
  getCachedCompany,
} from "./lib/products-cache";

// ISR: revalidate every 300s (5m) — driven by the shortest-lived cache (products)
// Individual data sources use their own longer TTLs via unstable_cache
export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.albiladksa.com";

export default async function Home() {
  // All parallel — no waterfall at this level
  const [products, homeConfig, company] = await Promise.all([
    getCachedProducts(),
    getCachedHomeConfig(),
    getCachedCompany(),
  ]);

  const categories = [
    ...new Set(
      (products as { category?: string }[])
        .map((p) => p.category)
        .filter(Boolean)
    ),
  ] as string[];

  // Optimize RSC payload: compute visible categories & top 4 products per category
  const visibleCategories = (() => {
    if (!homeConfig?.settings?.length) return categories.slice(0, 4);
    const visibleSettings = homeConfig.settings.filter((s: any) => s.showInHome);
    if (!visibleSettings.length) return categories.slice(0, homeConfig.max || 4);
    return visibleSettings
      .sort((a: any, b: any) => a.order - b.order)
      .slice(0, homeConfig.max || 4)
      .map((s: any) => s.category)
      .filter((c: string, idx: number, arr: string[]) => arr.indexOf(c) === idx)
      .filter((c: string) => categories.some((ac) => ac === c || ac.trim() === c.trim()));
  })();

  const bannerMap = await getCachedBannerMap(visibleCategories.join(","));

  const parseStorage = (s?: string) => {
    if (!s) return 0;
    const n = parseFloat(s);
    if (s.includes("تيرا") || s.toLowerCase().includes("tb")) return n * 1024;
    return n || 0;
  };
  const colorOrder = (c?: string) => {
    if (!c) return 99;
    if (c.includes("برتقال") || c.toLowerCase().includes("orange")) return 0;
    if (c.includes("سيلفر") || c.toLowerCase().includes("silver")) return 1;
    if (c.includes("ازرق") || c.includes("أزرق") || c.toLowerCase().includes("blue")) return 2;
    return 3;
  };
  const iphone18Keywords = ["ايفون 18", "iphone 18", "آيفون 18"];

  const grouped: Record<string, any[]> = {};
  const visibleSet = new Set(visibleCategories);
  (products as any[]).forEach((p) => {
    const cat = p.category;
    if (cat && visibleSet.has(cat)) {
      (grouped[cat] ??= []).push(p);
    }
  });

  const homeProducts: any[] = [];
  for (const cat of visibleCategories) {
    const items = grouped[cat] || [];
    const isIphone18 = iphone18Keywords.some((kw) => cat.toLowerCase().includes(kw.toLowerCase()));
    if (isIphone18) {
      items.sort((a, b) => {
        const priceA = a.salePrice ?? a.originalPrice ?? a.price ?? 0;
        const priceB = b.salePrice ?? b.originalPrice ?? b.price ?? 0;
        return priceA - priceB;
      });
    } else {
      items.sort((a, b) => {
        const storageDiff = parseStorage(a.storage) - parseStorage(b.storage);
        if (storageDiff !== 0) return storageDiff;
        return colorOrder(a.color) - colorOrder(b.color);
      });
    }
    homeProducts.push(...items.slice(0, 4));
  }

  const siteName = company.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات";
  const logoUrl = company.logo
    ? company.logo.startsWith("http")
      ? company.logo
      : `${process.env.BACKEND_URL || "http://localhost:5000"}${company.logo}`
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: company.nameEn || "Al Bilad Modern Electronics",
    url: SITE_URL,
    logo: logoUrl,
    contactPoint: [
      company.phone && {
        "@type": "ContactPoint",
        telephone: company.phone,
        contactType: "customer service",
        areaServed: "SA",
        availableLanguage: "Arabic",
      },
      company.whatsapp && {
        "@type": "ContactPoint",
        telephone: company.whatsapp,
        contactType: "sales",
        areaServed: "SA",
        availableLanguage: "Arabic",
      },
    ].filter(Boolean),
    address: company.addressAr
      ? {
          "@type": "PostalAddress",
          addressLocality: company.addressAr,
          addressCountry: "SA",
        }
      : undefined,
    email: company.email || undefined,
    sameAs: company.website ? [company.website] : [],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <main
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(180deg, #d4ece8 0%, #e2f3f0 20%, #edf7f5 45%, #f5fbf9 70%, #ffffff 100%)",
        }}
      >
        <Banner />
        {/* Pass homeConfig + categories to avoid duplicate home-settings fetch */}
        <ShopByCategory homeConfig={homeConfig} categories={categories} />
        <ProductGrid products={homeProducts} homeConfig={homeConfig} bannerMap={bannerMap} />
        <CustomerReviews />
      </main>
    </>
  );
}
