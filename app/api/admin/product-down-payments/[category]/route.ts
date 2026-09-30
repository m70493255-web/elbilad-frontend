import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

const BASE = "/api/admin/product-down-payments";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await params;
    const decoded = decodeURIComponent(category);
    const body = await req.json();
    const res = await fetch(`${getBackend()}${BASE}/${encodeURIComponent(decoded)}`, forwardCookies(req, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await params;
    const decoded = decodeURIComponent(category);
    const res = await fetch(`${getBackend()}${BASE}/${encodeURIComponent(decoded)}`, forwardCookies(req, { method: "DELETE" }));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
