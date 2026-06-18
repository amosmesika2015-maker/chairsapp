import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { customerIds, baseUrl } = await req.json();

  if (!customerIds?.length) {
    return NextResponse.json({ error: "customerIds required" }, { status: 400 });
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: Number(id) } });
  if (!campaign) return NextResponse.json({ error: "קמפיין לא נמצא" }, { status: 404 });

  const customers = await prisma.customer.findMany({
    where: { id: { in: customerIds.map(Number) } },
  });

  const results = [];
  for (const customer of customers) {
    const link = await prisma.campaignSendLink.create({
      data: { campaignId: Number(id), customerId: customer.id },
    });

    const campaignUrl = `${baseUrl}/campaign/${id}?t=${link.token}`;
    const message = encodeURIComponent(
      `${campaign.whatsappMessage}\n\n🔗 ${campaignUrl}`
    );
    const whatsappUrl = `https://wa.me/${customer.phone}?text=${message}`;

    results.push({
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      token: link.token,
      campaignUrl,
      whatsappUrl,
    });
  }

  return NextResponse.json(results);
}
