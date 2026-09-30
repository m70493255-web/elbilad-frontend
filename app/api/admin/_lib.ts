import { NextRequest } from "next/server";

export function getBackend(): string {
  return (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
}

export function getAdminToken(req: NextRequest): string {
  // Try cookie header first
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/);
  if (match) return match[1];
  // Fallback: Next.js parsed cookies
  return req.cookies.get("admin_token")?.value || "";
}

export function forwardCookies(req: NextRequest, init: RequestInit): RequestInit {
  const token = getAdminToken(req);
  const existing = init.headers as Record<string, string> | undefined;
  return {
    ...init,
    headers: { ...existing, ...(token ? { cookie: `admin_token=${token}` } : {}) },
  };
}
