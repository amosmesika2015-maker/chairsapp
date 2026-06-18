import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const links = await prisma.campaignSendLink.findMany({
    where: { campaignId: Number(id) },
    include: {
      customer: true,
      views: { orderBy: { timestamp: "asc" } },
    },
    orderBy: { sentAt: "desc" },
  });

  const data = links.map((link) => ({
    linkId: link.id,
    customerId: link.customerId,
    customerName: link.customer.name,
    phone: link.customer.phone,
    sentAt: link.sentAt,
    openCount: link.views.length,
    firstOpenedAt: link.views[0]?.timestamp ?? null,
    device: link.views[0]?.device ?? null,
  }));

  return NextResponse.json(data);
}
