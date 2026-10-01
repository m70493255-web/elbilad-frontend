import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../_lib";

export async function POST(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/company/footer-items/add`, forwardCookies(req, {
    method: "POST",
  }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
