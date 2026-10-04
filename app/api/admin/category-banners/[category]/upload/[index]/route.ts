import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ category: string; index: string }> }) {
  const { category, index } = await params;
  const body = await req.formData();
  const res = await fetch(
    `${getBackend()}/api/admin/category-banners/${encodeURIComponent(category)}/upload/${index}`,
    forwardCookies(req, { method: "POST", body }),
  );
  const data = await res.json();
  if (res.ok) {
    revalidateTag("category-banners", "max");
    revalidatePath("/");
  }
  return NextResponse.json(data, { status: res.status });
}
