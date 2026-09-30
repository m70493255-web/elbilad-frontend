"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

function toArabicWords(n: number): string {
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة",
    "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر",
    "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
  if (n === 0) return "صفر";
  if (n < 0) return "سالب " + toArabicWords(-n);
  let result = "";
  if (n >= 1000) {
    const t = Math.floor(n / 1000);
    result += (t === 1 ? "ألف" : t === 2 ? "ألفان" : t <= 10 ? toArabicWords(t) + " آلاف" : toArabicWords(t) + " ألف") + " ";
    n %= 1000;
    if (n > 0) result += "و";
  }
  if (n >= 100) { result += hundreds[Math.floor(n / 100)] + " "; n %= 100; if (n > 0) result += "و"; }
  if (n >= 20) { result += tens[Math.floor(n / 10)] + " "; n %= 10; if (n > 0) result += "و"; }
  if (n > 0) result += ones[n] + " ";
  return result.trim();
}

interface OrderItem { name: string; price: number; quantity: number; }
interface Order {
  orderId: string; createdAt: string; customer: string; whatsapp: string; address: string;
  total: number; downPayment: number; months: number; monthlyPayment: number;
  installmentType: string; items: OrderItem[]; discountAmount?: number;
}
interface Company { header?: string; footer?: string; nameAr?: string; currencyAr?: string; phone?: string; stamp?: string; }

export default function ContractPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ order: Order; company: Company } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}/invoice`).then((r) => r.json()).then(setData);
  }, [id]);

  useEffect(() => {
    document.body.classList.add("print-page", "contract-page");
    return () => document.body.classList.remove("print-page", "contract-page");
  }, []);

  useEffect(() => {
    if (data) setTimeout(() => window.print(), 500);
  }, [data]);

  if (!data) return <div style={{ textAlign: "center", padding: 40 }}>جاري التحميل...</div>;

  const { order, company } = data;

  if (order.installmentType !== "installment") {
    return (
      <div style={{ fontFamily: "Arial, sans-serif", padding: 40, textAlign: "center", direction: "rtl" }}>
        <h2 style={{ color: "#374151", marginBottom: 12, fontSize: 20, fontWeight: "bold" }}>تنبيه: هذا الطلب تم بنظام الدفع الكامل</h2>
        <p style={{ color: "#6b7280", marginBottom: 20 }}>عقد البيع بالتقسيط مخصص فقط للطلبات بنظام التقسيط الشهري.</p>
        <button
          onClick={() => window.close()}
          style={{ padding: "8px 20px", backgroundColor: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
        >
          إغلاق النافذة
        </button>
      </div>
    );
  }

  const currency = company.currencyAr || "ريال";
  const discount = order.discountAmount ?? 0;
  const totalAfterDiscount = order.total;
  const remaining = Math.max(0, totalAfterDiscount - (order.downPayment || 0));
  const monthly = order.monthlyPayment || (order.months > 0 ? Math.ceil(remaining / order.months) : remaining);
  const productNames = order.items.map((i) => i.name).join("، ");

  const now = new Date(order.createdAt);
  const firstPayment = new Date(now);
  firstPayment.setMonth(firstPayment.getMonth() + 1);
  const firstPaymentStr = `${firstPayment.getFullYear()}/${String(firstPayment.getMonth() + 1).padStart(2, "0")}/${String(firstPayment.getDate()).padStart(2, "0")}`;

  const style = `
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #fff !important; font-family: Arial, sans-serif; direction: rtl; }
    .sig-row { display: flex; justify-content: space-between; margin-top: 40px; font-size: 13px; }
    @media (max-width: 500px) {
      .sig-row { flex-direction: column; align-items: center; gap: 24px; }
    }
    @media print {
      @page { size: A4; margin: 10mm; }
      html, body { margin: 0; padding: 0; background: #fff !important; }
      img[alt="header"], img[alt="footer"] { width: 100% !important; max-height: none !important; }
    }
  `;


  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto", direction: "rtl", backgroundColor: "#fff", minHeight: "100vh", color: "#000" }}>
      <style>{style}</style>

      {company.header && <img src={company.header} alt="header" style={{ width: "100%", marginBottom: 24 }} />}

      {/* العنوان */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>عقد بيع بالتقسيط</div>
        <div style={{ fontSize: 13, color: "#555" }}>{company.nameAr || ""}</div>
      </div>

      <hr style={{ border: "none", borderTop: "2px solid #1a1a1a", marginBottom: 16 }} />

      {/* نص العقد */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", marginBottom: 16, fontSize: 13 }}>
        <tbody>
          <tr>
            <td style={{ padding: 16, lineHeight: 2.4, textAlign: "justify" }}>
              نعم أنا السيد :/ <strong>{order.customer}</strong> برقم جوال :/ <strong>{order.whatsapp}</strong> وعنوانه :/ <strong>{order.address}</strong>
              <br />
              أُقر وأعترف وأنا في حالتي الشرعية وبكامل قواي العقلية بأني في ذمتي للمؤسسة المدعوة :/ <strong>{company.nameAr}</strong>
              <br />
              مبلغ وقدره :/ <strong>{remaining.toLocaleString("ar-SA")} ( {toArabicWords(remaining)} ) {currency} فقط.</strong>
              <br />
              {discount > 0 && (<>وذلك بعد تطبيق خصم قدره :/ <strong>{discount.toLocaleString("ar-SA")} ( {toArabicWords(discount)} ) {currency}</strong><br /></>)}
              <br />
              وذلك قيمة عن ما تبقى من ثمن جهاز/أجهزة :/ <strong>{productNames}</strong>
              <br />
              على أن يُدفع المبلغ على أقساط شهرية متتالية ومستمرة بدون انقطاع بما فيها شهر رمضان والأعياد
              <br />
              قيمة الدفعة الشهرية :/ <strong>{monthly.toFixed(2)} ( {toArabicWords(Math.round(monthly))} ) {currency} فقط</strong> اعتباراً من تاريخ :/ <strong>{firstPaymentStr}</strong>
              <br />
              نهاية المبلغ المذكور أعلاه وأنني بسداد الأقساط في موعدها بدون تأخر عن أي قسط عن موعده المحدد فإني ملتزم التزاماً تاماً بسداد المبلغ المتبقي كاملاً دفعة واحدة.
              <br />
              كما أنني أُقر على نفسي بأنه لا يوجد التزامات مالية ولا كفالات غرامية وقد أذنت والله خير الشاهدين لاسم :/ <strong>{order.customer}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <hr style={{ border: "none", borderTop: "2px solid #1a1a1a", marginBottom: 32 }} />

      {/* التوقيع والختم */}
      <div className="sig-row">
        <div style={{ textAlign: "center", width: 180 }}>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 8, color: "#555" }}>التوقيع :/ ........................</div>
        </div>
        <div style={{ textAlign: "center", width: 180 }}>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 8, color: "#555" }}>الختم</div>
          {company.stamp && <img src={company.stamp} alt="ختم" style={{ maxWidth: 130, maxHeight: 110, objectFit: "contain", marginTop: 8, opacity: 0.85 }} />}
        </div>
      </div>

      {company.footer && <img src={company.footer} alt="footer" style={{ width: "100%", marginTop: 24 }} />}
    </div>
  );
}
