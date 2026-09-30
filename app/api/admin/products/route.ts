import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

export async function GET(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/products`, forwardCookies(req, { method: "GET" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/products`, forwardCookies(req, {
    method: "POST",
    body: formData,
  }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
