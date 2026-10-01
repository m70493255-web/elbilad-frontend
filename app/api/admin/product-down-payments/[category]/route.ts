import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export const dynamic = "force-dynamic";

const BASE = "/api/admin/product-down-payments";

function safeDecode(val: string): string {
  try {
    return decodeURIComponent(val);
  } catch {
    return val;
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await params;
    const decoded = safeDecode(category);
    const body = await req.json();
    const res = await fetch(`${getBackend()}${BASE}/${encodeURIComponent(decoded)}`, forwardCookies(req, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    }));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    console.error("PUT /api/admin/product-down-payments/[category] error:", e.message);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await params;
    const decoded = safeDecode(category);
    const res = await fetch(`${getBackend()}${BASE}/${encodeURIComponent(decoded)}`, forwardCookies(req, {
      method: "DELETE",
      cache: "no-store",
    }));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    console.error("DELETE /api/admin/product-down-payments/[category] error:", e.message);
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
