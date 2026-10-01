import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.search || "";
    const res = await fetch(`${getBackend()}/api/admin/products${search}`, forwardCookies(req, { method: "GET" }));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "خطأ في الاتصال بالخادم" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${getBackend()}/api/admin/products`, forwardCookies(req, {
      method: "POST",
      body: formData,
    }));
    const data = await res.json();
    if (res.ok) {
      try {
        revalidateTag("products", "fetch");
      } catch { /* ignore in non-cache contexts */ }
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "خطأ في الاتصال بالخادم" }, { status: 500 });
  }
}
