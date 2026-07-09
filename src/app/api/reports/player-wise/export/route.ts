import { NextResponse } from "next/server";
import * as ExcelJS from "exceljs";
import {
  getMonthlyPlayerWiseReport,
  getReportMonthLabel,
  getValidReportPeriod,
  monthNames,
} from "@/lib/monthly-player-report";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { month, year } = getValidReportPeriod({
    month: searchParams.get("month"),
    year: searchParams.get("year"),
  });

  const rows = await getMonthlyPlayerWiseReport(month, year);
  const monthLabel = getReportMonthLabel(month, year);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Levo Sports Shop";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`${monthNames[month - 1]} Player Summary`);

  worksheet.columns = [
    { header: "Player", key: "player", width: 28 },
    {
      header: `${monthNames[month - 1]} Purchases (includes uninvoiced)`,
      key: "purchasesText",
      width: 58,
    },
    { header: "Total Purchased (₹)", key: "totalPurchased", width: 20 },
    { header: "Amount Paid (₹)", key: "amountPaid", width: 18 },
    { header: "Outstanding Balance (₹)", key: "outstandingBalance", width: 24 },
    { header: "Status", key: "status", width: 14 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111827" },
  };
  headerRow.alignment = { vertical: "middle", wrapText: true };
  headerRow.height = 24;

  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
      cell.alignment = {
        vertical: "top",
        wrapText: true,
      };
    });

    if (rowNumber > 1) {
      row.height = Math.max(22, String(row.getCell(2).value ?? "").split("\n").length * 18);
    }
  });

  worksheet.getColumn(3).numFmt = "₹#,##0";
  worksheet.getColumn(4).numFmt = "₹#,##0";
  worksheet.getColumn(5).numFmt = "₹#,##0";
  worksheet.getColumn(3).alignment = { horizontal: "right", vertical: "top" };
  worksheet.getColumn(4).alignment = { horizontal: "right", vertical: "top" };
  worksheet.getColumn(5).alignment = { horizontal: "right", vertical: "top" };

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: "A1",
    to: "F1",
  };

  const totalRowNumber = worksheet.rowCount + 2;
  worksheet.getCell(`A${totalRowNumber}`).value = `${monthLabel} Total`;
  worksheet.getCell(`A${totalRowNumber}`).font = { bold: true };
  worksheet.getCell(`C${totalRowNumber}`).value = rows.reduce(
    (sum, row) => sum + row.totalPurchased,
    0
  );
  worksheet.getCell(`D${totalRowNumber}`).value = rows.reduce(
    (sum, row) => sum + row.amountPaid,
    0
  );
  worksheet.getCell(`E${totalRowNumber}`).value = rows.reduce(
    (sum, row) => sum + row.outstandingBalance,
    0
  );

  ["C", "D", "E"].forEach((column) => {
    const cell = worksheet.getCell(`${column}${totalRowNumber}`);
    cell.font = { bold: true };
    cell.numFmt = "₹#,##0";
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `Levo_${monthNames[month - 1]}_${year}_Player_Wise_Report.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
