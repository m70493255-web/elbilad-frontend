import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "res.cloudinary.com";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("missing url", { status: 400 });

  // منع SSRF — يسمح فقط بـ Cloudinary
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("invalid url", { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const fetchUrl = url
    .replace("/image/upload/", "/raw/upload/")
    .replace(/\/fl_attachment:[^/]+\//, "/");

  const res = await fetch(fetchUrl);
  if (!res.ok) return new NextResponse("failed", { status: res.status });

  const contentType = res.headers.get("content-type") || "application/pdf";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
    },
  });
}
