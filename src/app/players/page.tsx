import Link from "next/link";
import AddPlayerDialog from "@/components/players/AddPlayerDialog";

const players = [
  { id: "114", name: "Aadhvik", contact: "None", spent: "₹0.00", orders: 0, joined: "May 16, 2026" },
  { id: "115", name: "Aarav", contact: "None", spent: "₹0.00", orders: 0, joined: "May 16, 2026" },
  { id: "116", name: "Aarish", contact: "None", spent: "₹0.00", orders: 0, joined: "May 16, 2026" },
  { id: "117", name: "Aathav", contact: "None", spent: "₹0.00", orders: 0, joined: "May 16, 2026" },
  { id: "118", name: "Abdullah", contact: "None", spent: "₹0.00", orders: 0, joined: "May 16, 2026" },
  { id: "119", name: "Ajith (Coach)", contact: "None", spent: "₹0.00", orders: 0, joined: "May 16, 2026" },
  { id: "120", name: "Amarnath", contact: "None", spent: "₹0.00", orders: 0, joined: "May 16, 2026" },
  { id: "121", name: "Arjun", contact: "None", spent: "₹0.00", orders: 0, joined: "May 16, 2026" },
];

export default function PlayersPage() {
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
            {players.map((player) => (
              <tr
                key={player.name}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-5 py-4 font-medium">{player.name}</td>
                <td className="px-5 py-4 italic text-slate-500">
                  {player.contact}
                </td>
                <td className="px-5 py-4 font-semibold">{player.spent}</td>
                <td className="px-5 py-4">{player.orders}</td>
                <td className="px-5 py-4 text-slate-500">{player.joined}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}