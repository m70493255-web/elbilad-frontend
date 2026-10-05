import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  const res = await fetch(`${getBackend()}/api/admin/company/footer-items/${index}`, forwardCookies(req, {
    method: "DELETE",
  }));
  const data = await res.json();
  if (res.ok) {
    try {
      revalidateTag("company", "max");
      revalidatePath("/", "layout");
    } catch {}
  }
  return NextResponse.json(data, { status: res.status });
}

