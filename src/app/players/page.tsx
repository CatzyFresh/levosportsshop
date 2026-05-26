export const dynamic = "force-dynamic";
export const revalidate = 0;

import AddPlayerDialog from "@/components/players/AddPlayerDialog";
import PlayersTable from "@/components/players/PlayersTable";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      purchases: true,
    },
  });

  const playerRows = players.map((player) => {
    const spent = player.purchases.reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0
    );

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
      orders: player.purchases.length,
      joined: player.createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Players
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage store customers and their details.
          </p>
        </div>

        <AddPlayerDialog />
      </div>

      <PlayersTable players={playerRows} />
    </div>
  );
}