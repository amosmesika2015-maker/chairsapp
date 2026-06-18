import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token: string | undefined = body.token ?? undefined;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";
  const device = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";

  let linkId: number | null = null;
  if (token) {
    const link = await prisma.campaignSendLink.findUnique({ where: { token } });
    if (link) linkId = link.id;
  }

  await prisma.campaignView.create({
    data: { linkId, ip, device, userAgent: ua, token },
  });

  return NextResponse.json({ ok: true });
}
