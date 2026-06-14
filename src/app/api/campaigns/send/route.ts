import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: Request) {
  const { customerIds, baseUrl } = await req.json();
  if (!customerIds?.length) {
    return NextResponse.json({ error: "customerIds required" }, { status: 400 });
  }

  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds.map(Number) } },
  });

  const results = [];
  for (const customer of customers) {
    let token = generateToken();
    // ensure uniqueness
    while (await prisma.campaignLink.findUnique({ where: { token } })) {
      token = generateToken();
    }

    await prisma.campaignLink.create({
      data: { customerId: customer.id, token },
    });

    const catalogUrl = `${baseUrl}?t=${token}`;
    const message = encodeURIComponent(
      `שלום ${customer.name}! 👋\n\nהכנו עבורך קטלוג הכיסאות שלנו:\n🔗 ${catalogUrl}\n\nצפה בכיסאות ואם יש שאלות אנחנו כאן!`
    );
    const whatsappUrl = `https://wa.me/${customer.phone}?text=${message}`;

    results.push({ customerId: customer.id, customerName: customer.name, phone: customer.phone, token, catalogUrl, whatsappUrl });
  }

  return NextResponse.json(results);
}
