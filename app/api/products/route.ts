import { NextRequest, NextResponse } from "next/server";
import { searchCachedProducts } from "../../lib/products-cache";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const brand = req.nextUrl.searchParams.get("brand") || "";
  const data = await searchCachedProducts(q, brand || undefined);
  return NextResponse.json(data);
}
