import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [viewsWeek, viewsMonth, totalViews] = await Promise.all([
    prisma.catalogView.count({ where: { timestamp: { gte: weekAgo } } }),
    prisma.catalogView.count({ where: { timestamp: { gte: monthAgo } } }),
    prisma.catalogView.count(),
  ]);

  const [clickGroups, inquiryGroups] = await Promise.all([
    prisma.chairClick.groupBy({
      by: ["chairId"],
      where: { type: "click" },
      _count: { chairId: true },
      orderBy: { _count: { chairId: "desc" } },
      take: 5,
    }),
    prisma.chairClick.groupBy({
      by: ["chairId"],
      where: { type: "inquiry" },
      _count: { chairId: true },
      orderBy: { _count: { chairId: "desc" } },
      take: 5,
    }),
  ]);

  const allChairIds = Array.from(new Set([
    ...clickGroups.map((g) => g.chairId),
    ...inquiryGroups.map((g) => g.chairId),
  ]));
  const chairs = await prisma.chair.findMany({
    where: { id: { in: allChairIds } },
    select: { id: true, name: true },
  });

  const topChairs = clickGroups.map((g) => ({
    chairId: g.chairId,
    name: chairs.find((ch) => ch.id === g.chairId)?.name ?? "נמחק",
    clicks: g._count.chairId,
  }));

  const topInquiries = inquiryGroups.map((g) => ({
    chairId: g.chairId,
    name: chairs.find((ch) => ch.id === g.chairId)?.name ?? "נמחק",
    inquiries: g._count.chairId,
  }));

  // campaign stats: for each CampaignLink, check if its token appears in CatalogView
  const campaigns = await prisma.campaignLink.findMany({
    include: { customer: { select: { id: true, name: true, phone: true } } },
    orderBy: { sentAt: "desc" },
  });

  const campaignStats = await Promise.all(
    campaigns.map(async (link) => {
      const [openCount, firstView, chairClicks] = await Promise.all([
        prisma.catalogView.count({ where: { token: link.token } }),
        prisma.catalogView.findFirst({
          where: { token: link.token },
          orderBy: { timestamp: "asc" },
          select: { timestamp: true },
        }),
        prisma.chairClick.findMany({
          where: { token: link.token },
          select: { chairId: true },
        }),
      ]);
      const uniqueChairsViewed = Array.from(new Set(chairClicks.map((c) => c.chairId)));

      return {
        token: link.token,
        sentAt: link.sentAt,
        customerId: link.customer.id,
        customerName: link.customer.name,
        phone: link.customer.phone,
        opened: openCount > 0,
        firstOpenedAt: firstView?.timestamp ?? null,
        chairsViewedCount: uniqueChairsViewed.length,
        openCount,
      };
    })
  );

  const totalSent = campaigns.length;
  const totalOpened = campaignStats.filter((s) => s.opened).length;

  return NextResponse.json({
    viewsWeek,
    viewsMonth,
    totalViews,
    topChairs,
    topInquiries,
    campaignStats,
    totalSent,
    totalOpened,
  });
}
