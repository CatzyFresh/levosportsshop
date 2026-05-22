"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/money";
import { coachBatchOptions } from "@/lib/coaches";
import { ArrowRight } from "lucide-react";
import { RowActionLink } from "@/components/common/RowActions";

type BillingStatus = "Paid" | "Partial" | "Overdue" | "Unpaid";

type BillingPlayer = {
  id: number;
  name: string;
  contact: string;
  batch: string | null;
  orders: number;
  paidAmount: number;
  balance: number;
  status: BillingStatus;
};

type BillingListProps = {
  players: BillingPlayer[];
  month: number;
  year: number;
};

const filters = ["All Players", "Unpaid", "Partial", "Overdue", "Paid"] as const;

export default function BillingList({ players, month, year }: BillingListProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All Players");

  const batchOptions = ["All Batches", ...coachBatchOptions];

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

      const matchesStatus =
        activeFilter === "All Players" || player.status === activeFilter;

      return matchesSearch && matchesBatch && matchesStatus;
    });
  }, [players, searchText, selectedBatch, activeFilter]);

  const filteredBalance = filteredPlayers.reduce(
    (sum, player) => sum + player.balance,
    0
  );

  return (
    <>
      <div className="mb-6 max-w-5xl">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search for a player..."
            className="min-w-72 flex-1 rounded-md border border-slate-300 bg-white px-5 py-4 text-lg outline-none focus:border-cyan-500"
          />

          <select
            value={selectedBatch}
            onChange={(event) => setSelectedBatch(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-5 py-4 font-semibold text-slate-700 outline-none focus:border-cyan-500"
          >
            {batchOptions.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            Showing {filteredPlayers.length} of {players.length} players
          </p>

          <p>
            Filtered balance:{" "}
            <span className="font-bold text-slate-900">
              {formatINR(filteredBalance)}
            </span>
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full border px-5 py-2 text-sm font-semibold ${
              activeFilter === filter
                ? "border-cyan-500 bg-cyan-500 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="max-w-5xl space-y-4">
        {filteredPlayers.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            No players matched your search/filter.
          </div>
        )}

        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-cyan-300 hover:shadow-md"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-bold">{player.name}</h3>
                <StatusBadge status={player.status} />

                {player.batch ? (
                  <span className="rounded-md bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
                    {player.batch}
                  </span>
                ) : (
                  <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500">
                    No Batch
                  </span>
                )}
              </div>

              <p className="mt-2 text-slate-500">
                {player.contact} · {player.orders} orders · Paid{" "}
                {formatINR(player.paidAmount)}
              </p>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Balance
                </p>

                <p
                  className={`text-lg font-bold ${
                    player.balance > 0 ? "text-red-600" : "text-cyan-600"
                  }`}
                >
                  {formatINR(player.balance)}
                </p>
              </div>

              <RowActionLink
                href={`/billing/${player.id}?month=${month}&year=${year}`}
                label={`Open bill for ${player.name}`}
              >
                <ArrowRight className="h-5 w-5" />
              </RowActionLink>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: BillingStatus }) {
  if (status === "Paid") {
    return (
      <span className="rounded-md bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
        ✓ Paid
      </span>
    );
  }

  if (status === "Partial") {
    return (
      <span className="rounded-md bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
        Partial
      </span>
    );
  }

  if (status === "Overdue") {
    return (
      <span className="rounded-md bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
        Overdue
      </span>
    );
  }

  return (
    <span className="rounded-md bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      Unpaid
    </span>
  );
}