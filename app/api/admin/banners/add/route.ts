import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../_lib";

export async function POST(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/banners/add`, forwardCookies(req, { method: "POST" }));
  const data = await res.json();
  if (res.ok) { revalidateTag("banners", "fetch"); revalidatePath("/"); }
  return NextResponse.json(data, { status: res.status });
}
