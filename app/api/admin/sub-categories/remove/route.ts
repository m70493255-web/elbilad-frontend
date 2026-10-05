import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../_lib";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/sub-categories/remove`, forwardCookies(req, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  const data = await res.json();
  if (res.ok) {
    try {
      revalidateTag("home-settings", "max");
      revalidateTag("products", "max");
      revalidatePath("/");
    } catch {}
  }
  return NextResponse.json(data, { status: res.status });
}

