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
      contact: player.phone || player.email || "None",
      spent: formatINR(spent),
      orders: player.purchases.length,
      joined: player.createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-bold">Players</h2>
          <p className="mt-2 text-slate-500">
            Manage store customers and their details.
          </p>
        </div>

        <AddPlayerDialog />
      </div>

      <PlayersTable players={playerRows} />
    </>
  );
}