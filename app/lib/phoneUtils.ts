import type { Product } from "../components/products/types";

const NON_PHONE_PATTERNS = [
  "ساعات",
  "watch",
  "سماعات",
  "سماعة",
  "speaker",
  "earbuds",
  "airpods",
  "ماك بوك",
  "macbook",
  "laptop",
  "لابتوب",
  "ايباد",
  "آيباد",
  "ipad",
  "tablet",
  "لوحي",
  "شاشات",
  "شاشة",
  "monitor",
  "اكسسورات",
  "إكسسوارات",
  "بطاريات",
  "بطارية",
  "بلاستيشن",
  "بلايستيشن",
  "ps5",
  "ps4",
  "gaming",
  "controller",
  "كفر",
  "حماية",
  "شاحن",
  "ستاند",
  "يد تحكم",
];

export function isSmartphone(p: Product): boolean {
  const cat = (p.category ?? "").toLowerCase();
  const name = (p.name ?? "").toLowerCase();

  for (const pattern of NON_PHONE_PATTERNS) {
    if (cat.includes(pattern)) return false;
  }

  if (
    name.includes("كفر") ||
    name.includes("واقي شاشة") ||
    name.includes("حماية") ||
    name.includes("شاحن") ||
    name.includes("سماعة") ||
    name.includes("ساعة") ||
    name.includes("بطارية") ||
    name.includes("ايباد") ||
    name.includes("آيباد") ||
    name.includes("ماك بوك") ||
    name.includes("يد تحكم") ||
    name.includes("شاشة") ||
    name.includes("ستاند") ||
    name.includes("airpods")
  ) {
    return false;
  }

  const isIphone =
    cat.includes("ايفون") ||
    cat.includes("iphone") ||
    name.includes("ايفون") ||
    name.includes("iphone");

  const isSamsung =
    cat.includes("سامسونج") ||
    cat.includes("samsung") ||
    cat.includes("جالاكسي") ||
    cat.includes("جالكسي") ||
    cat.includes("جلاكسي") ||
    cat.includes("galaxy") ||
    name.includes("سامسونج") ||
    name.includes("samsung") ||
    name.includes("جالاكسي") ||
    name.includes("جالكسي") ||
    name.includes("جلاكسي") ||
    name.includes("galaxy");

  return isIphone || isSamsung;
}
