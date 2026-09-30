import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const tag = req.nextUrl.searchParams.get("tag") || "products";
  revalidateTag(tag, "max");
  // Cascade revalidation for related tags
  if (tag === "home-settings") {
    revalidatePath("/");
  }
  if (tag === "banners") {
    revalidatePath("/");
  }
  if (tag === "company") {
    revalidatePath("/", "layout");
  }
  if (tag === "reviews") {
    revalidatePath("/");
  }
  return NextResponse.json({ revalidated: true, tag });
}
