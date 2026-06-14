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

  const clickGroups = await prisma.chairClick.groupBy({
    by: ["chairId"],
    _count: { chairId: true },
    orderBy: { _count: { chairId: "desc" } },
    take: 5,
  });

  const chairIds = clickGroups.map((g) => g.chairId);
  const chairs = await prisma.chair.findMany({
    where: { id: { in: chairIds } },
    select: { id: true, name: true },
  });

  const topChairs = clickGroups.map((g) => ({
    chairId: g.chairId,
    name: chairs.find((ch) => ch.id === g.chairId)?.name ?? "נמחק",
    clicks: g._count.chairId,
  }));

  // campaign stats: for each CampaignLink, check if its token appears in CatalogView
  const campaigns = await prisma.campaignLink.findMany({
    include: { customer: { select: { id: true, name: true, phone: true } } },
    orderBy: { sentAt: "desc" },
  });

  const campaignStats = await Promise.all(
    campaigns.map(async (link) => {
      const views = await prisma.catalogView.findMany({
        where: { token: link.token },
        orderBy: { timestamp: "asc" },
        take: 1,
      });
      const chairClicks = await prisma.chairClick.findMany({
        where: { token: link.token },
        select: { chairId: true },
      });
      const uniqueChairsViewed = Array.from(new Set(chairClicks.map((c) => c.chairId)));

      return {
        token: link.token,
        sentAt: link.sentAt,
        customerId: link.customer.id,
        customerName: link.customer.name,
        phone: link.customer.phone,
        opened: views.length > 0,
        firstOpenedAt: views[0]?.timestamp ?? null,
        chairsViewedCount: uniqueChairsViewed.length,
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
    campaignStats,
    totalSent,
    totalOpened,
  });
}
