import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";

import { recordPaymentAction } from "@/actions/billing-actions";

import RecordPaymentDialog from "@/components/payments/RecordPaymentDialog";
import EditPaymentDialog from "@/components/payments/EditPaymentDialog";
import DeletePaymentButton from "@/components/payments/DeletePaymentButton";
import BillActionButtons from "@/components/billing/BillActionButtons";
import BillingMonthSelector from "@/components/billing/BillingMonthSelector";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  IndianRupee,
  MessageSquare,
  ReceiptText,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type BillingPlayerPageProps = {
  params: Promise<{
    playerId: string;
  }>;
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
};

type BillingStatus = "Paid" | "Partial" | "Overdue" | "Pending";

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

function getBillingStatus({
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

  if (totalAmount <= 0 || balance <= 0) return "Paid";
  if (paidAmount > 0 && balance > 0) return "Partial";
  if (dueDate < today && balance > 0) return "Overdue";

  return "Pending";
}

function normalizeIndianPhone(phone: string | null) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  return digits;
}

function getWhatsAppReminderUrl({
  playerName,
  playerPhone,
  billingMonth,
  totalAmount,
  paidAmount,
  balance,
  dueDateText,
}: {
  playerName: string;
  playerPhone: string | null;
  billingMonth: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDateText: string;
}) {
  const message = `Levo Sports Payment Reminder

Player: ${playerName}
Month: ${billingMonth}

Total: ${formatINR(totalAmount)}
Paid: ${formatINR(paidAmount)}
Balance: ${formatINR(balance)}

Due Date: ${dueDateText}

Please clear the pending balance.

Thank you,
Levo Sports`;

  const encodedMessage = encodeURIComponent(message);
  const normalizedPhone = normalizeIndianPhone(playerPhone);

  return normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
}

export default async function BillingPlayerPage({
  params,
  searchParams,
}: BillingPlayerPageProps) {
  const { playerId } = await params;
  const resolvedSearchParams = await searchParams;

  const id = Number(playerId);

  if (!id || Number.isNaN(id)) {
    notFound();
  }

  const { month, year } = getSelectedBillingPeriod(resolvedSearchParams);

  const today = new Date();
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);
  const dueDate = new Date(year, month, 10);

  const player = await prisma.player.findUnique({
    where: {
      id,
    },
    include: {
      purchases: {
        where: {
          purchaseDate: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
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
          payments: {
            orderBy: {
              paidAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!player) {
    notFound();
  }

  const invoice = player.invoices[0];

  const totalAmount = player.purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );

  const paidAmount =
    invoice?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;

  const balance = Math.max(totalAmount - paidAmount, 0);

  const status = getBillingStatus({
    totalAmount,
    paidAmount,
    balance,
    dueDate,
  });

  const billingMonth = monthStart.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const dueDateText = dueDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statementDate = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reminderUrl = getWhatsAppReminderUrl({
    playerName: player.name,
    playerPhone: player.phone,
    billingMonth,
    totalAmount,
    paidAmount,
    balance,
    dueDateText,
  });

  const safePlayerId = player.id;
  const safeBalance = balance;

  async function markFullyPaidAction() {
    "use server";

    if (safeBalance <= 0) return;

    const formData = new FormData();
    formData.set("amount", String(safeBalance / 100));
    formData.set("paidAt", new Date().toISOString().split("T")[0]);
    formData.set("method", "Marked Fully Paid");
    formData.set("notes", "Marked fully paid from bill page.");

    await recordPaymentAction({
      playerId: safePlayerId,
      month,
      year,
      formData,
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-500 print:max-w-none print:space-y-4">
      <div className="space-y-5 print:hidden">
        <Button asChild variant="ghost" className="px-0 hover:bg-transparent">
          <Link href="/billing" className="text-sm font-semibold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Billing
          </Link>
        </Button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                Bill
              </h1>

              <StatusBadge status={status} />
            </div>

            <p className="mt-1 text-lg font-medium text-muted-foreground">
              {player.name}
            </p>
          </div>

          <BillingMonthSelector month={month} year={year} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BillActionButtons
            playerName={player.name}
            playerPhone={player.phone}
            billingMonth={billingMonth}
            totalAmount={totalAmount}
            paidAmount={paidAmount}
            balance={balance}
            dueDateText={dueDateText}
          />

          <RecordPaymentDialog
            playerId={player.id}
            playerName={player.name}
            currentBalance={balance}
            month={month}
            year={year}
          />
        </div>
      </div>

      <Card className="overflow-hidden border-cyan-200 bg-cyan-50/70 shadow-sm transition-all duration-300 hover:shadow-md print:border-slate-200 print:bg-white print:shadow-none">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <BillMetric
              label="Total"
              value={formatINR(totalAmount)}
              icon={<Wallet className="h-4 w-4 text-slate-600" />}
            />

            <BillMetric
              label="Paid"
              value={formatINR(paidAmount)}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              valueClassName="text-emerald-600"
            />

            <BillMetric
              label="Balance"
              value={formatINR(balance)}
              icon={<IndianRupee className="h-4 w-4 text-red-500" />}
              valueClassName={balance > 0 ? "text-red-600" : "text-emerald-600"}
            />

            <BillMetric
              label="Due Date"
              value={dueDateText}
              icon={<Calendar className="h-4 w-4 text-cyan-500" />}
              valueClassName="text-cyan-600"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_12px_35px_rgb(15,23,42,0.08)] print:shadow-none">
        <CardContent className="p-0">
          <div className="bg-white px-6 py-8 text-center">
            <h2 className="text-3xl font-bold tracking-[0.18em] text-slate-950 md:text-4xl">
              LEVO SPORTS
            </h2>

            <p className="mt-2 text-2xl font-semibold text-slate-900">
              Monthly Statement
            </p>

            <p className="mt-4 text-xl font-medium text-muted-foreground">
              {billingMonth}
            </p>
          </div>

          <div className="border-t border-slate-200 px-6 py-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Bill To
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {player.name}
                </p>

                {player.phone && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {player.phone}
                  </p>
                )}

                {player.email && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {player.email}
                  </p>
                )}
              </div>

              <div className="md:text-right">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Statement Date
                </p>

                <p className="mt-2 text-lg font-medium text-slate-950">
                  {statementDate}
                </p>

                <p className="mt-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>

                <div className="mt-2 flex md:justify-end">
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            {player.purchases.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-muted-foreground">
                No purchases recorded for {billingMonth}.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                {player.purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 transition-colors duration-300 last:border-b-0 hover:bg-cyan-50/40 print:hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-950">
                        {purchase.itemName}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {purchase.purchaseDate.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {purchase.quantity} ×{" "}
                        {formatINR(
                          Math.round(purchase.totalAmount / purchase.quantity)
                        )}
                      </p>

                      {purchase.notes && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {purchase.notes}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 text-right font-semibold text-slate-950">
                      {formatINR(purchase.totalAmount)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
              <StatementLine label="Subtotal" value={formatINR(totalAmount)} />

              <StatementLine
                label="Amount Paid"
                value={`- ${formatINR(paidAmount)}`}
                valueClassName="text-emerald-600"
              />

              <StatementLine
                label="Balance Due"
                value={formatINR(balance)}
                labelClassName="text-base font-semibold text-slate-950"
                valueClassName={`text-base font-bold ${
                  balance > 0 ? "text-red-600" : "text-emerald-600"
                }`}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 print:hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100 hover:text-emerald-800 hover:shadow-md"
              >
                <a href={reminderUrl} target="_blank" rel="noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Reminder
                </a>
              </Button>

              <form action={markFullyPaidAction}>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={balance <= 0}
                  className="rounded-xl border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Fully Paid
                </Button>
              </form>

              <RecordPaymentDialog
                playerId={player.id}
                playerName={player.name}
                currentBalance={balance}
                month={month}
                year={year}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm print:hidden">
        <CardContent className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-950">
              Payment History
            </h2>

            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
              {invoice?.payments.length ?? 0} payments
            </Badge>
          </div>

          {!invoice || invoice.payments.length === 0 ? (
            <EmptyState>No payments recorded yet.</EmptyState>
          ) : (
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50/40 hover:shadow-sm md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-950">
                      {formatINR(payment.amount)}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span>{payment.paidAt.toLocaleDateString("en-IN")}</span>

                      {payment.method && (
                        <>
                          <span>•</span>
                          <span>{payment.method}</span>
                        </>
                      )}
                    </div>

                    {payment.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {payment.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Received
                    </Badge>

                    <div className="rounded-full transition-all duration-300 hover:bg-blue-50 hover:shadow-sm [&_button]:h-9 [&_button]:w-9 [&_button]:rounded-full [&_button]:text-slate-500 [&_button:hover]:text-blue-600">
                      <EditPaymentDialog
                        playerId={player.id}
                        invoiceTotalAmount={totalAmount}
                        invoicePaidAmount={paidAmount}
                        payment={{
                          id: payment.id,
                          amount: payment.amount,
                          paidAt: payment.paidAt.toISOString().split("T")[0],
                          method: payment.method,
                          notes: payment.notes,
                        }}
                      />
                    </div>

                    <div className="rounded-full transition-all duration-300 hover:bg-red-50 hover:shadow-sm [&_button]:h-9 [&_button]:w-9 [&_button]:rounded-full [&_button]:text-red-500 [&_button:hover]:text-red-600">
                      <DeletePaymentButton
                        paymentId={payment.id}
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
    </div>
  );
}

function StatusBadge({ status }: { status: BillingStatus }) {
  const styles: Record<BillingStatus, string> = {
    Paid: "border-emerald-200 bg-emerald-100 text-emerald-700",
    Partial: "border-blue-200 bg-blue-100 text-blue-700",
    Overdue: "border-red-200 bg-red-100 text-red-700",
    Pending: "border-orange-200 bg-orange-100 text-orange-700",
  };

  return (
    <Badge
      variant="outline"
      className={`rounded-lg px-3 py-1 text-sm font-semibold ${styles[status]}`}
    >
      <ReceiptText className="mr-1.5 h-3.5 w-3.5" />
      {status}
    </Badge>
  );
}

function BillMetric({
  label,
  value,
  icon,
  valueClassName = "",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>

        {icon}
      </div>

      <p
        className={`truncate text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatementLine({
  label,
  value,
  labelClassName = "",
  valueClassName = "",
}: {
  label: string;
  value: string;
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className={`text-muted-foreground ${labelClassName}`}>{label}</p>
      <p className={`font-medium text-slate-700 ${valueClassName}`}>{value}</p>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}