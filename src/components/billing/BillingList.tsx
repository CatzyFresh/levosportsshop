"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatINR } from "@/lib/money";

type BillingStatus = "Paid" | "Partial" | "Overdue" | "Unpaid";

type BillingPlayer = {
  id: number;
  name: string;
  contact: string;
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
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>("All Players");

  const filteredPlayers = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return players.filter((player) => {
      const matchesSearch =
        !query ||
        player.name.toLowerCase().includes(query) ||
        player.contact.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All Players" || player.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [players, searchText, activeFilter]);

  return (
    <>
      <div className="mb-6 max-w-5xl">
        <input
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search for a player..."
          className="w-full rounded-md border border-slate-300 bg-white px-5 py-4 text-lg outline-none focus:border-cyan-500"
        />
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

        <p className="ml-2 text-sm text-slate-500">
          Showing {filteredPlayers.length} of {players.length} players
        </p>
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
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{player.name}</h3>
                <StatusBadge status={player.status} />
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

              <Link
                href={`/billing/${player.id}?month=${month}&year=${year}`}
                className="text-2xl font-bold text-slate-900 hover:text-cyan-600"
              >
                →
              </Link>
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