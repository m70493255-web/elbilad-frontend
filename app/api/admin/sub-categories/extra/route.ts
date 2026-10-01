import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/sub-categories/extra`, forwardCookies(req, { cache: "no-store" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
