import BillingList from "@/components/billing/BillingList";
import BillingMonthSelector from "@/components/billing/BillingMonthSelector";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";

type BillingStatus = "Paid" | "Partial" | "Overdue" | "Unpaid";

type BillingPageProps = {
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

function getStatus({
  totalAmount,
  paidAmount,
  balance,
  dueDate,
}: {
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: Date;
}): BillingStatus {
  const today = new Date();

  if (totalAmount <= 0) {
    return "Paid";
  }

  if (balance <= 0) {
    return "Paid";
  }

  if (dueDate < today && balance > 0) {
    return "Overdue";
  }

  if (paidAmount > 0 && balance > 0) {
    return "Partial";
  }

  return "Unpaid";
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const resolvedSearchParams = await searchParams;
  const { month, year } = getSelectedBillingPeriod(resolvedSearchParams);

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const dueDate = new Date(year, month, 10);

  const players = await prisma.player.findMany({
    orderBy: {
      name: "asc",
    },
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

  const billingPlayers = players.map((player) => {
    const invoice = player.invoices[0];

    const totalAmount = player.purchases.reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0
    );

    const paidAmount =
      invoice?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;

    const balance = Math.max(totalAmount - paidAmount, 0);

    const status = getStatus({
      totalAmount,
      paidAmount,
      balance,
      dueDate,
    });

    return {
      id: player.id,
      name: player.name,
      contact: player.phone || player.email || "No contact",
      batch: player.batch,
      orders: player.purchases.length,
      paidAmount,
      balance,
      status,
    };
  });

  const totalOutstanding = billingPlayers.reduce(
    (sum, player) => sum + player.balance,
    0
  );

  const overdueInvoices = billingPlayers.filter(
    (player) => player.status === "Overdue"
  ).length;

  const pendingInvoices = billingPlayers.filter(
    (player) => player.balance > 0
  ).length;

  const selectedMonthName = new Date(year, month - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );

  return (
    <>
      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <h2 className="text-4xl font-bold">Billing Center</h2>
          <p className="mt-2 text-slate-500">
            Track invoices and record payments for all players.
          </p>
          <p className="mt-2 text-sm font-semibold text-cyan-700">
            Viewing: {selectedMonthName}
          </p>
        </div>

        <BillingMonthSelector month={month} year={year} />
      </div>

      <div className="mb-8 grid max-w-5xl grid-cols-3 gap-5">
        <BillingSummaryCard
          title="Total Outstanding"
          value={formatINR(totalOutstanding)}
          danger={totalOutstanding > 0}
        />
        <BillingSummaryCard title="Overdue Invoices" value={overdueInvoices} />
        <BillingSummaryCard title="Pending Invoices" value={pendingInvoices} />
      </div>

      <BillingList players={billingPlayers} month={month} year={year} />
    </>
  );
}

function BillingSummaryCard({
  title,
  value,
  danger,
}: {
  title: string | number;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${
          danger ? "text-red-600" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}