import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/sub-categories`, forwardCookies(req, { cache: "no-store" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/sub-categories`, forwardCookies(req, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    try {
      revalidateTag("home-settings", "max");
      revalidateTag("products", "max");
      revalidatePath("/");
    } catch {}
  }
  return NextResponse.json(data, { status: res.status });
}

