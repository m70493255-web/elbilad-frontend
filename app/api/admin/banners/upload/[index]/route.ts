import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  const formData = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/banners/upload/${index}`, forwardCookies(req, {
    method: "POST",
    body: formData,
  }));
  const data = await res.json();
  if (res.ok) { revalidateTag("banners", "fetch"); revalidatePath("/"); }
  return NextResponse.json(data, { status: res.status });
}
