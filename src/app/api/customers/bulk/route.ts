import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { customers } = await req.json() as {
    customers: { name: string; phone: string }[];
  };

  if (!Array.isArray(customers) || customers.length === 0) {
    return NextResponse.json({ error: "customers array required" }, { status: 400 });
  }

  const results = await Promise.allSettled(
    customers.map(({ name, phone }) =>
      prisma.customer.create({ data: { name: name.trim(), phone: phone.trim() } })
    )
  );

  const created = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  const newCustomers = results
    .filter((r): r is PromiseFulfilledResult<typeof r extends PromiseFulfilledResult<infer T> ? T : never> => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<{ id: number; name: string; phone: string; createdAt: Date }>).value);

  return NextResponse.json({ created, failed, customers: newCustomers });
}
