import { prisma } from "@/lib/prisma";
import CatalogClient from "@/components/CatalogClient";

export const revalidate = 0;

export default async function CatalogPage() {
  const chairs = await prisma.chair.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });

  return <CatalogClient chairs={chairs} />;
}
