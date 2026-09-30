"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface OrderItem { name: string; price: number; quantity: number; }
interface Order {
  orderId: string; createdAt: string; customer: string; whatsapp: string; address: string;
  total: number; downPayment: number; months: number; monthlyPayment: number;
  installmentType: string; items: OrderItem[]; discountAmount?: number;
}
interface Company { header?: string; footer?: string; nameEn?: string; nameAr?: string; stamp?: string; }

export default function PrintOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [company, setCompany] = useState<Company>({});

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/orders/${id}`).then((r) => r.json()),
      fetch("/api/admin/company").then((r) => r.json()).catch(() => ({})),
    ]).then(([o, c]) => {
      setOrder(o);
      setCompany(c);
    });
  }, [id]);

  useEffect(() => {
    if (order) setTimeout(() => window.print(), 500);
  }, [order]);

  if (!order) return <div style={{ textAlign: "center", padding: 40 }}>جاري التحميل...</div>;

  const style = `
    html, body { background-color: white !important; background: white !important; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    thead { display: table-header-group; }
    tfoot { display: table-row-group; }
    .print-two-col td { width: 50%; }
    .installments-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; }
    .table-scroll { overflow-x: auto; }
    @media (max-width: 600px) {
      .print-two-col { display: block; }
      .print-two-col tr { display: block; }
      .print-two-col td { display: block; width: 100% !important; border-right: none !important; border-bottom: 1px solid #e5e7eb; }
      .installments-grid { grid-template-columns: 1fr; }
    }
    @media print {
      @page { size: A4; margin: 5mm; }
      html, body { background-color: white !important; background: white !important; }
      body { font-size: 9px !important; }
      td, th { padding: 2px 4px !important; }
      img[alt="header"] { width: 100% !important; height: auto !important; max-height: 120px !important; object-fit: contain; }
      img[alt="footer"] { width: 100% !important; height: auto !important; max-height: 90px !important; object-fit: contain; }
      .installments-section { margin-top: 8px !important; }
      p { margin: 0 !important; line-height: 1.4 !important; }
      div { padding: 0 !important; background-color: white !important; }
      table { margin-bottom: 6px !important; }
    }
  `;

  const discount = order.discountAmount ?? 0;
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const fin = { total: order.total, downPayment: order.downPayment, months: order.months, monthlyPayment: order.monthlyPayment };
  const date = new Date(order.createdAt).toLocaleDateString("en-GB");

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto", position: "relative", backgroundColor: "white", minHeight: "100vh", background: "white" }}>
      {company.stamp && (
        <img
          src={company.stamp}
          alt="stamp"
          style={{ position: "absolute", bottom: 450, left: 24, width: 180, opacity: 0.6, pointerEvents: "none", zIndex: 9999 }}
        />
      )}
      <style>{style}</style>
      {company.header && <img src={company.header} alt="header" style={{ width: "100%", marginBottom: 24 }} />}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
        <span>{date}</span>
        <span>No. #{order.orderId}</span>
      </div>

      <div className="table-scroll">
        <table className="print-two-col" style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", marginBottom: 16 }}>
          <tbody>
            <tr>
              <td style={{ padding: 12, borderRight: "2px solid black", fontSize: 13, lineHeight: 2 }}>
                <p style={{ margin: 0 }}>Dear Customer,</p>
                <p style={{ margin: 0 }}>Thank you for shopping with {company.nameEn || "Al Bilad"}.</p>
                <p style={{ margin: 0 }}>Your order has been placed.</p>
                <p style={{ margin: 0 }}>Below is the summary of the order.</p>
              </td>
              <td style={{ padding: 12, fontSize: 13, lineHeight: 2, textAlign: "right", direction: "rtl" }}>
                <p style={{ margin: 0 }}>عميلنا العزيز،</p>
                <p style={{ margin: 0 }}>شكرا لتسوقكم من {company.nameAr || "مؤسسة البلاد الحديثة"}.</p>
                <p style={{ margin: 0 }}>لقد تم إنشاء طلبكم بنجاح.</p>
                <p style={{ margin: 0 }}>فيما يلي ملخص الطلب.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="table-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", marginBottom: 16, fontSize: 13, minWidth: 400 }}>
          <thead>
            <tr style={{ backgroundColor: "#3b82f6", color: "white" }}>
              <th style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>اسم العميل</th>
              <th style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>رقم الجوال</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>العنوان</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb", fontWeight: 600 }}>{order.customer}</td>
              <td style={{ padding: "6px 8px", textAlign: "left", borderLeft: "1px solid #e5e7eb" }}>{order.whatsapp}</td>
              <td style={{ padding: "6px 8px", textAlign: "right" }}>{order.address}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: 8, fontSize: 14 }}>تفاصيل الفاتورة</div>

      <div className="table-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", marginBottom: 16, fontSize: 13, minWidth: 400 }}>
          <thead>
            <tr style={{ backgroundColor: "#3b82f6", color: "white" }}>
              <th style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>اسم الجهاز</th>
              <th style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>السعر</th>
              <th style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #60a5fa" }}>الكمية</th>
              <th style={{ padding: "6px 8px", textAlign: "right" }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: OrderItem, i: number) => (
              <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb", fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb" }}>{item.price.toFixed(2)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb" }}>{item.quantity}</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#eff6ff", fontWeight: "bold", borderTop: "2px solid black" }}>
              <td colSpan={3} style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb" }}>الإجمالي</td>
              <td style={{ padding: "6px 8px", textAlign: "right" }}>{fin.total.toFixed(2)} ريال</td>
            </tr>
            {discount > 0 && (
              <tr style={{ backgroundColor: "#f0fdf4", fontWeight: "bold" }}>
                <td colSpan={3} style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb", color: "#16a34a" }}>خصم مطبّق 🏷️</td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#16a34a" }}>- {discount.toFixed(2)} ريال</td>
              </tr>
            )}
            {order.installmentType === "installment" && (
              <tr style={{ backgroundColor: "#eff6ff", fontWeight: "bold" }}>
                <td colSpan={3} style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb" }}>الدفعة المقدمة</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{fin.downPayment.toFixed(2)} ريال</td>
              </tr>
            )}
            {order.installmentType === "installment" && (
              <tr style={{ backgroundColor: "#dbeafe", fontWeight: "bold" }}>
                <td colSpan={3} style={{ padding: "6px 8px", textAlign: "right", borderLeft: "1px solid #e5e7eb" }}>المتبقي</td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{(fin.total - fin.downPayment).toFixed(2)} ريال</td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      <div className="table-scroll">
        <table className="print-two-col" style={{ width: "100%", borderCollapse: "collapse", border: "2px solid black", fontSize: 13, marginBottom: 16 }}>
          <tbody>
            <tr>
              <td style={{ padding: 12, borderRight: "2px solid black", textAlign: "right", direction: "rtl", lineHeight: 2 }}>
                <p style={{ margin: 0 }}>سيتم اعتماد الطلب وشحنه بعد تسديد المبلغ المطلوب</p>
                <p style={{ margin: 0 }}>التوصيل مجاناً من خلال شركة. مندوب توصيل , خلال 24 ساعة من دفع الدفعة المقدمة</p>
              </td>
              <td style={{ padding: 12, textAlign: "right", direction: "rtl", lineHeight: 2 }}>
                <p style={{ margin: 0 }}>الرقم الضريبي : 314539044300003</p>
                <p style={{ margin: 0 }}>العرض شامل الهدايا</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {order.installmentType === "installment" && fin.months > 0 && (() => {
        const startDate = new Date(order.createdAt);
        startDate.setMonth(startDate.getMonth() + 1);
        const installments = Array.from({ length: fin.months }, (_, i) => {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + i);
          return { num: i + 1, amount: fin.monthlyPayment, date: d.toLocaleDateString("en-GB") };
        });
        const chunks: typeof installments[] = [];
        for (let i = 0; i < installments.length; i += 6) chunks.push(installments.slice(i, i + 6));
        return (
          <div className="installments-section" style={{ border: "2px solid #9ca3af", borderRadius: 8, padding: 12, backgroundColor: "#f3f4f6", marginTop: 16 }}>
            <div className="installments-grid">
              {chunks.map((chunk, ci) => (
                <table key={ci} style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #d1d5db", fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: "#3b82f6", color: "white" }}>
                      <th style={{ padding: "6px 8px", textAlign: "center", borderLeft: "1px solid #60a5fa" }}># الدفعة</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", borderLeft: "1px solid #60a5fa" }}>المبلغ</th>
                      <th style={{ padding: "6px 8px", textAlign: "center" }}>تاريخ الاستحقاق</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((inst) => (
                      <tr key={inst.num} style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "6px 8px", textAlign: "center", borderLeft: "1px solid #e5e7eb", fontWeight: 600 }}>{inst.num}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", borderLeft: "1px solid #e5e7eb" }}>{inst.amount.toFixed(2)}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center", direction: "ltr" }}>{inst.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </div>
          </div>
        );
      })()}

      {company.footer && <img src={company.footer} alt="footer" style={{ width: "100%", marginTop: 24 }} />}
    </div>
  );
}
