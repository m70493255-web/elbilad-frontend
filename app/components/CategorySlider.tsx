"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

const SWIPE_THRESHOLD = 50;

const CATEGORY_DESC: Record<string, string> = {
  "ايفون 18 برو ماكس": "الأقوى في سلسلة 18",
  "ايفون 18 برو": "احترافية بلا حدود",
  "ايفون 18 دو": "تصميم جديد كلياً",
  "ايفون 18": "استعد للجيل الجديد كلياً",
  "ابل ايفون 17 برو ماكس": "أقوى ايفون على الإطلاق",
  "ابل ايفون 17 برو": "أداء احترافي بتصميم أنيق",
  "ابل ايفون 17 اير": "رفيع وخفيف بقوة استثنائية",
  "ابل ايفون 17": "تجربة ايفون بسعر مناسب",
  "ابل ايفون 16 برو ماكس": "كاميرا احترافية وشاشة مذهلة",
  "ايفون 16 برو": "تصوير سينمائي بأعلى مستوى",
  "ايفون 16 بلس": "شاشة كبيرة وبطارية قوية",
  "ايفون 16 ": "أحدث جيل من ايفون",
  "ابل ايفون 15 برو ماكس": "تيتانيوم وكاميرا لا مثيل لها",
  "ابل ايفون 15 بلس": "شاشة ضخمة وأداء سلس",
  "ابل ايفون 14 برو ماكس": "كلاسيك بأداء لا يُنافس",
  "سامسونج جالاكسي S26": "أحدث فلاجشيب من سامسونج",
  "سامسونج جالاكسي S25": "ذكاء اصطناعي في كل لحظة",
  "سامسونج جالاكسي S24": "شاشة AMOLED وأداء خارق",
  "سامسونج جلاكسي S23 الترا": "قلم S-Pen وكاميرا 200MP",
  "بلاستيشن وملحقاته": "العب بلا حدود",
  "سماعات": "صوت نقي في كل مكان",
  "ساعات ابل": "صحتك على معصمك",
  "اكسسورات": "إكمالات تليق بأجهزتك",
  "بطاريات متنقله": "طاقة دائمة أينما كنت",
  "monitor": "وضوح لا يُضاهى",
  "tablet": "إنتاجية وترفيه في جهاز واحد",
  "ماك بوك إير": "خفيف وسريع للإبداع",
};

function getCategoryDesc(name: string): string {
  return CATEGORY_DESC[name.trim()] ?? "تسوق أفضل المنتجات";
}

type Category = { name: string; count: number; image: string; href: string; comingSoon?: boolean };

export default function CategorySlider({ categories }: { categories: Category[] }) {
  const [current, setCurrent] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const touchStart = useRef(0);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setItemsPerPage(3);
      else if (window.innerWidth < 1024) setItemsPerPage(4);
      else setItemsPerPage(5);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const total = Math.ceil(categories.length / itemsPerPage);
  const groups = Array.from({ length: total }, (_, i) =>
    categories.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  );

  const goTo = useCallback((i: number) => setCurrent((i + total) % total), [total]);

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) goTo(current + (diff > 0 ? 1 : -1));
  };

  if (!categories.length) return null;

  return (
    <div className="relative" dir="rtl">

      {/* Cards */}
      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-3">
          {groups[current].map((cat) => (
            <Link key={cat.name} href={cat.href} className="group block">
              <div className="relative rounded-lg overflow-hidden bg-white aspect-[2/3] sm:aspect-[4/5]">
                {/* Image */}
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className={`transition-transform duration-500 group-hover:scale-105 ${
                      cat.comingSoon ? "object-contain object-center scale-135" : "object-cover object-center scale-90"
                    }`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#155E6F] to-[#1F7A8C]" />
                )}

                {/* Dark overlay */}
                <div className={`absolute inset-0 ${
                  cat.comingSoon
                    ? "bg-gradient-to-t from-black/90 via-black/30 to-black/10"
                    : "bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                }`} />

                {/* Coming Soon Badge */}
                {cat.comingSoon && (
                  <div className="absolute top-2 right-2 bg-[#6DBE00] text-white text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                    قريباً
                  </div>
                )}

                {/* Content */}
                {cat.comingSoon ? (
                  <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3">
                    <h3 className="text-white font-extrabold text-xs sm:text-base leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-white/90 text-[10px] sm:text-sm mt-1 leading-tight font-medium">
                      {getCategoryDesc(cat.name)}
                    </p>
                    <span className="inline-block mt-2 bg-[#6DBE00] text-white text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                      عرض الكل
                    </span>
                  </div>
                ) : (
                  <div className="absolute bottom-0 inset-x-0 p-1.5 sm:p-3">
                    <h3 className="text-white font-bold text-[10px] sm:text-sm leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-white/70 text-[9px] sm:text-xs mt-0.5 leading-tight hidden sm:block">
                      {getCategoryDesc(cat.name)}
                    </p>
                    <p className="text-white/50 text-[8px] sm:text-[11px] mt-0.5">
                      {cat.count} منتج
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-5 h-2 bg-[#155E6F]" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
