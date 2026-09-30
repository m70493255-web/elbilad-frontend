import { unstable_cache } from "next/cache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

// ─── Products ────────────────────────────────────────────────────────────────
// revalidate: 60s + tag-based revalidation on product mutations
export const getCachedProducts = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${BACKEND}/api/products`, { cache: "no-store" });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },
  ["all-products"],
  { revalidate: 60, tags: ["products"] }
);

// ─── Hero Banners ─────────────────────────────────────────────────────────────
// revalidate: 300s — banners change rarely, tag-based revalidation available
export const getCachedBanners = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/banners`, { cache: "no-store" });
      if (!res.ok) return [];
      // Backend now returns only active banners with URLs
      const data: { url: string }[] = await res.json();
      return Array.isArray(data)
        ? data.map((b) => (b.url.startsWith("http") ? b.url : `${BACKEND}${b.url}`))
        : [];
    } catch {
      return [];
    }
  },
  ["hero-banners"],
  { revalidate: 300, tags: ["banners"] }
);

// ─── Home Config (settings + max) ────────────────────────────────────────────
// revalidate: 3600s — home layout config changes very rarely
export const getCachedHomeConfig = unstable_cache(
  async () => {
    try {
      const [settingsRes, maxRes] = await Promise.all([
        fetch(`${BACKEND}/api/admin/sub-categories/home-settings`, { cache: "no-store" }),
        fetch(`${BACKEND}/api/admin/sub-categories/max`, { cache: "no-store" }),
      ]);
      const settings = settingsRes.ok ? await settingsRes.json() : [];
      const { max = 4 } = maxRes.ok ? await maxRes.json() : {};
      return { settings, max };
    } catch {
      return { settings: [], max: 4 };
    }
  },
  ["home-config"],
  { revalidate: 3600, tags: ["home-settings"] }
);

// ─── Category Banners Bulk ────────────────────────────────────────────────────
// revalidate: 3600s — category banners change very rarely
// Takes a comma-joined string so unstable_cache can use it as a stable key
export const getCachedBannerMap = unstable_cache(
  async (categoriesKey: string): Promise<Record<string, string[]>> => {
    if (!categoriesKey) return {};
    try {
      const res = await fetch(
        `${BACKEND}/api/admin/category-banners-bulk?categories=${encodeURIComponent(categoriesKey)}`,
        { cache: "no-store" }
      );
      return res.ok ? res.json() : {};
    } catch {
      return {};
    }
  },
  ["category-banners-bulk"],
  { revalidate: 3600, tags: ["category-banners"] }
);

// ─── Company ──────────────────────────────────────────────────────────────────
// revalidate: 3600s — company info changes very rarely
export const getCachedCompany = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/company`, { cache: "no-store" });
      return res.ok ? res.json() : {};
    } catch {
      return {};
    }
  },
  ["company"],
  { revalidate: 3600, tags: ["company"] }
);

// ─── Sub-categories Public ────────────────────────────────────────────────────
// revalidate: 3600s — category list changes with products (tag: products)
export const getCachedSubCategoriesPublic = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/sub-categories/public`, { cache: "no-store" });
      return res.ok ? res.json() : [];
    } catch {
      return [];
    }
  },
  ["sub-categories-public"],
  { revalidate: 3600, tags: ["products"] }
);

// ─── Reviews ──────────────────────────────────────────────────────────────────
// revalidate: 300s — approved reviews don't change every second
export const getCachedReviews = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/reviews`, { cache: "no-store" });
      return res.ok ? res.json() : [];
    } catch {
      return [];
    }
  },
  ["reviews"],
  { revalidate: 300, tags: ["reviews"] }
);

// ─── Single product (for product detail page) ────────────────────────────────
// Always fetches full data with ?full=1 to bypass the card projection
export const getCachedProduct = (id: string) =>
  unstable_cache(
    async () => {
      try {
        const res = await fetch(`${BACKEND}/api/products/${id}?full=1`, { cache: "no-store" });
        return res.ok ? res.json() : null;
      } catch {
        return null;
      }
    },
    [`product-${id}`],
    { revalidate: 60, tags: ["products"] }
  )();

// ─── Search (uses cached products, no extra DB hit) ──────────────────────────
export async function searchCachedProducts(q: string, brand?: string) {
  const products: Record<string, string>[] = await getCachedProducts();
  const query = q.toLowerCase();
  return products.filter((p) => {
    const matchQ = !q || p.name?.toLowerCase().includes(query) || p.brand?.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query);
    const matchBrand = !brand || p.brand?.toLowerCase() === brand.toLowerCase();
    return matchQ && matchBrand;
  });
}
