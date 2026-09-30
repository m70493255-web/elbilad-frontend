import { NextRequest, NextResponse } from "next/server";
import { getBackend, getAdminToken } from "../../_lib";

async function safeJson(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { ok: res.ok }; }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getAdminToken(req);
  const res = await fetch(`${getBackend()}/api/admin/orders/${id}`, {
    headers: { cookie: `admin_token=${token}` },
  });
  return NextResponse.json(await safeJson(res), { status: res.status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getAdminToken(req);
  const body = await req.json();
  const endpoint = body.financials ? "financials" : "status";
  const res = await fetch(`${getBackend()}/api/checkout/${id}/${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie: `admin_token=${token}` },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await safeJson(res), { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getAdminToken(req);
  const res = await fetch(`${getBackend()}/api/admin/orders/${id}`, {
    method: "DELETE",
    headers: { cookie: `admin_token=${token}` },
  });
  return NextResponse.json(await safeJson(res), { status: res.status });
}
