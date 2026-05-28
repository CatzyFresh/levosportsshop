"use client";

import Link from "next/link";
import { ArrowRight, Mail, Phone, Search } from "lucide-react";

import DeletePlayerButton from "@/components/players/DeletePlayerButton";
import EditPlayerDialog from "@/components/players/EditPlayerDialog";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PlayerRow = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  batch: string | null;
  notes: string | null;
  contact: string;
  spent: number;
  spentFormatted: string;
  orders: number;
  joined: string;
};

type PlayersTableProps = {
  players: PlayerRow[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  search: string;
};

export default function PlayersTable({ players, totalCount, currentPage, pageSize, search }: PlayersTableProps) {
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.08)]">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-white to-cyan-50/40 px-4 py-5 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form className="relative w-full max-w-md" action="/players">
            <input type="hidden" name="page" value="1" />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              type="search"
              defaultValue={search}
                            name="q" placeholder="Search players..."
              className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-base shadow-sm transition-all duration-300 focus-visible:border-cyan-300 focus-visible:ring-cyan-200"
            />
                      <button type="submit" className="sr-only">Search</button>
          </form>

          <p className="text-sm font-medium text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-900">
              {players.length}
            </span>{" "}
            of {totalCount} players
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Mobile List */}
        <div className="divide-y divide-slate-100 md:hidden">
          {players.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground">
              No players found.
            </div>
          ) : (
            players.map((player, index) => (
              <div
                key={player.id}
                className="group relative flex items-center gap-3 overflow-hidden p-4 transition-all duration-300 hover:bg-cyan-50/60"
                style={{
                  animationDelay: `${index * 35}ms`,
                }}
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <Link href={`/players/${player.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-base font-bold text-slate-950 transition-colors group-hover:text-cyan-700">
                      {player.name}
                    </div>

                    {player.batch && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 rounded-full bg-slate-100 text-[10px] text-slate-600"
                      >
                        {player.batch}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <span
                      className={`font-bold ${
                        player.spent > 0 ? "text-cyan-600" : "text-slate-500"
                      }`}
                    >
                      {player.spentFormatted}
                    </span>

                    <span className="text-slate-500">
                      {player.orders} {player.orders === 1 ? "order" : "orders"}
                    </span>
                  </div>

                  {(player.email || player.phone) && (
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      {player.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{player.email}</span>
                        </div>
                      )}

                      {player.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{player.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Link>

                <div className="flex shrink-0 items-center gap-1">
                  <div className="rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm [&_button]:h-9 [&_button]:w-9 [&_button]:rounded-full [&_button]:text-slate-500 [&_button:hover]:text-blue-600">
                    <EditPlayerDialog player={player} />
                  </div>

                  <div className="rounded-full transition-all duration-300 hover:bg-red-50 hover:shadow-sm [&_button]:h-9 [&_button]:w-9 [&_button]:rounded-full [&_button]:text-red-500 [&_button:hover]:text-red-600">
                    <DeletePlayerButton
                      playerId={player.id}
                      playerName={player.name}
                    />
                  </div>

                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-slate-700 transition-all duration-300 hover:translate-x-0.5 hover:bg-cyan-100 hover:text-cyan-700 hover:shadow-sm"
                  >
                    <Link href={`/players/${player.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 bg-slate-50/80">
                <TableHead className="font-bold text-slate-600">Name</TableHead>
                <TableHead className="font-bold text-slate-600">
                  Contact
                </TableHead>
                <TableHead className="font-bold text-slate-600">Batch</TableHead>
                <TableHead className="text-right font-bold text-slate-600">
                  Spent
                </TableHead>
                <TableHead className="text-right font-bold text-slate-600">
                  Orders
                </TableHead>
                <TableHead className="font-bold text-slate-600">
                  Joined
                </TableHead>
                <TableHead className="text-right font-bold text-slate-600">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No players found.
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player) => (
                  <TableRow
                    key={player.id}
                    className="group border-slate-100 transition-all duration-300 hover:bg-cyan-50/60"
                  >
                    <TableCell className="font-semibold">
                      <Link
                        href={`/players/${player.id}`}
                        className="transition-colors hover:text-cyan-700 hover:underline"
                      >
                        {player.name}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {player.email && (
                          <div className="text-slate-700">{player.email}</div>
                        )}

                        {player.phone && (
                          <div className="text-slate-500">{player.phone}</div>
                        )}

                        {!player.email && !player.phone && (
                          <span className="italic text-slate-400">None</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {player.batch ? (
                        <Badge className="rounded-full bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
                          {player.batch}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell
                      className={`text-right font-bold ${
                        player.spent > 0 ? "text-cyan-600" : "text-slate-500"
                      }`}
                    >
                      {player.spentFormatted}
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      {player.orders}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {player.joined}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <div className="rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm [&_button]:h-9 [&_button]:w-9 [&_button]:rounded-full [&_button]:text-slate-500 [&_button:hover]:text-blue-600">
                          <EditPlayerDialog player={player} />
                        </div>

                        <div className="rounded-full transition-all duration-300 hover:bg-red-50 hover:shadow-sm [&_button]:h-9 [&_button]:w-9 [&_button]:rounded-full [&_button]:text-red-500 [&_button:hover]:text-red-600">
                          <DeletePlayerButton
                            playerId={player.id}
                            playerName={player.name}
                          />
                        </div>

                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-slate-700 transition-all duration-300 hover:translate-x-0.5 hover:bg-cyan-100 hover:text-cyan-700 hover:shadow-sm"
                        >
                          <Link href={`/players/${player.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>


        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm md:px-6">
          <span className="text-slate-500">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={currentPage <= 1}>
              <Link href={`/players?page=${Math.max(currentPage - 1,1)}${search ? `&q=${encodeURIComponent(search)}` : ""}`}>Previous</Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={currentPage >= totalPages}>
              <Link href={`/players?page=${Math.min(currentPage + 1,totalPages)}${search ? `&q=${encodeURIComponent(search)}` : ""}`}>Next</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}