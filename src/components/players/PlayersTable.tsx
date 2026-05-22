"use client";

import { useMemo, useState } from "react";
import DeletePlayerButton from "@/components/players/DeletePlayerButton";
import EditPlayerDialog from "@/components/players/EditPlayerDialog";
import { ArrowRight } from "lucide-react";
import { RowActionLink } from "@/components/common/RowActions";

type PlayerRow = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  batch: string | null;
  notes: string | null;
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
  const [selectedBatch, setSelectedBatch] = useState("All Batches");

  const batchOptions = useMemo(() => {
    const uniqueBatches = Array.from(
      new Set(
        players
          .map((player) => player.batch)
          .filter((batch): batch is string => Boolean(batch))
      )
    ).sort();

    return ["All Batches", ...uniqueBatches];
  }, [players]);

  const filteredPlayers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return players.filter((player) => {
      const matchesSearch =
        !query ||
        player.name.toLowerCase().includes(query) ||
        player.contact.toLowerCase().includes(query) ||
        (player.batch ?? "").toLowerCase().includes(query);

      const matchesBatch =
        selectedBatch === "All Batches" || player.batch === selectedBatch;

      return matchesSearch && matchesBatch;
    });
  }, [players, searchText, selectedBatch]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex flex-1 flex-wrap gap-3">
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search players..."
            className="w-full max-w-md rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
          />

          <select
            value={selectedBatch}
            onChange={(event) => setSelectedBatch(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 outline-none focus:border-cyan-500"
          >
            {batchOptions.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-slate-500">
          Showing {filteredPlayers.length} of {players.length} players
        </p>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-y border-slate-200 bg-slate-50 text-left text-sm text-slate-500">
            <th className="px-5 py-4 font-semibold">Name</th>
            <th className="px-5 py-4 font-semibold">Contact</th>
            <th className="px-5 py-4 font-semibold">Batch</th>
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
                colSpan={7}
                className="px-5 py-12 text-center text-slate-500"
              >
                No players matched your search/filter.
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

              <td className="px-5 py-4">
                {player.batch ? (
                  <span className="rounded-md bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
                    {player.batch}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>

              <td className="px-5 py-4 font-semibold">{player.spent}</td>

              <td className="px-5 py-4">{player.orders}</td>

              <td className="px-5 py-4 text-slate-500">{player.joined}</td>

              <td className="px-5 py-4">
                <div className="flex justify-end gap-4">
                  <EditPlayerDialog
                    player={{
                      id: player.id,
                      name: player.name,
                      email: player.email,
                      phone: player.phone,
                      batch: player.batch,
                      notes: player.notes,
                    }}
                  />

                  <DeletePlayerButton
                    playerId={player.id}
                    playerName={player.name}
                  />

                  <RowActionLink href={`/players/${player.id}`} label={`Open ${player.name}`}>
                    <ArrowRight className="h-5 w-5" />
                  </RowActionLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}