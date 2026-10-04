import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

// Admin GET: returns ALL banners (including inactive/empty) — requires auth
export async function GET(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/banners/all`, forwardCookies(req, {}));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
