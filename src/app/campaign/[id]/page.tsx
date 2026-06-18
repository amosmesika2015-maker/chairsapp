import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CampaignClient from "@/components/CampaignClient";

export const revalidate = 0;

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id: Number(id) } });

  if (!campaign || !campaign.isActive) redirect("/");

  const serialized = {
    ...campaign,
    expiresAt: campaign.expiresAt ? campaign.expiresAt.toISOString() : null,
    createdAt: undefined,
    updatedAt: undefined,
  };

  return <CampaignClient campaign={serialized} />;
}
