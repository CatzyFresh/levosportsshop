import prisma from "@/lib/prisma";

export type PlayerWiseReportStatus = "PAID" | "PARTIAL" | "UNPAID";

export type PlayerWiseReportRow = {
  playerId: number;
  player: string;
  purchasesText: string;
  totalPurchased: number;
  amountPaid: number;
  outstandingBalance: number;
  status: PlayerWiseReportStatus;
};

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function paiseToRupees(amountInPaise: number) {
  return amountInPaise / 100;
}

export function getValidReportPeriod(searchParams: {
  month?: string | null;
  year?: string | null;
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

export function getReportMonthLabel(month: number, year: number) {
  return `${monthNames[month - 1]} ${year}`;
}

export async function getMonthlyPlayerWiseReport(month: number, year: number) {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

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
        orderBy: [
          { purchaseDate: "asc" },
          { id: "asc" },
        ],
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

  return players
    .map<PlayerWiseReportRow>((player) => {
      const invoice = player.invoices[0];
      const totalPurchasedInPaise = player.purchases.reduce(
        (sum, purchase) => sum + purchase.totalAmount,
        0
      );
      const amountPaidInPaise =
        invoice?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;
      const outstandingBalanceInPaise = Math.max(
        totalPurchasedInPaise - amountPaidInPaise,
        0
      );

      const totalPurchased = paiseToRupees(totalPurchasedInPaise);
      const amountPaid = paiseToRupees(amountPaidInPaise);
      const outstandingBalance = paiseToRupees(outstandingBalanceInPaise);

      const status: PlayerWiseReportStatus =
        totalPurchasedInPaise <= 0 || outstandingBalanceInPaise <= 0
          ? "PAID"
          : amountPaidInPaise > 0
            ? "PARTIAL"
            : "UNPAID";

      const purchasesText = player.purchases
        .map((purchase) => {
          const purchaseDate = purchase.purchaseDate.toISOString().slice(0, 10);
          const purchaseAmount = paiseToRupees(purchase.totalAmount);
          return `${purchaseDate} - ${purchase.itemName} (₹${purchaseAmount})`;
        })
        .join("\n");

      return {
        playerId: player.id,
        player: player.name,
        purchasesText,
        totalPurchased,
        amountPaid,
        outstandingBalance,
        status,
      };
    })
    .filter((row) => row.totalPurchased > 0 || row.amountPaid > 0);
}
