import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminClient from "@/components/AdminClient";

export const revalidate = 0;

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [chairs, customers, categories] = await Promise.all([
    prisma.chair.findMany({ orderBy: { order: "asc" }, include: { category: true } }),
    prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

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
  const chairNames = await prisma.chair.findMany({
    where: { id: { in: allChairIds } },
    select: { id: true, name: true },
  });

  const topChairs = clickGroups.map((g) => ({
    chairId: g.chairId,
    name: chairNames.find((ch) => ch.id === g.chairId)?.name ?? "נמחק",
    clicks: g._count.chairId,
  }));

  const topInquiries = inquiryGroups.map((g) => ({
    chairId: g.chairId,
    name: chairNames.find((ch) => ch.id === g.chairId)?.name ?? "נמחק",
    inquiries: g._count.chairId,
  }));

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
      const uniqueChairs = Array.from(new Set(chairClicks.map((c) => c.chairId)));
      return {
        token: link.token,
        sentAt: link.sentAt.toISOString(),
        customerId: link.customer.id,
        customerName: link.customer.name,
        phone: link.customer.phone,
        opened: openCount > 0,
        firstOpenedAt: firstView?.timestamp?.toISOString() ?? null,
        chairsViewedCount: uniqueChairs.length,
        openCount,
      };
    })
  );

  return (
    <AdminClient
      chairs={chairs}
      categories={categories}
      customers={customers.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
      analytics={{
        viewsWeek,
        viewsMonth,
        totalViews,
        topChairs,
        topInquiries,
        campaignStats,
        totalSent: new Set(campaigns.map((c) => c.customer.id)).size,
        totalOpened: new Set(campaignStats.filter((s) => s.opened).map((s) => s.customerId)).size,
      }}
    />
  );
}
