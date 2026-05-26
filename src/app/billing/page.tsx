import BillingList from "@/components/billing/BillingList";
import BillingMonthSelector from "@/components/billing/BillingMonthSelector";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, IndianRupee } from "lucide-react";

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

  return {
    month:
      selectedMonth >= 1 && selectedMonth <= 12
        ? selectedMonth
        : today.getMonth() + 1,
    year:
      selectedYear >= 2020 && selectedYear <= today.getFullYear() + 2
        ? selectedYear
        : today.getFullYear(),
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

  if (totalAmount <= 0) return "Paid";
  if (balance <= 0) return "Paid";
  if (dueDate < today && balance > 0) return "Overdue";
  if (paidAmount > 0 && balance > 0) return "Partial";

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
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Billing Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track invoices and record payments for all players.
          </p>
          <p className="mt-2 text-sm font-semibold text-primary">
            Viewing: {selectedMonthName}
          </p>
        </div>

        <BillingMonthSelector month={month} year={year} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <SummaryCard
          title="Total Outstanding"
          value={formatINR(totalOutstanding)}
          icon={<IndianRupee className="h-4 w-4" />}
          danger={totalOutstanding > 0}
        />

        <SummaryCard
          title="Overdue Invoices"
          value={overdueInvoices}
          icon={<AlertTriangle className="h-4 w-4" />}
          danger={overdueInvoices > 0}
        />

        <SummaryCard
          title="Pending Invoices"
          value={pendingInvoices}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <BillingList players={billingPlayers} month={month} year={year} />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  danger,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Card className={danger ? "border-red-200 bg-red-50/50" : ""}>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </div>

          <div className={danger ? "text-red-600" : "text-muted-foreground"}>
            {icon}
          </div>
        </div>

        <div
          className={`text-xl font-bold ${
            danger ? "text-red-600" : "text-foreground"
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}