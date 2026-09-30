import { NextRequest, NextResponse } from "next/server";
import { getBackend, getAdminToken } from "../_lib";

export async function GET(req: NextRequest) {
  try {
    const token = getAdminToken(req);
    const searchParams = req.nextUrl.searchParams.toString();
    const url = `${getBackend()}/api/admin/orders${searchParams ? `?${searchParams}` : ""}`;
    const res = await fetch(url, {
      headers: { cookie: `admin_token=${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Backend returned ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("GET /api/admin/orders failed:", e.message);
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
