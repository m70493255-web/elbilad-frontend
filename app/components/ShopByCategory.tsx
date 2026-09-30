import CategorySlider from "./CategorySlider";
import { getCachedSubCategoriesPublic } from "../lib/products-cache";
import { resolveHref } from "../lib/resolveHref";

type Category = { name: string; count: number; image: string };
type Setting = { category: string; subCategory: string; showInHome: boolean; order: number };
type HomeConfig = { settings: Setting[]; max: number };

const COMING_SOON_CARDS = [
  {
    name: "ايفون 18 برو ماكس",
    count: 0,
    image: "/8435e6ba-7c1d-4fc7-98fa-0193c4db8529.jpg",
    href: "/smartphones/iphone-18-pro-max",
    comingSoon: true,
  },
  {
    name: "ايفون 18 برو",
    count: 0,
    image: "/8435e6ba-7c1d-4fc7-98fa-0193c4db8529.jpg",
    href: "/smartphones/iphone-18-pro",
    comingSoon: true,
  },
  {
    name: "ايفون 18 دو",
    count: 0,
    image: "https://res.cloudinary.com/dllmx2yf3/image/upload/v1789347106/5b3e6b54-5d81-4779-bf50-b785d673956a_de1evw.webp",
    href: "/smartphones/iphone-18-duo",
    comingSoon: true,
  },
];

export default async function ShopByCategory({
  homeConfig,
}: {
  homeConfig: HomeConfig;
  categories: string[];
}) {
  // getCachedSubCategoriesPublic is cached independently (revalidate: 3600)
  const allCats: Category[] = await getCachedSubCategoriesPublic();

  if (!allCats.length) return null;

  // Use homeConfig passed from page.tsx — no duplicate fetch
  const { settings } = homeConfig;
  const orderMap = new Map(
    settings.filter((s) => s.showInHome).map((s) => [s.category, s.order])
  );

  const sorted = [...allCats].sort((a, b) => {
    const aHome = orderMap.has(a.name);
    const bHome = orderMap.has(b.name);
    if (aHome && !bHome) return -1;
    if (!aHome && bHome) return 1;
    if (aHome && bHome)
      return (orderMap.get(a.name) ?? 0) - (orderMap.get(b.name) ?? 0);
    return 0;
  });

  const comingSoonHrefs = new Set(COMING_SOON_CARDS.map((c) => c.href));

  const categoriesWithHref = [
    ...COMING_SOON_CARDS,
    ...sorted
      .map((cat) => ({ ...cat, href: resolveHref(cat.name) }))
      .filter((cat) => !comingSoonHrefs.has(cat.href)),
  ];

  return (
    <div className="w-full" dir="rtl">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-[#6DBE00] font-semibold uppercase tracking-widest mb-0.5">
              تصفح
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              تسوق حسب الأقسام
            </h2>
          </div>
          <div className="h-10 w-1 rounded-full bg-gradient-to-b from-[#155E6F] to-[#6DBE00]" />
        </div>
      </div>

      <div className="bg-[#f8fafb] px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <CategorySlider categories={categoriesWithHref} />
        </div>
      </div>
    </div>
  );
}
