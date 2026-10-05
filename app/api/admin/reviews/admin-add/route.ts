import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../_lib";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/reviews/admin-add`, forwardCookies(req, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  const data = await res.json();
  if (res.ok) {
    try {
      revalidateTag("reviews", "max");
      revalidatePath("/");
    } catch {}
  }
  return NextResponse.json(data, { status: res.status });
}

