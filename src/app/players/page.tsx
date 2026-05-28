export const revalidate = 60;

import AddPlayerDialog from "@/components/players/AddPlayerDialog";
import PlayersTable from "@/components/players/PlayersTable";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { getPlayersPageOne } from "@/lib/cached-queries";

type PlayersPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

const PAGE_SIZE = 25;

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const params = await searchParams;
  const page = Math.max(Number(params.page) || 1, 1);
  const search = params.q?.trim() ?? "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { batch: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [players, total] = await Promise.all([
    page === 1 && !search
      ? getPlayersPageOne()
      : prisma.player.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
    }),
    prisma.player.count({ where }),
  ]);

  const spentByPlayer = await prisma.purchase.groupBy({
    by: ["playerId"],
    where: { playerId: { in: players.map((p) => p.id) } },
    _sum: { totalAmount: true },
  });

  const spentMap = new Map(spentByPlayer.map((row) => [row.playerId, row._sum.totalAmount ?? 0]));

  const playerRows = players.map((player) => {
    const spent = spentMap.get(player.id) ?? 0;
    return {
      id: player.id,
      name: player.name,
      email: player.email,
      phone: player.phone,
      batch: player.batch,
      notes: player.notes,
      contact: player.phone || player.email || "None",
      spent,
      spentFormatted: formatINR(spent),
      orders: player._count.purchases,
      joined: player.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Players</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage store customers and their details.</p>
        </div>
        <AddPlayerDialog />
      </div>

      <PlayersTable players={playerRows} totalCount={total} currentPage={page} pageSize={PAGE_SIZE} search={search} />
    </div>
  );
}
