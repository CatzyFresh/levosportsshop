import Link from "next/link";
import AddPlayerDialog from "@/components/players/AddPlayerDialog";
import prisma from "@/lib/prisma";

export default async function PlayersPage() {
  const players = await prisma.player.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      purchases: true,
    },
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

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="p-6">
          <input
            type="text"
            placeholder="Search players..."
            className="w-full max-w-md rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
          />
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-left text-sm text-slate-500">
              <th className="px-5 py-4 font-semibold">Name</th>
              <th className="px-5 py-4 font-semibold">Contact</th>
              <th className="px-5 py-4 font-semibold">Spent</th>
              <th className="px-5 py-4 font-semibold">Orders</th>
              <th className="px-5 py-4 font-semibold">Joined</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {players.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  No players found. Import your Excel data or add a player.
                </td>
              </tr>
            )}

            {players.map((player) => {
              const spent = player.purchases.reduce(
                (sum, purchase) => sum + purchase.totalAmount,
                0
              );

              return (
                <tr
                  key={player.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium">{player.name}</td>

                  <td className="px-5 py-4 italic text-slate-500">
                    {player.phone || player.email || "None"}
                  </td>

                  <td className="px-5 py-4 font-semibold">
                    ₹{(spent / 100).toFixed(2)}
                  </td>

                  <td className="px-5 py-4">{player.purchases.length}</td>

                  <td className="px-5 py-4 text-slate-500">
                    {player.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-4">
                      <button className="text-slate-500 hover:text-cyan-600">
                        Edit
                      </button>

                      <button className="text-red-500 hover:text-red-700">
                        Delete
                      </button>

                      <Link
                        href={`/players/${player.id}`}
                        className="font-semibold text-slate-900 hover:text-cyan-600"
                      >
                        Open →
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}