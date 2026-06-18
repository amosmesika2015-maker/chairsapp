import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, images, originalPrice, salePrice, whatsappMessage, expiresAt } = body;

  if (!title || !originalPrice || !salePrice) {
    return NextResponse.json({ error: "שדות חובה חסרים" }, { status: 400 });
  }

  const campaign = await prisma.campaign.create({
    data: {
      title,
      description: description ?? "",
      images: JSON.stringify(images ?? []),
      originalPrice,
      salePrice,
      whatsappMessage: whatsappMessage ?? "",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
