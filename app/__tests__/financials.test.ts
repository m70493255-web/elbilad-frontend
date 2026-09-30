/**
 * Financial Logic Tests
 * يغطي: الدفعة الأولى، الخصم، القسط الشهري، جدول الأقساط، totalPrice
 */

const DISCOUNT_VALUE = 100;

// ─── نفس المنطق الموجود في PaymentForm ───────────────────────────────────────

function getAvailableDownOptions(amounts: number[], finalTotal: number) {
  return amounts.filter((a) => a < finalTotal);
}

function getEffectiveDownPayment(availableAmounts: number[], selected: number): number {
  return availableAmounts.includes(selected) ? selected : availableAmounts[0] ?? 0;
}

function calcMonthly(
  finalTotal: number,
  downPayment: number,
  months: number,
  type: "full" | "installment"
): number {
  if (type === "full") return 0;
  const rem = finalTotal - downPayment;
  return rem > 0 ? Math.ceil(rem / months) : 0;
}

function calcFinalTotal(total: number, discountApplied: boolean): number {
  return discountApplied ? total - DISCOUNT_VALUE : total;
}

// ─── نفس المنطق الموجود في cartStore ─────────────────────────────────────────

interface CartItem {
  price: number;
  salePrice?: number;
  originalPrice?: number;
  qty: number;
}

function calcTotalPrice(items: CartItem[]): number {
  return items.reduce(
    (sum, i) => sum + (i.salePrice ?? i.originalPrice ?? i.price) * i.qty,
    0
  );
}

// ─────────────────────────────────────────────────────────────────────────────

describe("الدفعة الأولى - الخيارات المتاحة", () => {
  const amounts = [1000, 1500, 2000, 3000, 50000];

  test("تظهر كل الدفعات الأقل من الإجمالي", () => {
    expect(getAvailableDownOptions(amounts, 100000)).toEqual([1000, 1500, 2000, 3000, 50000]);
  });

  test("لا تظهر دفعة تساوي الإجمالي", () => {
    expect(getAvailableDownOptions(amounts, 50000)).toEqual([1000, 1500, 2000, 3000]);
  });

  test("لا تظهر دفعة أكبر من الإجمالي", () => {
    expect(getAvailableDownOptions(amounts, 1200)).toEqual([1000]);
  });

  test("لا توجد خيارات لو الإجمالي أقل من أصغر دفعة", () => {
    expect(getAvailableDownOptions(amounts, 500)).toEqual([]);
  });

  test("بعد الخصم تختفي الدفعات الأكبر من الإجمالي الجديد", () => {
    const finalTotal = calcFinalTotal(1050, true); // 950
    expect(getAvailableDownOptions(amounts, finalTotal)).toEqual([]);
  });
});

describe("الدفعة الأولى - الاختيار الفعلي", () => {
  const available = [1000, 1500, 2000];

  test("يرجع الدفعة المختارة لو موجودة", () => {
    expect(getEffectiveDownPayment(available, 1500)).toBe(1500);
  });

  test("يرجع أول دفعة لو المختارة مش موجودة", () => {
    expect(getEffectiveDownPayment(available, 3000)).toBe(1000);
  });

  test("يرجع 0 لو مفيش خيارات", () => {
    expect(getEffectiveDownPayment([], 1000)).toBe(0);
  });
});

describe("القسط الشهري", () => {
  test("كاش كامل = 0", () => {
    expect(calcMonthly(5000, 1000, 12, "full")).toBe(0);
  });

  test("(5000 - 1000) / 12 = 334 (ceil)", () => {
    expect(calcMonthly(5000, 1000, 12, "installment")).toBe(334);
  });

  test("(10000 - 2000) / 24 = 334 (ceil)", () => {
    expect(calcMonthly(10000, 2000, 24, "installment")).toBe(334);
  });

  test("(7500 - 1500) / 6 = 1000", () => {
    expect(calcMonthly(7500, 1500, 6, "installment")).toBe(1000);
  });

  test("يرجع 0 لو الدفعة الأولى أكبر من الإجمالي", () => {
    expect(calcMonthly(500, 1000, 12, "installment")).toBe(0);
  });

  test("ceil: (10001 - 1000) / 12 = 750.08 → 751", () => {
    expect(calcMonthly(10001, 1000, 12, "installment")).toBe(751);
  });
});

describe("الخصم", () => {
  test("بدون خصم: الإجمالي ثابت", () => {
    expect(calcFinalTotal(5000, false)).toBe(5000);
  });

  test("مع خصم: ينقص 100", () => {
    expect(calcFinalTotal(5000, true)).toBe(4900);
  });

  test("الخصم يأثر على القسط الشهري", () => {
    const finalTotal = calcFinalTotal(5000, true); // 4900
    // ceil((4900 - 1000) / 12) = ceil(325) = 325
    expect(calcMonthly(finalTotal, 1000, 12, "installment")).toBe(325);
  });

  test("الخصم يأثر على الدفعات المتاحة", () => {
    const finalTotal = calcFinalTotal(1050, true); // 950
    expect(getAvailableDownOptions([1000, 1500, 2000], finalTotal)).toEqual([]);
  });
});

describe("جدول الأقساط", () => {
  function buildSchedule(monthly: number, months: number) {
    const now = new Date(2025, 0, 15); // 15 يناير 2025 ثابت
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, now.getDate());
      return { index: i + 1, amount: monthly, month: d.getMonth() + 1 };
    });
  }

  test("عدد الأقساط يساوي عدد الأشهر", () => {
    expect(buildSchedule(500, 12)).toHaveLength(12);
    expect(buildSchedule(500, 24)).toHaveLength(24);
  });

  test("كل قسط بنفس المبلغ", () => {
    const schedule = buildSchedule(334, 12);
    expect(schedule.every((r) => r.amount === 334)).toBe(true);
  });

  test("أول قسط في الشهر التالي (فبراير)", () => {
    const schedule = buildSchedule(500, 6);
    expect(schedule[0].month).toBe(2);
  });

  test("مجموع الأقساط + الدفعة الأولى >= الإجمالي وفرق الـ ceil أقل من عدد الأشهر", () => {
    const total = 10000;
    const down = 1000;
    const months = 12;
    const monthly = calcMonthly(total, down, months, "installment");
    const scheduleTotal = monthly * months + down;
    expect(scheduleTotal).toBeGreaterThanOrEqual(total);
    expect(scheduleTotal - total).toBeLessThan(months);
  });
});

describe("totalPrice في السلة", () => {
  test("منتج واحد بسعر عادي", () => {
    expect(calcTotalPrice([{ price: 1000, qty: 1 }])).toBe(1000);
  });

  test("منتج بسعر مخفض (salePrice)", () => {
    expect(calcTotalPrice([{ price: 2000, salePrice: 1500, qty: 1 }])).toBe(1500);
  });

  test("منتج بـ originalPrice بدون salePrice", () => {
    expect(calcTotalPrice([{ price: 0, originalPrice: 1800, qty: 1 }])).toBe(1800);
  });

  test("أولوية: salePrice > originalPrice > price", () => {
    expect(calcTotalPrice([{ price: 500, originalPrice: 800, salePrice: 600, qty: 1 }])).toBe(600);
  });

  test("كمية أكثر من 1", () => {
    expect(calcTotalPrice([{ price: 1000, qty: 3 }])).toBe(3000);
  });

  test("منتجات متعددة", () => {
    expect(
      calcTotalPrice([
        { price: 1000, qty: 2 },
        { price: 500, salePrice: 400, qty: 1 },
      ])
    ).toBe(2400);
  });

  test("سلة فاضية = 0", () => {
    expect(calcTotalPrice([])).toBe(0);
  });
});
