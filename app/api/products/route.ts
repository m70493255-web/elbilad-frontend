import { NextRequest, NextResponse } from "next/server";
import { searchCachedProducts } from "../../lib/products-cache";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const brand = req.nextUrl.searchParams.get("brand") || "";

  if (!q && !brand) {
    return NextResponse.json([], {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }

  const data = await searchCachedProducts(q, brand || undefined);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
