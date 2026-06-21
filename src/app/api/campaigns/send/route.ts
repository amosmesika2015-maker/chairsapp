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
    const firstName = customer.name.split(" ")[0];
    const message = encodeURIComponent(
      `שלום ${firstName}! 👋\n\nשמחים לשתף אותך בקטלוג הכיסאות החדש שלנו.\n\n🔗 ${catalogUrl}\n\nמעניין אותך משהו ספציפי? נשמח לעזור!\nתודה,\nא.ס רהיטי עוצמה בע"מ`
    );
    const whatsappUrl = `https://wa.me/${customer.phone}?text=${message}`;

    results.push({ customerId: customer.id, customerName: customer.name, phone: customer.phone, token, catalogUrl, whatsappUrl });
  }

  return NextResponse.json(results);
}
