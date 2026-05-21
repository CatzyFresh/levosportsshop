"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createCatalogItemAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();

  const defaultPriceInput = String(formData.get("defaultPrice") || "").trim();
  const defaultPrice = Number(defaultPriceInput);

  const stockTracked = formData.get("stockTracked") === "on";
  const currentStockInput = String(formData.get("currentStock") || "").trim();

  if (!name) {
    throw new Error("Item name is required.");
  }

  if (defaultPriceInput === "" || Number.isNaN(defaultPrice) || defaultPrice < 0) {
    throw new Error("Default price must be 0 or more.");
  }

  let currentStock: number | null = null;

  if (stockTracked) {
    currentStock = Number(currentStockInput || 0);

    if (Number.isNaN(currentStock)) {
      throw new Error("Current stock must be a valid number.");
    }

    if (currentStock < 0) {
      throw new Error("Current stock cannot be negative.");
    }
  }

  await prisma.storeItem.create({
    data: {
      name,
      defaultPrice: Math.round(defaultPrice * 100),
      stockTracked,
      currentStock,
      isActive: true,
    },
  });

  revalidatePath("/store-catalog");
}