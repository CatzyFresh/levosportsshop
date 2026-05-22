import StatCard from "@/components/common/StatCard";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";

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
    take: 6,
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

  return (
    <>
      <div className="mb-8">
        <h2 className="text-4xl font-bold">Dashboard</h2>
        <p className="mt-2 text-slate-500">
          Overview of shop performance and activities.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard title="Sales (Month)" value={formatINR(salesThisMonth)} />
        <StatCard title="Total Players" value={totalPlayers} />
        <StatCard title="Purchases (Month)" value={purchasesThisMonth} />
        <StatCard title="Active Players" value={activePlayers} />
      </div>

      <p className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">
        Payment Tracking
      </p>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Outstanding"
          value={formatINR(totalOutstanding)}
          tone={totalOutstanding > 0 ? "danger" : "success"}
        />
        <StatCard
          title="Collected (Month)"
          value={formatINR(collectedThisMonth)}
          tone="success"
        />
        <StatCard title="Overdue Bills" value={overdueBills} />
        <StatCard title="Paid (Month)" value={paidBills} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">
            Sales Revenue This Month
          </h3>

          <div className="flex h-72 items-center justify-center rounded-lg bg-slate-50">
            <div className="text-center">
              <p className="text-5xl font-bold text-cyan-600">
                {formatINR(salesThisMonth)}
              </p>
              <p className="mt-3 text-slate-500">
                Total purchase value recorded this month.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">
            Top Spenders This Month
          </h3>

          <div className="space-y-4">
            {topSpenders.length === 0 && (
              <div className="flex h-56 items-center justify-center text-slate-400">
                No spenders this month
              </div>
            )}

            {topSpenders.map((spender, index) => (
              <div
                key={spender.playerId}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
              >
                <div>
                  <p className="font-semibold">
                    {index + 1}. {spender.playerName}
                  </p>
                  <p className="text-sm text-slate-500">
                    Paid {formatINR(spender.paidAmount)}
                  </p>
                </div>

                <p className="font-bold text-cyan-600">
                  {formatINR(spender.totalAmount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Recent Purchases</h3>

          <div className="space-y-4">
            {recentPurchases.length === 0 && (
              <div className="flex h-48 items-center justify-center text-slate-400">
                No recent purchases
              </div>
            )}

            {recentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{purchase.itemName}</p>
                  <p className="text-sm text-slate-500">
                    {purchase.player.name} · Qty {purchase.quantity}
                  </p>
                </div>

                <p className="font-bold">{formatINR(purchase.totalAmount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Popular Items</h3>

          <div className="space-y-4">
            {popularItems.length === 0 && (
              <div className="flex h-48 items-center justify-center text-slate-400">
                No popular items yet
              </div>
            )}

            {popularItems.map((item) => (
              <div
                key={item.itemName}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{item.itemName}</p>
                  <p className="text-sm text-slate-500">
                    Quantity sold: {item.quantity}
                  </p>
                </div>

                <p className="font-bold text-cyan-600">
                  {formatINR(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}