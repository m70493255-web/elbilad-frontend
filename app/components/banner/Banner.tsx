import BannerSlider from "./BannerSlider";
import { getCachedBanners } from "../../lib/products-cache";

export default async function Banner() {
  const images = await getCachedBanners();

  if (!images.length)
    return (
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2e38] via-[#0f3d4a] to-[#155E6F]" />
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 lg:py-10">
          <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-black/10 backdrop-blur-sm border border-white/10 animate-pulse aspect-[3/4] sm:aspect-[16/9] lg:aspect-[2/1]" />
        </div>
      </section>
    );

  return <BannerSlider images={images} />;
}
