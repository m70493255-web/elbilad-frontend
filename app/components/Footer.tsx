import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaMobileAlt, FaEnvelope } from "react-icons/fa";
import { getCachedCompany } from "../lib/products-cache";

export default async function Footer() {
  const c = await getCachedCompany();

  function ensureAbsolute(url: string) {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
  }

  function toInlineUrl(url: string) {
    if (!url) return url;
    const rawUrl = url.replace("/image/upload/", "/raw/upload/").replace(/\/fl_attachment:[^/]+\//, "/");
    return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=false`;
  }

  const qrSrc: string = c.qrImage || "";
  const qrLink: string = ensureAbsolute(c.qrLink || "");

  const footerItems: { image: string; linkType: string; link: string; file: string }[] =
    (c.footerItems || []).filter((item: { image: string }) => item.image);

  const img1: string = c.img1 || "";
  const linkType1: string = c.link1Type || c.linkType1 || "link";
  const useFile1 =
    linkType1 === "file" || (!!(c.file1 || "").trim() && !(c.link1 || "").trim());
  const link1: string = useFile1 ? toInlineUrl(c.file1 || "") : ensureAbsolute(c.link1 || "");
  const img2: string = c.img2 || "";
  const linkType2: string = c.link2Type || c.linkType2 || "link";
  const useFile2 =
    linkType2 === "file" || (!!(c.file2 || "").trim() && !(c.link2 || "").trim());
  const link2: string = useFile2 ? toInlineUrl(c.file2 || "") : ensureAbsolute(c.link2 || "");

  function getHref(item: { linkType: string; link: string; file: string }) {
    const asFile =
      item.linkType === "file" ||
      (!!(item.file || "").trim() && !(item.link || "").trim());
    return asFile ? toInlineUrl(item.file) : ensureAbsolute(item.link);
  }

  return (
    <footer className="text-gray-100 mt-16" style={{ background: '#1a6b7d' }} dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* من نحن */}
        <div>
          <h3 className="text-[#6DBE00] font-bold text-xl mb-3">من نحن</h3>
          <p className="text-sm leading-relaxed text-[#F5F7F8]">
            {c.details || "مؤسسة البلاد الحديثة للإلكترونيات هي اختيارك الأول لشراء أجهزتك بالأقساط داخل السعودية، ضمان موثوق وخدمة محلية."}
          </p>
        </div>

        {/* روابط مهمة */}
        <div>
          <h3 className="text-[#6DBE00] font-bold text-xl mb-4">روابط مهمة</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: `عن ${c.nameAr || "مؤسسة البلاد الحديثة للإلكترونيات"}`, href: "/about" },
              { label: "طرق الدفع", href: "/payment" },
              { label: "سياسة الاستبدال والاسترجاع", href: "/return-policy" },
              { label: "سياسة الخصوصية واتفاقية الاستخدام", href: "/privacy" },
            ].map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="hover:text-[#6DBE00] transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* تواصل معنا */}
        <div>
          <h3 className="text-[#6DBE00] font-bold text-xl mb-4">تواصل معنا</h3>
          <ul className="space-y-2.5 text-sm mb-5">
            {c.whatsapp && (
              <li className="flex items-center gap-2">
                <FaWhatsapp className="text-emerald-500 shrink-0" size={16} />
                <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-[#6DBE00] transition-colors" dir="ltr">{c.whatsapp}</a>
              </li>
            )}
            {c.phone && (
              <li className="flex items-center gap-2">
                <FaMobileAlt className="text-emerald-500 shrink-0" size={16} />
                <a href={`tel:${c.phone}`} className="hover:text-[#6DBE00] transition-colors" dir="ltr">{c.phone}</a>
              </li>
            )}
            {c.email && (
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-emerald-500 shrink-0" size={16} />
                <a href={`mailto:${c.email}`} className="hover:text-[#6DBE00] transition-colors" dir="ltr">{c.email}</a>
              </li>
            )}
          </ul>

          <div className="flex gap-2 items-center flex-nowrap overflow-x-auto justify-center sm:justify-start">
            {/* QR */}
            {qrSrc && (
              qrLink
                ? <a href={qrLink} target="_blank" rel="noreferrer">
                    <Image src={qrSrc} alt="رمز QR للتواصل" width={60} height={60} className="object-contain rounded border border-gray-200 bg-white p-1" style={{ width: 60, height: 60 }} />
                  </a>
                : <Image src={qrSrc} alt="رمز QR للتواصل" width={60} height={60} className="object-contain rounded border border-gray-200 bg-white p-1" style={{ width: 60, height: 60 }} />
            )}

            {/* Footer Items */}
            {footerItems.map((item, i) => {
              const href = getHref(item);
              const el = (
                <Image key={i} src={item.image} alt={`شعار شريك ${i + 1}`} width={60} height={60}
                  className="object-contain rounded" style={{ width: 60, height: 60 }} />
              );
              return href
                ? <a key={i} href={href} target="_blank" rel="noreferrer">{el}</a>
                : <span key={i}>{el}</span>;
            })}

            {/* img1 */}
            {img1 && (
              link1
                ? <a href={link1} target="_blank" rel="noreferrer">
                    <Image src={img1} alt="وسيلة دفع معتمدة" width={60} height={60} className="object-contain rounded" style={{ width: 60, height: 60 }} />
                  </a>
                : <Image src={img1} alt="وسيلة دفع معتمدة" width={60} height={60} className="object-contain rounded" style={{ width: 60, height: 60 }} />
            )}

            {/* img2 */}
            {img2 && (
              link2
                ? <a href={link2} target="_blank" rel="noreferrer">
                    <Image src={img2} alt="وسيلة دفع معتمدة" width={60} height={60} className="object-contain rounded" style={{ width: 60, height: 60 }} />
                  </a>
                : <Image src={img2} alt="وسيلة دفع معتمدة" width={60} height={60} className="object-contain rounded" style={{ width: 60, height: 60 }} />
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#1F7A8C] max-w-6xl mx-auto px-4 py-4 text-xs text-[#F5F7F8]">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <span className="text-center">الحقوق محفوظة مؤسسة البلاد الحديثة للإلكترونيات  © 2026</span>
          <Image src="/payment-methods.webp" alt="بطاقات الدفع" width={120} height={40} className="object-contain" style={{ width: "auto" }} />
        </div>
      </div>
    </footer>
  );
}
