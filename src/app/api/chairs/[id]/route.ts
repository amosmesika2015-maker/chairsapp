import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const allowed = ["name", "price", "imageUrl", "description", "details", "order", "isVisible", "status", "sku", "categoryId"];
    const data = Object.fromEntries(
      Object.entries(body).filter(([k, v]) => allowed.includes(k) && v !== undefined)
    );
    const chair = await prisma.chair.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(chair);
  } catch (err) {
    console.error("PUT /api/chairs/[id] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.chair.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/chairs/[id] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
