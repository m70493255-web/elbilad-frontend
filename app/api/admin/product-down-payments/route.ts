import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

const BASE = "/api/admin/product-down-payments";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${getBackend()}${BASE}`, forwardCookies(req, {}));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
