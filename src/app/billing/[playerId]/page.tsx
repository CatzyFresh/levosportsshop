import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import RecordPaymentDialog from "@/components/payments/RecordPaymentDialog";
import BillingMonthSelector from "@/components/billing/BillingMonthSelector";
import BillActionButtons from "@/components/billing/BillActionButtons";

type SinglePlayerBillPageProps = {
  params: Promise<{
    playerId: string;
  }>;
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
};

function getSelectedBillingPeriod(searchParams: {
  month?: string;
  year?: string;
}) {
  const today = new Date();

  const selectedMonth = Number(searchParams.month) || today.getMonth() + 1;
  const selectedYear = Number(searchParams.year) || today.getFullYear();

  const safeMonth =
    selectedMonth >= 1 && selectedMonth <= 12
      ? selectedMonth
      : today.getMonth() + 1;

  const safeYear =
    selectedYear >= 2020 && selectedYear <= today.getFullYear() + 2
      ? selectedYear
      : today.getFullYear();

  return {
    month: safeMonth,
    year: safeYear,
  };
}

function getDueDate() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 10);
}

export default async function SinglePlayerBillPage({
  params,
  searchParams,
}: SinglePlayerBillPageProps) {
  const { playerId } = await params;
  const id = Number(playerId);

  if (!id || Number.isNaN(id)) {
    notFound();
  }

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
    },
  });

  if (!player) {
    notFound();
  }

const resolvedSearchParams = await searchParams;
const { month, year } = getSelectedBillingPeriod(resolvedSearchParams);

const monthStart = new Date(year, month - 1, 1);
const monthEnd = new Date(year, month, 1);

const monthlyPurchases = player.purchases.filter((purchase) => {
  return purchase.purchaseDate >= monthStart && purchase.purchaseDate < monthEnd;
});

const invoice = await prisma.invoice.findUnique({
  where: {
    playerId_month_year: {
      playerId: player.id,
      month,
      year,
    },
  },
  include: {
    payments: {
      orderBy: {
        paidAt: "desc",
      },
    },
  },
});

const totalAmount = monthlyPurchases.reduce(
  (sum, purchase) => sum + purchase.totalAmount,
  0
);

const paidAmount =
  invoice?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;

const balance = Math.max(totalAmount - paidAmount, 0);

const status =
  totalAmount > 0 && balance === 0
    ? "Paid"
    : paidAmount > 0
    ? "Partial"
    : balance > 0
    ? "Unpaid"
    : "Paid";

const billingMonth = new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
  month: "long",
  year: "numeric",
});

const dueDate = getDueDate();

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link
            href={`/billing?month=${month}&year=${year}`}
            className="text-sm font-semibold text-cyan-600"
          >
            ← Back to Billing
          </Link>

          <h2 className="mt-3 text-4xl font-bold">Bill - {player.name}</h2>
          <p className="mt-2 text-slate-500">
            Monthly statement and payment tracking.
          </p>
        </div>

       <div className="no-print flex items-center gap-3">
  <BillingMonthSelector month={month} year={year} />

  <BillActionButtons
    playerName={player.name}
    playerPhone={player.phone}
    billingMonth={billingMonth}
    totalAmount={totalAmount}
    paidAmount={paidAmount}
    balance={balance}
    dueDateText={dueDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
  />
</div>
      </div>

      <div className="mb-8 grid max-w-5xl grid-cols-4 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Total
          </p>
          <p className="mt-3 text-3xl font-bold">{formatINR(totalAmount)}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Paid
          </p>
          <p className="mt-3 text-3xl font-bold text-green-600">
            {formatINR(paidAmount)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Balance
          </p>
          <p
            className={`mt-3 text-3xl font-bold ${
              balance > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatINR(balance)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Status
          </p>

          {status === "Paid" ? (
            <p className="mt-3 inline-block rounded-md bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
              Paid
            </p>
          ) : (
            <p className="mt-3 inline-block rounded-md bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
              Unpaid
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 flex max-w-5xl items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="font-bold">Billing Month</p>
          <p className="text-slate-500">{billingMonth}</p>
        </div>

        <div>
          <p className="font-bold">Due Date</p>
          <p className="text-slate-500">
            {dueDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <RecordPaymentDialog
          playerId={player.id}
          playerName={player.name}
          currentBalance={balance}
          month={month}
          year={year}
        />
      </div>

      <div className="max-w-5xl rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-xl font-bold">Monthly Statement</h3>
          <p className="mt-1 text-slate-500">
            Purchases recorded for {player.name}.
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-500">
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Description</th>
              <th className="px-5 py-4 font-semibold">Qty</th>
              <th className="px-5 py-4 font-semibold">Price</th>
              <th className="px-5 py-4 text-right font-semibold">Total</th>
            </tr>
          </thead>

          <tbody>
            {monthlyPurchases.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  No purchases found for this player.
                </td>
              </tr>
            )}

            {monthlyPurchases.map((purchase) => (
              <tr
                key={purchase.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <td className="px-5 py-4 text-slate-500">
                  {purchase.purchaseDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="px-5 py-4 font-medium">{purchase.itemName}</td>

                <td className="px-5 py-4">{purchase.quantity}</td>

                <td className="px-5 py-4">
                  {formatINR(purchase.unitPrice)}
                </td>

                <td className="px-5 py-4 text-right font-semibold">
                  {formatINR(purchase.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-slate-200 p-6 text-right">
          <p className="text-slate-500">Grand Total</p>
          <p className="text-3xl font-bold">{formatINR(totalAmount)}</p>
        </div>
      </div>
              <div className="mt-8 max-w-5xl rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-xl font-bold">Payment History</h3>
          <p className="mt-1 text-slate-500">
            Payments recorded for this billing month.
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-500">
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Method</th>
              <th className="px-5 py-4 font-semibold">Notes</th>
              <th className="px-5 py-4 text-right font-semibold">Amount</th>
            </tr>
          </thead>

          <tbody>
            {(!invoice || invoice.payments.length === 0) && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  No payments recorded yet.
                </td>
              </tr>
            )}

            {invoice?.payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <td className="px-5 py-4 text-slate-500">
                  {payment.paidAt.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="px-5 py-4">{payment.method || "—"}</td>

                <td className="px-5 py-4 text-slate-500">
                  {payment.notes || "—"}
                </td>

                <td className="px-5 py-4 text-right font-semibold text-green-600">
                  {formatINR(payment.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 max-w-5xl text-center text-sm text-slate-500">
        Thank you for your business. Please pay by the 10th of the following
        month.
      </p>
    </>
  );
}