import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body?.message;
  if (!message) return NextResponse.json({ ok: true });

  const fromChatId = message.chat?.id?.toString();
  const text = message.text;
  const fromName = message.from?.first_name ?? "مجهول";

  // إذا لم يكن هناك نص (صورة، ملف، إلخ) نتجاهل
  if (!text) return NextResponse.json({ ok: true });

  // نُرسل لجميع الموظفين ما عدا المُرسِل (Telegram يعرض رسالته له تلقائياً)
  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id && id !== fromChatId);

  await Promise.allSettled(
    chatIds.map((chat_id) =>
      fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id,
            text: `📨 رسالة من ${fromName}:\n${text}`,
            parse_mode: "HTML",
          }),
        }
      )
    )
  );

  return NextResponse.json({ ok: true });
}
