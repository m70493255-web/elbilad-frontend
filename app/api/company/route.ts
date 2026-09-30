import { NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

export async function GET() {
  const res = await fetch(`${getBackend()}/api/admin/company`, {
    next: { revalidate: 3600, tags: ["company"] },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
