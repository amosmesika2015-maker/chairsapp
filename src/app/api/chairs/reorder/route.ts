import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { orderedIds }: { orderedIds: string[] } = await req.json();

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.chair.update({ where: { id }, data: { order: index } })
    )
  );

  return NextResponse.json({ ok: true });
}
