"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DeletePlayerButton from "@/components/players/DeletePlayerButton";

type PlayerRow = {
  id: number;
  name: string;
  contact: string;
  spent: string;
  orders: number;
  joined: string;
};

type PlayersTableProps = {
  players: PlayerRow[];
};

export default function PlayersTable({ players }: PlayersTableProps) {
  const [searchText, setSearchText] = useState("");

  const filteredPlayers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    if (!query) {
      return players;
    }

    return players.filter((player) => {
      return (
        player.name.toLowerCase().includes(query) ||
        player.contact.toLowerCase().includes(query)
      );
    });
  }, [players, searchText]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 p-6">
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search players..."
          className="w-full max-w-md rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
        />

        <p className="text-sm text-slate-500">
          Showing {filteredPlayers.length} of {players.length} players
        </p>
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
          {filteredPlayers.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-5 py-12 text-center text-slate-500"
              >
                No players matched your search.
              </td>
            </tr>
          )}

          {filteredPlayers.map((player) => (
            <tr
              key={player.id}
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

                  <DeletePlayerButton playerId={player.id} playerName={player.name} />

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
  );
}