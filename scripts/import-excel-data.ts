import "dotenv/config";
import ExcelJS from "exceljs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

function cleanText(value: unknown, options?: { nullIfOne?: boolean }) {
  if (value === null || value === undefined) return null;

  let text = "";

  if (typeof value === "object" && value !== null) {
    const objectValue = value as {
      text?: string;
      result?: unknown;
      richText?: { text: string }[];
    };

    if (objectValue.text) {
      text = objectValue.text;
    } else if (objectValue.result !== undefined) {
      text = String(objectValue.result);
    } else if (objectValue.richText) {
      text = objectValue.richText.map((part) => part.text).join("");
    } else {
      text = String(value);
    }
  } else {
    text = String(value);
  }

  text = text.trim();

  // Some exported values are wrapped like "2026-05-16T..."
  text = text.replace(/^"+|"+$/g, "").trim();

  if (!text) return null;

  if (options?.nullIfOne && text === "1") {
    return null;
  }

  if (text.toLowerCase() === "null") return null;
  if (text.toLowerCase() === "undefined") return null;

  return text;
}

function parseDate(value: unknown) {
  if (value instanceof Date) return value;

  const cleaned = cleanText(value);

  if (!cleaned) return new Date();

  const date = new Date(cleaned);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function rupeesToPaise(value: unknown) {
  const cleaned = cleanText(value);

  if (!cleaned) return 0;

  const amount = Number.parseFloat(cleaned);

  if (Number.isNaN(amount)) return 0;

  return Math.round(amount * 100);
}

function getCellValue(
  row: ExcelJS.Row,
  headerMap: Map<string, number>,
  columnName: string
) {
  const columnIndex = headerMap.get(columnName);

  if (!columnIndex) return null;

  return row.getCell(columnIndex).value;
}

function getHeaderMap(worksheet: ExcelJS.Worksheet) {
  const headerRow = worksheet.getRow(1);
  const headerMap = new Map<string, number>();

  headerRow.eachCell((cell, columnNumber) => {
    const header = cleanText(cell.value);

    if (header) {
      headerMap.set(header, columnNumber);
    }
  });

  return headerMap;
}

async function importPlayers() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile("import-data/players.xlsx");

  const worksheet = workbook.getWorksheet("players") ?? workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("players.xlsx does not contain a worksheet.");
  }

  const headerMap = getHeaderMap(worksheet);
  let importedCount = 0;

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const id = Number(getCellValue(row, headerMap, "id"));
    const name = cleanText(getCellValue(row, headerMap, "name"));

    if (!id || !name) continue;

    const email = cleanText(getCellValue(row, headerMap, "email"), {
      nullIfOne: true,
    });

    const phone = cleanText(getCellValue(row, headerMap, "phone"), {
      nullIfOne: true,
    });

    const notes = cleanText(getCellValue(row, headerMap, "notes"), {
      nullIfOne: true,
    });

    const createdAt = parseDate(getCellValue(row, headerMap, "created_at"));

    await prisma.player.upsert({
      where: { id },
      update: {
        name: name.trim(),
        email,
        phone,
        notes,
        createdAt,
      },
      create: {
        id,
        name: name.trim(),
        email,
        phone,
        notes,
        createdAt,
      },
    });

    importedCount++;
  }

  await prisma.$executeRawUnsafe(
    "SELECT setval(pg_get_serial_sequence('players', 'id'), (SELECT COALESCE(MAX(id), 1) FROM players));"
  );

  console.log(`Imported/updated ${importedCount} players.`);
}

async function importStoreItems() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile("import-data/store_items.xlsx");

  const worksheet =
    workbook.getWorksheet("store_items") ?? workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("store_items.xlsx does not contain a worksheet.");
  }

  const headerMap = getHeaderMap(worksheet);
  let importedCount = 0;

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const id = Number(getCellValue(row, headerMap, "id"));
    const name = cleanText(getCellValue(row, headerMap, "name"));

    if (!id || !name) continue;

    const defaultPrice = rupeesToPaise(
      getCellValue(row, headerMap, "default_price")
    );

    const stockValue = getCellValue(row, headerMap, "stock");
    const stockText = cleanText(stockValue);

    const currentStock = stockText ? Number(stockText) : null;
    const stockTracked = currentStock !== null && !Number.isNaN(currentStock);

    const createdAt = parseDate(getCellValue(row, headerMap, "created_at"));

    await prisma.storeItem.upsert({
      where: { id },
      update: {
        name: name.trim(),
        defaultPrice,
        stockTracked,
        currentStock: stockTracked ? currentStock : null,
        isActive: true,
        createdAt,
      },
      create: {
        id,
        name: name.trim(),
        defaultPrice,
        stockTracked,
        currentStock: stockTracked ? currentStock : null,
        isActive: true,
        createdAt,
      },
    });

    importedCount++;
  }

  await prisma.$executeRawUnsafe(
    "SELECT setval(pg_get_serial_sequence('store_items', 'id'), (SELECT COALESCE(MAX(id), 1) FROM store_items));"
  );

  console.log(`Imported/updated ${importedCount} store items.`);
}

async function main() {
  console.log("Starting Excel import...");

  await importPlayers();
  await importStoreItems();

  const playerCount = await prisma.player.count();
  const storeItemCount = await prisma.storeItem.count();

  console.log("Import complete.");
  console.log(`Players in database: ${playerCount}`);
  console.log(`Store items in database: ${storeItemCount}`);
}

main()
  .catch((error) => {
    console.error("Import failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });