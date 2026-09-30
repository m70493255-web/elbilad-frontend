import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../../../admin/_lib";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const res = await fetch(`${getBackend()}/api/checkout/${id}/status`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
