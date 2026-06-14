import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, phone } = await req.json();
  const customer = await prisma.customer.update({
    where: { id: Number(id) },
    data: { name, phone },
  });
  return NextResponse.json(customer);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.customer.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
