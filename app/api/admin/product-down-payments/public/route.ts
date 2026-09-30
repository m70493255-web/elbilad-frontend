import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../../_lib";

export async function GET(req: NextRequest) {
  try {
    const categories = req.nextUrl.searchParams.get("categories") || "";
    const res = await fetch(`${getBackend()}/api/admin/product-down-payments/public?categories=${encodeURIComponent(categories)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({}, { status: 503 });
  }
}
