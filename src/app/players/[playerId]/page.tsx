import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getStoreItemDropdownOptions } from "@/lib/cached-queries";
import { formatINR } from "@/lib/money";

import AddPurchaseDialog from "@/components/purchases/AddPurchaseDialog";
import EditPurchaseDialog from "@/components/purchases/EditPurchaseDialog";
import DeletePurchaseButton from "@/components/purchases/DeletePurchaseButton";

import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  CreditCard,
  Mail,
  Phone,
  Plus,
  ReceiptText,
  ShoppingBag,
  TriangleAlert,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PlayerProfilePageProps = {
  params: Promise<{
    playerId: string;
  }>;
};

export default async function PlayerProfilePage({
  params,
}: PlayerProfilePageProps) {
  const { playerId: playerIdParam } = await params;
  const playerId = Number(playerIdParam);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    notFound();
  }

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const player = await prisma.player.findUnique({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      batch: true,
      createdAt: true,
      purchases: {
        orderBy: {
          purchaseDate: "desc",
        },
        select: {
          id: true,
          itemName: true,
          totalAmount: true,
          quantity: true,
          purchaseDate: true,
          notes: true,
          unitPrice: true,
          storeItemId: true,
        },
      },
      invoices: {
        where: { month, year },
        select: {
          payments: {
            orderBy: { paidAt: "desc" },
            select: { id: true, amount: true, paidAt: true, method: true, notes: true },
          },
        },
      },
    },

    where: {
      id: playerId,
    },
  });

  if (!player) {
    notFound();
  }

  const storeItems = await getStoreItemDropdownOptions();

  const currentMonthPurchases = player.purchases.filter((purchase) => {
    return purchase.purchaseDate >= monthStart && purchase.purchaseDate < monthEnd;
  });

  const totalSpent = player.purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );

  const currentMonthTotal = currentMonthPurchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );

  const invoice = player.invoices[0];

  const paidAmount =
    invoice?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;

  const balance = Math.max(currentMonthTotal - paidAmount, 0);

  const lastPayment = invoice?.payments[0];

  const averagePurchase =
    player.purchases.length > 0
      ? Math.round(totalSpent / player.purchases.length)
      : 0;

  const currentMonthLabel = monthStart.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const purchaseCalendar = player.purchases.slice(0, 12).map((purchase) => ({
    id: purchase.id,
    itemName: purchase.itemName,
    amount: purchase.totalAmount,
    quantity: purchase.quantity,
    date: purchase.purchaseDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div className="space-y-5">
        <Button asChild variant="ghost" className="px-0 hover:bg-transparent">
          <Link href="/players" className="text-sm font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Players
          </Link>
        </Button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {player.name}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Player purchase history and billing details.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline" className="rounded-xl shadow-sm">
              <Link href={`/billing/${player.id}`}>
                <ReceiptText className="mr-2 h-4 w-4" />
                Generate Bill
              </Link>
            </Button>

            <AddPurchaseDialog playerId={player.id} storeItems={storeItems} />
          </div>
        </div>
      </div>

      <Card
        className={`overflow-hidden shadow-sm ${
          balance > 0
            ? "border-orange-200 bg-linear-to-br from-orange-50 to-white"
            : "border-emerald-200 bg-linear-to-br from-emerald-50 to-white"
        }`}
      >
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${
                  balance > 0
                    ? "bg-orange-100 text-orange-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {balance > 0 ? (
                  <TriangleAlert className="h-5 w-5" />
                ) : (
                  <CreditCard className="h-5 w-5" />
                )}
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {balance > 0 ? "Outstanding Balance" : "No Outstanding Balance"}
                </div>

                <div
                  className={`mt-1 text-3xl font-bold ${
                    balance > 0 ? "text-orange-600" : "text-emerald-600"
                  }`}
                >
                  {formatINR(balance)}
                </div>

                <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  {lastPayment
                    ? `Last payment: ${lastPayment.paidAt.toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}`
                    : "No payment recorded this month"}
                </div>
              </div>
            </div>

            <div className="w-fit rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-600 shadow-sm">
              {currentMonthLabel}
              <span className="ml-3">{formatINR(balance)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="purchases" className="space-y-5">
        <TabsList className="grid h-12 w-full grid-cols-3 rounded-2xl bg-slate-100 p-1 shadow-inner">
          <TabsTrigger
            value="purchases"
            className="rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm"
          >
            Purchases
          </TabsTrigger>

          <TabsTrigger
            value="stats"
            className="rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm"
          >
            Stats
          </TabsTrigger>

          <TabsTrigger
            value="calendar"
            className="rounded-xl text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm"
          >
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Purchase History</CardTitle>

              <Badge className="rounded-full bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
                {player.purchases.length} purchases
              </Badge>
            </CardHeader>

            <CardContent>
              {player.purchases.length === 0 ? (
                <EmptyState>No purchases recorded yet.</EmptyState>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  {player.purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="group flex items-center justify-between gap-3 border-b border-slate-200 p-4 transition-all duration-300 last:border-b-0 hover:bg-cyan-50/60"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-950 transition-colors group-hover:text-cyan-700">
                          {purchase.itemName}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                          <span>
                            {purchase.purchaseDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span>•</span>
                          <span>
                            {purchase.quantity} ×{" "}
                            {formatINR(
                              Math.round(purchase.totalAmount / purchase.quantity)
                            )}
                          </span>
                        </div>

                        {purchase.notes && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {purchase.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <div className="text-right font-bold">
                          {formatINR(purchase.totalAmount)}
                        </div>

                        <div className="rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm [&_button]:h-9 [&_button]:w-9 [&_button]:rounded-full [&_button]:text-slate-500 [&_button:hover]:text-blue-600">
                          <EditPurchaseDialog
                            purchase={{
                              ...purchase,
                              purchaseDate: purchase.purchaseDate.toISOString(),
                            }}
                            playerId={player.id}
                            storeItems={storeItems}
                          />
                        </div>

                        <div className="rounded-full transition-all duration-300 hover:bg-red-50 hover:shadow-sm [&_button]:h-9 [&_button]:w-9 [&_button]:rounded-full [&_button]:text-red-500 [&_button:hover]:text-red-600">
                          <DeletePurchaseButton
                            purchaseId={purchase.id}
                            playerId={player.id}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SummaryCard
              title="Total Spent"
              value={formatINR(totalSpent)}
              icon={<Wallet className="h-4 w-4 text-emerald-500" />}
              className="border-emerald-200 bg-linear-to-br from-emerald-50 to-white"
              valueClassName="text-emerald-600"
            />

            <SummaryCard
              title="Purchases"
              value={player.purchases.length}
              icon={<ShoppingBag className="h-4 w-4 text-cyan-500" />}
              className="border-cyan-200 bg-linear-to-br from-cyan-50 to-white"
            />

            <SummaryCard
              title="This Month"
              value={formatINR(currentMonthTotal)}
              icon={<Calendar className="h-4 w-4 text-violet-500" />}
              className="border-violet-200 bg-linear-to-br from-violet-50 to-white"
            />

            <SummaryCard
              title="Average"
              value={formatINR(averagePurchase)}
              icon={<CreditCard className="h-4 w-4 text-orange-500" />}
              className="border-orange-200 bg-linear-to-br from-orange-50 to-white"
            />
          </div>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Player Information</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 md:grid-cols-2">
              <InfoItem label="Name" value={player.name} />
              <InfoItem label="Email" value={player.email || "Not provided"} />
              <InfoItem label="Phone" value={player.phone || "Not provided"} />
              <InfoItem label="Batch" value={player.batch || "Not assigned"} />
              <InfoItem
                label="Joined"
                value={player.createdAt.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Purchase Calendar</CardTitle>
            </CardHeader>

            <CardContent>
              {purchaseCalendar.length === 0 ? (
                <EmptyState>No calendar activity yet.</EmptyState>
              ) : (
                <div className="space-y-3">
                  {purchaseCalendar.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50/50 hover:shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                          <Calendar className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate font-semibold">
                            {purchase.itemName}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {purchase.date} • Qty {purchase.quantity}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 font-bold">
                        {formatINR(purchase.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  className = "",
  valueClassName = "",
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <Card
      className={`overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </div>

          {icon}
        </div>

        <div className={`text-lg font-bold md:text-2xl ${valueClassName}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 text-base font-semibold text-slate-950">
        {value}
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
