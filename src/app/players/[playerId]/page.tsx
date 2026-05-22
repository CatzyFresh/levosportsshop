import Link from "next/link";
import { notFound } from "next/navigation";
import AddPurchaseDialog from "@/components/purchases/AddPurchaseDialog";
import DeletePurchaseButton from "@/components/purchases/DeletePurchaseButton";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";

type PlayerDetailPageProps = {
  params: Promise<{
    playerId: string;
  }>;
};

export default async function PlayerDetailPage({
  params,
}: PlayerDetailPageProps) {
  const { playerId } = await params;
  const id = Number(playerId);

  if (!id || Number.isNaN(id)) {
    notFound();
  }

  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const player = await prisma.player.findUnique({
    where: {
      id,
    },
    include: {
      purchases: {
        orderBy: {
          purchaseDate: "desc",
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

  if (!player) {
    notFound();
  }

  const storeItems = await prisma.storeItem.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      defaultPrice: true,
      stockTracked: true,
      currentStock: true,
    },
  });

  const lifetimeSpent = player.purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );

  const currentMonthPurchases = player.purchases.filter((purchase) => {
    return purchase.purchaseDate >= monthStart && purchase.purchaseDate < monthEnd;
  });

  const currentMonthTotal = currentMonthPurchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );

  const currentInvoice = player.invoices[0];

  const currentMonthPaid =
    currentInvoice?.payments.reduce((sum, payment) => sum + payment.amount, 0) ??
    0;

  const outstandingBalance = Math.max(currentMonthTotal - currentMonthPaid, 0);

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link href="/players" className="text-sm font-semibold text-cyan-600">
            ← Back to Players
          </Link>

          <h2 className="mt-3 text-4xl font-bold">{player.name}</h2>
          <p className="mt-2 text-slate-500">Player purchase profile</p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/billing/${player.id}`}
            className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Generate Bill
          </Link>

          <AddPurchaseDialog playerId={player.id} storeItems={storeItems} />
        </div>
      </div>

      <div className="mb-8 grid max-w-4xl grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Outstanding Balance
          </p>
          <p
            className={`mt-3 text-3xl font-bold ${
              outstandingBalance > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatINR(outstandingBalance)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Total Orders
          </p>
          <p className="mt-3 text-3xl font-bold">{player.purchases.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Lifetime Spent
          </p>
          <p className="mt-3 text-3xl font-bold text-cyan-600">
            {formatINR(lifetimeSpent)}
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-3">
        <button className="rounded-md bg-cyan-500 px-5 py-2 font-semibold text-white">
          Purchases
        </button>
        <button className="rounded-md border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-600">
          Stats
        </button>
        <button className="rounded-md border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-600">
          Calendar
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-xl font-bold">Purchase History</h3>
          <p className="mt-1 text-slate-500">
            All purchases made by this player.
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-500">
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Item</th>
              <th className="px-5 py-4 font-semibold">Price</th>
              <th className="px-5 py-4 font-semibold">Qty</th>
              <th className="px-5 py-4 font-semibold">Total</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {player.purchases.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  No purchases found. Add the first purchase for this player.
                </td>
              </tr>
            )}

            {player.purchases.map((purchase) => (
              <tr
                key={purchase.id}
                className="border-b border-slate-100 hover:bg-slate-50 last:border-b-0"
              >
                <td className="px-5 py-4 text-slate-500">
                  {purchase.purchaseDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="px-5 py-4 font-medium">{purchase.itemName}</td>

                <td className="px-5 py-4">
                  {formatINR(purchase.unitPrice)}
                </td>

                <td className="px-5 py-4">{purchase.quantity}</td>

                <td className="px-5 py-4 font-semibold">
                  {formatINR(purchase.totalAmount)}
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-4">
                    <button className="text-slate-500 hover:text-cyan-600">
                      Edit
                    </button>
                    <DeletePurchaseButton purchaseId={purchase.id} playerId={player.id} />
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