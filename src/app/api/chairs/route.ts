import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const chairs = await prisma.chair.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(chairs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const maxOrder = await prisma.chair.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const chair = await prisma.chair.create({
    data: {
      name: body.name,
      price: body.price,
      imageUrl: body.imageUrl,
      description: body.description,
      details: body.details ?? "",
      status:  body.status  ?? "",
      order: nextOrder,
    },
  });
  return NextResponse.json(chair, { status: 201 });
}
