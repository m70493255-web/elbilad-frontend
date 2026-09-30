import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

const BACKEND_PATH = "/api/admin/down-payments";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${getBackend()}${BACKEND_PATH}`, forwardCookies(req, {}));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${getBackend()}${BACKEND_PATH}`, forwardCookies(req, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

