import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

export const dynamic = "force-dynamic";

const BASE = "/api/admin/product-down-payments";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${getBackend()}${BASE}`, forwardCookies(req, {
      cache: "no-store",
    }));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
