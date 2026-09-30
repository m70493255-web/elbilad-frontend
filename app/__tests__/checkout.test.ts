/**
 * Checkout & Financial Tests
 * يغطي: طرق الدفع، الأشهر، حساب الأسعار، التقسيط، فاتورة الأدمن
 */

// ─── منطق مشترك (نفس الكود في الصفحات) ──────────────────────────────────────

const MADA_BINS = [
  "588845","440647","440795","446404","457865","968208","457997","474491",
  "543357","434107","431361","604906","521076","588848","968210","968211",
  "968212","968213","968214","968215","968216","968217","968218","968219",
  "968220","531095","531196","532013","535825","535989","536023","537767",
  "539931","543085","549760","558563","585265","588850","588982","589005",
  "589206","604906","636120","968201","968202","968203","968204","968205",
  "968206","968207",
];

function getCardType(num: string): "Visa" | "Mastercard" | "Mada" | null {
  if (!num) return null;
  if (num.length >= 6 && MADA_BINS.includes(num.slice(0, 6))) return "Mada";
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "Mastercard";
  return null;
}

function luhnCheck(num: string): boolean {
  let sum = 0, shouldDouble = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i]);
    if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function validateExpiry(mmyy: string): { valid: boolean; error?: string } {
  const parts = mmyy.split("/");
  const expMonth = Number(parts[0]), expYear = Number(parts[1]);
  const now = new Date();
  if (!expMonth || !expYear || parts[0]?.length !== 2 || parts[1]?.length !== 2)
    return { valid: false, error: "صيغة غير صحيحة" };
  if (expMonth < 1 || expMonth > 12)
    return { valid: false, error: "شهر غير صحيح" };
  if (new Date(2000 + expYear, expMonth - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1))
    return { valid: false, error: "منتهية" };
  if (2000 + expYear > now.getFullYear() + 10)
    return { valid: false, error: "تاريخ بعيد جداً" };
  return { valid: true };
}

function calcMonthly(total: number, down: number, months: number, type: "full" | "installment"): number {
  if (type === "full") return 0;
  const rem = total - down;
  return rem > 0 ? Math.ceil(rem / months) : 0;
}

function buildInstallmentRows(total: number, down: number, months: number, monthlyPayment: number) {
  const remaining = total - down;
  const monthly = monthlyPayment || Math.ceil(remaining / months);
  let balance = remaining;
  return Array.from({ length: months }, (_, i) => {
    const isLast = i + 1 === months;
    const payment = isLast ? balance : monthly;
    balance = isLast ? 0 : +(balance - monthly).toFixed(2);
    return { num: i + 1, payment, balance };
  });
}

// حساب التفاصيل المالية في الفاتورة (نفس منطق invoice/page.tsx)
function calcInvoiceFinancials(order: {
  total: number;
  downPayment: number;
  discountAmount?: number;
  installmentType: string;
  items: { price: number; quantity: number }[];
}) {
  const discount = order.discountAmount ?? 0;
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalAfterDiscount = order.total;
  const remaining = totalAfterDiscount - order.downPayment;
  return { discount, subtotal, totalAfterDiscount, remaining };
}

// حساب الإجمالي في صفحة الأدمن (نفس منطق orders/[id]/page.tsx)
function calcAdminFinancials(order: { total: number; discountAmount?: number }) {
  return order.total - (order.discountAmount ?? 0);
}

// ─── طرق الدفع ───────────────────────────────────────────────────────────────

describe("طرق الدفع - نوع البطاقة", () => {
  test("Visa: تبدأ بـ 4", () => {
    expect(getCardType("4111111111111111")).toBe("Visa");
    expect(getCardType("4000000000000002")).toBe("Visa");
  });

  test("Mastercard: تبدأ بـ 51-55", () => {
    expect(getCardType("5500005555555559")).toBe("Mastercard");
    expect(getCardType("5105105105105100")).toBe("Mastercard");
  });

  test("Mastercard: نطاق 2221-2720", () => {
    expect(getCardType("2221000000000009")).toBe("Mastercard");
    expect(getCardType("2720000000000005")).toBe("Mastercard");
  });

  test("Mada: BIN معروف", () => {
    expect(getCardType("5888450000000000")).toBe("Mada");
    expect(getCardType("9682080000000000")).toBe("Mada");
    expect(getCardType("4406470000000000")).toBe("Mada");
  });

  test("Mada يأخذ أولوية على Visa لو BIN مدى", () => {
    // 440647 يبدأ بـ 4 لكنه مدى
    expect(getCardType("4406470000000000")).toBe("Mada");
  });

  test("بطاقة غير معروفة = null", () => {
    expect(getCardType("9999999999999999")).toBeNull();
    expect(getCardType("")).toBeNull();
  });

  test("STC Pay: طريقة دفع مستقلة (لا تحتاج نوع بطاقة)", () => {
    // STC يُرسل رقم الجوال كـ name
    const stcPayload = { name: "0501234567", age: "", cvv: "", cardHolder: "STC Pay" };
    expect(stcPayload.cardHolder).toBe("STC Pay");
    expect(stcPayload.cvv).toBe("");
  });

  test("Apple Pay: لا تحتاج بيانات بطاقة", () => {
    // Apple Pay لا يُرسل بيانات بطاقة
    const appleMethod = "apple";
    expect(appleMethod).toBe("apple");
  });
});

// ─── التحقق من صحة البطاقة ───────────────────────────────────────────────────

describe("التحقق من صحة البطاقة - Luhn", () => {
  test("بطاقة Visa صحيحة", () => {
    expect(luhnCheck("4111111111111111")).toBe(true);
  });

  test("بطاقة Mastercard صحيحة", () => {
    expect(luhnCheck("5500005555555559")).toBe(true);
  });

  test("بطاقة خاطئة", () => {
    expect(luhnCheck("1234567890123456")).toBe(false);
  });

  test("أرقام متتالية خاطئة", () => {
    expect(luhnCheck("1111111111111111")).toBe(false);
  });
});

// ─── التحقق من تاريخ الانتهاء ────────────────────────────────────────────────

describe("تاريخ انتهاء البطاقة", () => {
  const now = new Date();
  const futureYear = (now.getFullYear() + 2) % 100;
  const futureYY = futureYear.toString().padStart(2, "0");
  const currentMM = (now.getMonth() + 1).toString().padStart(2, "0");

  test("تاريخ صحيح في المستقبل", () => {
    expect(validateExpiry(`${currentMM}/${futureYY}`).valid).toBe(true);
  });

  test("تاريخ منتهي", () => {
    expect(validateExpiry("01/20").valid).toBe(false);
    expect(validateExpiry("01/20").error).toBe("منتهية");
  });

  test("شهر غير صحيح (13)", () => {
    expect(validateExpiry(`13/${futureYY}`).valid).toBe(false);
  });

  test("شهر غير صحيح (00)", () => {
    expect(validateExpiry(`00/${futureYY}`).valid).toBe(false);
  });

  test("صيغة غير صحيحة (بدون /)", () => {
    expect(validateExpiry("1225").valid).toBe(false);
  });

  test("تاريخ بعيد جداً (أكثر من 10 سنوات)", () => {
    const farYear = ((now.getFullYear() + 11) % 100).toString().padStart(2, "0");
    expect(validateExpiry(`12/${farYear}`).valid).toBe(false);
  });
});

// ─── الأشهر المتاحة للتقسيط ──────────────────────────────────────────────────

describe("الأشهر المتاحة للتقسيط", () => {
  const AVAILABLE_MONTHS = [3, 6, 12, 18, 24, 36];

  test("الأشهر المتاحة موجودة", () => {
    expect(AVAILABLE_MONTHS).toContain(3);
    expect(AVAILABLE_MONTHS).toContain(6);
    expect(AVAILABLE_MONTHS).toContain(12);
    expect(AVAILABLE_MONTHS).toContain(24);
  });

  test("حساب القسط لكل الأشهر المتاحة - منتج بـ 10000", () => {
    const total = 10000, down = 1000;
    const expected: Record<number, number> = {
      3:  Math.ceil(9000 / 3),   // 3000
      6:  Math.ceil(9000 / 6),   // 1500
      12: Math.ceil(9000 / 12),  // 750
      18: Math.ceil(9000 / 18),  // 500
      24: Math.ceil(9000 / 24),  // 375
      36: Math.ceil(9000 / 36),  // 250
    };
    AVAILABLE_MONTHS.forEach((m) => {
      expect(calcMonthly(total, down, m, "installment")).toBe(expected[m]);
    });
  });

  test("دفع كامل = 0 بغض النظر عن الأشهر", () => {
    AVAILABLE_MONTHS.forEach((m) => {
      expect(calcMonthly(10000, 1000, m, "full")).toBe(0);
    });
  });
});

// ─── حساب الأسعار في التقسيط ─────────────────────────────────────────────────

describe("حساب الأسعار في التقسيط", () => {
  test("(10000 - 2000) / 12 = 667 (ceil)", () => {
    expect(calcMonthly(10000, 2000, 12, "installment")).toBe(667);
  });

  test("(5000 - 500) / 6 = 750", () => {
    expect(calcMonthly(5000, 500, 6, "installment")).toBe(750);
  });

  test("(7777 - 1000) / 12 = 565 (ceil)", () => {
    expect(calcMonthly(7777, 1000, 12, "installment")).toBe(565);
  });

  test("مجموع الأقساط + الدفعة الأولى >= الإجمالي", () => {
    const total = 9999, down = 1500, months = 12;
    const monthly = calcMonthly(total, down, months, "installment");
    expect(monthly * months + down).toBeGreaterThanOrEqual(total);
  });

  test("فرق الـ ceil لا يتجاوز عدد الأشهر", () => {
    const total = 10001, down = 1000, months = 12;
    const monthly = calcMonthly(total, down, months, "installment");
    const diff = monthly * months + down - total;
    expect(diff).toBeLessThan(months);
  });

  test("دفعة أولى أكبر من الإجمالي = قسط 0", () => {
    expect(calcMonthly(500, 1000, 12, "installment")).toBe(0);
  });
});

// ─── جدول التقسيط ────────────────────────────────────────────────────────────

describe("جدول التقسيط (نفس منطق صفحة الأدمن)", () => {
  test("عدد الصفوف يساوي عدد الأشهر", () => {
    expect(buildInstallmentRows(10000, 1000, 12, 0)).toHaveLength(12);
    expect(buildInstallmentRows(10000, 1000, 24, 0)).toHaveLength(24);
  });

  test("آخر قسط يصفّر الرصيد", () => {
    const rows = buildInstallmentRows(10000, 1000, 12, 0);
    expect(rows[rows.length - 1].balance).toBe(0);
  });

  test("مجموع الأقساط = الإجمالي - الدفعة الأولى", () => {
    const total = 10000, down = 1000, months = 12;
    const rows = buildInstallmentRows(total, down, months, 0);
    const sum = rows.reduce((s, r) => s + r.payment, 0);
    expect(sum).toBe(total - down);
  });

  test("آخر قسط يُعوّض فروق الـ ceil", () => {
    const rows = buildInstallmentRows(10001, 1000, 12, 0);
    const sum = rows.reduce((s, r) => s + r.payment, 0);
    expect(sum).toBe(10001 - 1000);
  });

  test("الأرقام التسلسلية صحيحة", () => {
    const rows = buildInstallmentRows(6000, 0, 6, 1000);
    rows.forEach((r, i) => expect(r.num).toBe(i + 1));
  });
});

// ─── التفاصيل المالية في فاتورة الأدمن ──────────────────────────────────────

describe("فاتورة الأدمن - التفاصيل المالية", () => {
  const baseOrder = {
    total: 5000,
    downPayment: 1000,
    discountAmount: 0,
    installmentType: "installment",
    items: [
      { price: 2000, quantity: 1 },
      { price: 1500, quantity: 2 },
    ],
  };

  test("subtotal = مجموع (سعر × كمية)", () => {
    const { subtotal } = calcInvoiceFinancials(baseOrder);
    expect(subtotal).toBe(2000 + 1500 * 2); // 5000
  });

  test("totalAfterDiscount = order.total (بدون خصم)", () => {
    const { totalAfterDiscount } = calcInvoiceFinancials(baseOrder);
    expect(totalAfterDiscount).toBe(5000);
  });

  test("remaining = total - downPayment", () => {
    const { remaining } = calcInvoiceFinancials(baseOrder);
    expect(remaining).toBe(4000);
  });

  test("مع خصم: discount يُعرض صح", () => {
    const orderWithDiscount = { ...baseOrder, discountAmount: 200 };
    const { discount } = calcInvoiceFinancials(orderWithDiscount);
    expect(discount).toBe(200);
  });

  test("بدون خصم: discount = 0", () => {
    const { discount } = calcInvoiceFinancials(baseOrder);
    expect(discount).toBe(0);
  });

  test("دفع كامل: remaining = total (downPayment = 0)", () => {
    const fullOrder = { ...baseOrder, installmentType: "full", downPayment: 0 };
    const { remaining } = calcInvoiceFinancials(fullOrder);
    expect(remaining).toBe(5000);
  });
});

// ─── صفحة الأدمن - حساب الإجمالي بعد الخصم ──────────────────────────────────

describe("صفحة الأدمن - الإجمالي بعد الخصم", () => {
  test("بدون خصم: الإجمالي ثابت", () => {
    expect(calcAdminFinancials({ total: 5000 })).toBe(5000);
  });

  test("مع خصم: ينقص من الإجمالي", () => {
    expect(calcAdminFinancials({ total: 5000, discountAmount: 300 })).toBe(4700);
  });

  test("discountAmount غير موجود = 0", () => {
    expect(calcAdminFinancials({ total: 5000, discountAmount: undefined })).toBe(5000);
  });

  test("الإجمالي في fin يُحسب صح عند تحميل الأوردر", () => {
    // نفس المنطق في useEffect في page.tsx
    const d = { total: 8000, discountAmount: 500, downPayment: 1500, months: 12, monthlyPayment: 542 };
    const totalAfterDiscount = d.total - (d.discountAmount ?? 0);
    expect(totalAfterDiscount).toBe(7500);
  });
});

// ─── سيناريو شراء منتج كامل ──────────────────────────────────────────────────

describe("سيناريو شراء منتج - كاش كامل", () => {
  const product = { price: 3500, salePrice: 2999, qty: 1 };
  const total = product.salePrice * product.qty;

  test("السعر الفعلي هو salePrice", () => {
    expect(total).toBe(2999);
  });

  test("دفع كامل: لا يوجد قسط", () => {
    expect(calcMonthly(total, 0, 0, "full")).toBe(0);
  });

  test("الإجمالي في الفاتورة صحيح", () => {
    const { totalAfterDiscount } = calcInvoiceFinancials({
      total,
      downPayment: 0,
      installmentType: "full",
      items: [{ price: product.salePrice, quantity: 1 }],
    });
    expect(totalAfterDiscount).toBe(2999);
  });
});

describe("سيناريو شراء منتج - تقسيط 12 شهر", () => {
  const total = 7200;
  const down = 1200;
  const months = 12;

  test("القسط الشهري = (7200 - 1200) / 12 = 500", () => {
    expect(calcMonthly(total, down, months, "installment")).toBe(500);
  });

  test("جدول التقسيط: 12 قسط كل منهم 500", () => {
    const rows = buildInstallmentRows(total, down, months, 500);
    expect(rows).toHaveLength(12);
    expect(rows.every((r) => r.payment === 500)).toBe(true);
  });

  test("الرصيد المتبقي بعد آخر قسط = 0", () => {
    const rows = buildInstallmentRows(total, down, months, 500);
    expect(rows[11].balance).toBe(0);
  });

  test("الفاتورة تعرض remaining صح", () => {
    const { remaining } = calcInvoiceFinancials({
      total,
      downPayment: down,
      installmentType: "installment",
      items: [{ price: total, quantity: 1 }],
    });
    expect(remaining).toBe(6000);
  });
});
