import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/admin/reviews/${id}/toggle`, forwardCookies(req, { method: "PATCH" }));
  const data = await res.json();
  if (res.ok) {
    try {
      revalidateTag("reviews", "max");
      revalidatePath("/");
    } catch {}
  }
  return NextResponse.json(data, { status: res.status });
}

