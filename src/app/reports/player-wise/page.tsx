import Link from "next/link";
import {
  getMonthlyPlayerWiseReport,
  getReportMonthLabel,
  getValidReportPeriod,
  monthNames,
} from "@/lib/monthly-player-report";
import { Card, CardContent } from "@/components/ui/card";
import { Download, IndianRupee, ReceiptText, Users } from "lucide-react";

type PlayerWiseReportPageProps = {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
};

function formatRupees(amountInRupees: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amountInRupees);
}

export default async function PlayerWiseReportPage({
  searchParams,
}: PlayerWiseReportPageProps) {
  const resolvedSearchParams = await searchParams;
  const { month, year } = getValidReportPeriod(resolvedSearchParams);
  const rows = await getMonthlyPlayerWiseReport(month, year);
  const selectedMonthLabel = getReportMonthLabel(month, year);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, index) => currentYear - 3 + index);

  const totalPurchased = rows.reduce((sum, row) => sum + row.totalPurchased, 0);
  const totalPaid = rows.reduce((sum, row) => sum + row.amountPaid, 0);
  const totalOutstanding = rows.reduce(
    (sum, row) => sum + row.outstandingBalance,
    0
  );
  const exportHref = `/api/reports/player-wise/export?month=${month}&year=${year}`;

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Player Wise Monthly Report
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Select a month and year to generate the same player-wise report format
            as the uploaded June sheet, including uninvoiced purchases.
          </p>
          <p className="mt-2 text-sm font-semibold text-primary">
            Viewing: {selectedMonthLabel}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Month
              </label>
              <select
                name="month"
                defaultValue={month}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold outline-none focus:border-cyan-500"
              >
                {monthNames.map((monthName, index) => (
                  <option key={monthName} value={index + 1}>
                    {monthName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Year
              </label>
              <select
                name="year"
                defaultValue={year}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold outline-none focus:border-cyan-500"
              >
                {years.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            </div>

            <button className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-slate-800">
              View Report
            </button>
          </form>

          <Link
            href={exportHref}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-500 bg-cyan-500 px-4 py-2 font-semibold text-white transition hover:bg-cyan-600"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          title="Players in Report"
          value={rows.length}
          icon={<Users className="h-4 w-4" />}
        />
        <SummaryCard
          title="Total Purchased"
          value={formatRupees(totalPurchased)}
          icon={<ReceiptText className="h-4 w-4" />}
        />
        <SummaryCard
          title="Amount Paid"
          value={formatRupees(totalPaid)}
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <SummaryCard
          title="Outstanding"
          value={formatRupees(totalOutstanding)}
          icon={<IndianRupee className="h-4 w-4" />}
          danger={totalOutstanding > 0}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full border-collapse text-sm">
            <thead className="bg-slate-950 text-left text-white">
              <tr>
                <th className="w-56 px-4 py-3 font-bold">Player</th>
                <th className="min-w-[420px] px-4 py-3 font-bold">
                  {monthNames[month - 1]} Purchases (includes uninvoiced)
                </th>
                <th className="px-4 py-3 text-right font-bold">
                  Total Purchased (₹)
                </th>
                <th className="px-4 py-3 text-right font-bold">
                  Amount Paid (₹)
                </th>
                <th className="px-4 py-3 text-right font-bold">
                  Outstanding Balance (₹)
                </th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No purchases or payments found for {selectedMonthLabel}.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.playerId} className="border-t border-slate-200">
                    <td className="align-top px-4 py-3 font-semibold">
                      {row.player}
                    </td>
                    <td className="whitespace-pre-line align-top px-4 py-3 leading-6 text-slate-700">
                      {row.purchasesText || "—"}
                    </td>
                    <td className="align-top px-4 py-3 text-right font-semibold">
                      {row.totalPurchased}
                    </td>
                    <td className="align-top px-4 py-3 text-right font-semibold">
                      {row.amountPaid}
                    </td>
                    <td
                      className={`align-top px-4 py-3 text-right font-bold ${
                        row.outstandingBalance > 0
                          ? "text-red-600"
                          : "text-cyan-600"
                      }`}
                    >
                      {row.outstandingBalance}
                    </td>
                    <td className="align-top px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
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

function StatusBadge({ status }: { status: "PAID" | "PARTIAL" | "UNPAID" }) {
  if (status === "PAID") {
    return (
      <span className="rounded-md bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
        PAID
      </span>
    );
  }

  if (status === "PARTIAL") {
    return (
      <span className="rounded-md bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
        PARTIAL
      </span>
    );
  }

  return (
    <span className="rounded-md bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      UNPAID
    </span>
  );
}
