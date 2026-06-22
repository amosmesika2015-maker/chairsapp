import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const allowed = ["name", "slug", "order"] as const;
  const data = Object.fromEntries(
    allowed.filter((k) => body[k] !== undefined).map((k) => [k, body[k]])
  );

  const category = await prisma.category.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
