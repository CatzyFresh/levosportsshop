import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";

export const getStoreItemDropdownOptions = unstable_cache(
  async () => {
    return prisma.storeItem.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        defaultPrice: true,
        stockTracked: true,
        currentStock: true,
      },
    });
  },
  ["store-item-dropdown-options"],
  { revalidate: 300, tags: ["store-item-dropdowns"] }
);

export const getPlayersPageOne = unstable_cache(
  async () => {
    return prisma.player.findMany({
      orderBy: { name: "asc" },
      take: 25,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        batch: true,
        notes: true,
        createdAt: true,
        _count: { select: { purchases: true } },
      },
    });
  },
  ["players-page-one"],
  { revalidate: 120, tags: ["players-page-one"] }
);
