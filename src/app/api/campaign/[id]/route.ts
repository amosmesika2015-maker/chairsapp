import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id: Number(id) } });
  if (!campaign) return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title, description, images, originalPrice, salePrice, whatsappMessage, isOutOfStock, expiresAt, isActive } = body;

  const campaign = await prisma.campaign.update({
    where: { id: Number(id) },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(images !== undefined && { images: JSON.stringify(images) }),
      ...(originalPrice !== undefined && { originalPrice }),
      ...(salePrice !== undefined && { salePrice }),
      ...(whatsappMessage !== undefined && { whatsappMessage }),
      ...(isOutOfStock !== undefined && { isOutOfStock }),
      ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(campaign);
}
