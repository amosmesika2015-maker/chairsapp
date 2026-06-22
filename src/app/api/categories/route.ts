import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { chairs: { where: { isVisible: true } } } },
    },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      order: body.order ?? nextOrder,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
