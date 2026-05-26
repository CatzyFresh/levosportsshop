import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import DashboardRevenueChart from "@/components/dashboard/DashboardRevenueChart";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const dueDate = new Date(year, month, 10);

  const players = await prisma.player.findMany({
    include: {
      purchases: {
        where: {
          purchaseDate: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
      },
      invoices: {
        where: {
          month,
          year,
        },
        include: {
          payments: true,
        },
      },
    },
  });

  const recentPurchases = await prisma.purchase.findMany({
    where: {
      purchaseDate: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
    orderBy: {
      purchaseDate: "desc",
    },
    take: 10,
    include: {
      player: true,
    },
  });

  const totalPlayers = players.length;
  const currentMonthPurchases = players.flatMap((player) => player.purchases);

  const salesThisMonth = currentMonthPurchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );

  const purchasesThisMonth = currentMonthPurchases.length;

  const activePlayers = players.filter(
    (player) => player.purchases.length > 0
  ).length;

  const billingData = players.map((player) => {
    const totalAmount = player.purchases.reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0
    );

    const invoice = player.invoices[0];

    const paidAmount =
      invoice?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;

    const balance = Math.max(totalAmount - paidAmount, 0);
    const isOverdue = balance > 0 && dueDate < today;
    const isPaid = totalAmount > 0 && balance === 0;

    return {
      playerId: player.id,
      playerName: player.name,
      totalAmount,
      paidAmount,
      balance,
      isOverdue,
      isPaid,
      purchaseCount: player.purchases.length,
    };
  });

  const totalOutstanding = billingData.reduce(
    (sum, item) => sum + item.balance,
    0
  );

  const collectedThisMonth = billingData.reduce(
    (sum, item) => sum + item.paidAmount,
    0
  );

  const overdueBills = billingData.filter((item) => item.isOverdue).length;
  const paidBills = billingData.filter((item) => item.isPaid).length;

  const topSpenders = billingData
    .filter((item) => item.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  const popularItems = currentMonthPurchases
    .reduce<
      {
        itemName: string;
        quantity: number;
        amount: number;
      }[]
    >((items, purchase) => {
      const existingItem = items.find(
        (item) => item.itemName === purchase.itemName
      );

      if (existingItem) {
        existingItem.quantity += purchase.quantity;
        existingItem.amount += purchase.totalAmount;
      } else {
        items.push({
          itemName: purchase.itemName,
          quantity: purchase.quantity,
          amount: purchase.totalAmount,
        });
      }

      return items;
    }, [])
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

    const revenueChartData = await Promise.all(
  Array.from({ length: 6 }).map(async (_, index) => {
    const date = new Date(year, month - 1 - (5 - index), 1);
    const chartMonth = date.getMonth() + 1;
    const chartYear = date.getFullYear();

    const start = new Date(chartYear, chartMonth - 1, 1);
    const end = new Date(chartYear, chartMonth, 1);

    const purchases = await prisma.purchase.findMany({
      where: {
        purchaseDate: {
          gte: start,
          lt: end,
        },
      },
      select: {
        totalAmount: true,
      },
    });

    return {
      month: date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      }),
      revenue: purchases.reduce(
        (sum, purchase) => sum + purchase.totalAmount,
        0
      ),
    };
  })
);
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of shop performance and activities.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <KpiCard
          title="Sales (Month)"
          value={formatINR(salesThisMonth)}
          icon={<DollarSign className="h-4 w-4 shrink-0 text-cyan-500" />}
          className="border-cyan-200 bg-linear-to-br from-cyan-50 to-white"
          valueClassName="text-slate-950"
        />

        <KpiCard
          title="Total Players"
          value={totalPlayers}
          icon={<Users className="h-4 w-4 shrink-0 text-violet-500" />}
          className="border-violet-200 bg-linear-to-br from-violet-50 to-white"
          valueClassName="text-slate-950"
        />

        <KpiCard
          title="Purchases"
          value={purchasesThisMonth}
          icon={<ShoppingBag className="h-4 w-4 shrink-0 text-blue-500" />}
          className="border-blue-200 bg-linear-to-br from-blue-50 to-white"
          valueClassName="text-slate-950"
        />

        <KpiCard
          title="Active Players"
          value={activePlayers}
          icon={<Activity className="h-4 w-4 shrink-0 text-emerald-500" />}
          className="border-emerald-200 bg-linear-to-br from-emerald-50 to-white"
          valueClassName="text-slate-950"
        />
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Payment Tracking
        </h2>

        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <KpiCard
            title="Outstanding"
            value={formatINR(totalOutstanding)}
            icon={<TrendingDown className="h-4 w-4 shrink-0 text-red-500" />}
            className="border-red-200 bg-linear-to-br from-red-50 to-white"
            valueClassName="text-red-600"
          />

          <KpiCard
            title="Collected"
            value={formatINR(collectedThisMonth)}
            icon={<TrendingUp className="h-4 w-4 shrink-0 text-emerald-500" />}
            className="border-emerald-200 bg-linear-to-br from-emerald-50 to-white"
            valueClassName="text-emerald-600"
          />

          <KpiCard
            title="Overdue Bills"
            value={overdueBills}
            icon={
              <AlertTriangle
                className={`h-4 w-4 shrink-0 ${
                  overdueBills > 0 ? "text-orange-500" : "text-slate-400"
                }`}
              />
            }
            className="border-orange-200 bg-linear-to-br from-orange-50 to-white"
            valueClassName={overdueBills > 0 ? "text-orange-600" : ""}
          />

          <KpiCard
            title="Paid"
            value={paidBills}
            icon={<CheckCircle className="h-4 w-4 shrink-0 text-cyan-500" />}
            className="border-cyan-200 bg-linear-to-br from-cyan-50 to-white"
            valueClassName="text-cyan-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <Card className="col-span-1 border-0 shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Sales Revenue Last 6 Months
            </CardTitle>
          </CardHeader>

          <CardContent>
            <DashboardRevenueChart data={revenueChartData} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Top Spenders This Month
            </CardTitle>
          </CardHeader>

          <CardContent>
            {topSpenders.length > 0 ? (
              <div className="space-y-3">
                {topSpenders.map((player) => (
                  <div
                    key={player.playerId}
                    className="flex items-center justify-between gap-2 rounded-xl p-2 transition-colors hover:bg-slate-100"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/players/${player.playerId}`}
                        className="block truncate text-sm font-semibold hover:text-cyan-600"
                      >
                        {player.playerName}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {player.purchaseCount} purchases
                      </div>
                    </div>

                    <div className="shrink-0 rounded-lg bg-cyan-100 px-2 py-1 text-xs font-bold text-cyan-700">
                      {formatINR(player.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>No spenders this month</EmptyState>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 border-0 shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Recent Purchases
            </CardTitle>
          </CardHeader>

          <CardContent>
            {recentPurchases.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {recentPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between gap-2 border-b border-slate-200 p-3 transition-colors last:border-b-0 hover:bg-cyan-50/50"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                        <span className="truncate">{purchase.itemName}</span>
                        <span className="shrink-0 text-xs font-normal text-muted-foreground">
                          ×{purchase.quantity}
                        </span>
                      </div>

                      <div className="mt-0.5 text-xs text-muted-foreground">
                        <Link
                          href={`/players/${purchase.player.id}`}
                          className="hover:text-cyan-600 hover:underline"
                        >
                          {purchase.player.name}
                        </Link>
                      </div>
                    </div>

                    <div className="shrink-0 text-sm font-bold">
                      {formatINR(purchase.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>No recent purchases</EmptyState>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Popular Items
            </CardTitle>
          </CardHeader>

          <CardContent>
            {popularItems.length > 0 ? (
              <div className="space-y-3">
                {popularItems.map((item, index) => (
                  <div
                    key={item.itemName}
                    className="flex items-center justify-between gap-3 rounded-xl p-2 transition-colors hover:bg-slate-100"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {item.itemName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty sold: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-sm font-bold">
                      {formatINR(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>No popular items yet</EmptyState>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
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
      <CardHeader className="flex flex-row items-center justify-between px-4 pb-2 pt-4">
        <CardTitle className="text-xs font-semibold text-slate-600 md:text-sm">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div className={`text-2xl font-bold md:text-3xl ${valueClassName}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}