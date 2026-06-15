import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "";
  const device = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";
  const token: string | undefined = body.token ?? undefined;

  if (body.type === "view") {
    await prisma.catalogView.create({ data: { ip, device, userAgent: ua, token } });
  } else if (body.type === "click" && body.chairId) {
    await prisma.chairClick.create({ data: { chairId: body.chairId, token, type: "click" } });
  } else if (body.type === "inquiry" && body.chairId) {
    await prisma.chairClick.create({ data: { chairId: body.chairId, token, type: "inquiry" } });
  }

  return NextResponse.json({ ok: true });
}
