import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const { name, phone } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: "name and phone required" }, { status: 400 });
  }
  const customer = await prisma.customer.create({ data: { name, phone } });
  return NextResponse.json(customer);
}
