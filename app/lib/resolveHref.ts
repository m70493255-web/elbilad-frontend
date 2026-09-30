import { slugConfigs } from "./categoryConfig";

export function resolveHref(catName: string): string {
  const name = catName?.trim();
  if (!name) return "/";

  const lower = name.toLowerCase();

  // Audio
  if (lower.includes("سماعات") || lower === "speaker" || lower === "earbuds") {
    return "/audio";
  }

  // Accessories & Batteries
  if (lower === "اكسسورات" || lower === "إكسسوارات" || lower.includes("اكسسوار")) {
    return "/accessories";
  }
  if (lower.includes("بطاريات") || lower.includes("شاحن") || lower.includes("كيابل")) {
    return "/accessories";
  }

  // PlayStation & Gaming
  if (
    lower.includes("بلاستيشن") ||
    lower.includes("بلايستيشن") ||
    lower.includes("بلاي ستيشن") ||
    lower === "ps5" ||
    lower === "ps4"
  ) {
    if (lower === "ps5") return "/playstation/ps5";
    return "/playstation";
  }

  // Laptops & Screens
  if (lower === "ماك بوك إير" || lower === "ماك بوك اير") return "/laptops/macbook-air";
  if (lower === "monitor" || lower.includes("شاشات")) return "/laptops/samsung-monitors";
  if (lower.includes("لابتوب") || lower.includes("laptop") || lower.includes("ماك بوك")) {
    return "/laptops";
  }

  // Tablets & iPads
  if (lower === "tablet" || lower.includes("ايباد") || lower.includes("آيباد") || lower.includes("لوحي")) {
    return "/tablets";
  }

  // Apple Watches & Smart Watches
  if (lower.includes("ساعات")) {
    return "/apple-watches";
  }

  // First try direct slugConfig exact match
  for (const [slug, config] of Object.entries(slugConfigs)) {
    const parent = config.parentHref.replace(/^\//, "").split("/")[0];
    const path = `/${parent}/${slug}`;
    if (config.filters.category && config.filters.category.trim().toLowerCase() === lower) {
      return path;
    }
  }

  // Then try nameIncludes in slugConfigs
  for (const [slug, config] of Object.entries(slugConfigs)) {
    const parent = config.parentHref.replace(/^\//, "").split("/")[0];
    const path = `/${parent}/${slug}`;
    if (config.filters.nameIncludes?.some((kw) => lower.includes(kw.toLowerCase()))) {
      return path;
    }
  }

  // Fallback for general smartphones
  if (lower.includes("ايفون") || lower.includes("iphone") || lower.includes("سامسونج") || lower.includes("samsung") || lower.includes("جالكسي") || lower.includes("جلاكسي")) {
    return "/smartphones";
  }

  return `/search?q=${encodeURIComponent(name)}`;
}
