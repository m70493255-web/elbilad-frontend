import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${getBackend()}/api/admin/products/${id}`, forwardCookies(req, { method: "GET" }));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "خطأ في جلب بيانات المنتج" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const res = await fetch(`${getBackend()}/api/admin/products/${id}`, forwardCookies(req, {
      method: "PUT",
      body: formData,
    }));
    const data = await res.json();
    if (res.ok) {
      try {
        revalidateTag("products", "fetch");
      } catch { /* ignore */ }
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "خطأ في تعديل المنتج" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${getBackend()}/api/admin/products/${id}`, forwardCookies(req, { method: "DELETE" }));
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (res.ok) {
      try {
        revalidateTag("products", "fetch");
      } catch { /* ignore */ }
    }
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "خطأ في حذف المنتج" }, { status: 500 });
  }
}
