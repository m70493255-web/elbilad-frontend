import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${getBackend()}/api/admin/categories`, forwardCookies(req, { method: "GET" }));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "فشل جلب التصنيفات" }, { status: 500 });
  }
}
