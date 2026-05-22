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
export async function deleteCatalogItemAction(itemId: number) {
  if (!itemId || Number.isNaN(itemId)) {
    throw new Error("Invalid store item.");
  }

  const storeItem = await prisma.storeItem.findUnique({
    where: {
      id: itemId,
    },
    include: {
      purchases: true,
    },
  });

  if (!storeItem) {
    throw new Error("Store item not found.");
  }

  if (storeItem.purchases.length > 0) {
    await prisma.storeItem.update({
      where: {
        id: itemId,
      },
      data: {
        isActive: false,
      },
    });
  } else {
    await prisma.storeItem.delete({
      where: {
        id: itemId,
      },
    });
  }

  revalidatePath("/store-catalog");
  revalidatePath("/players");
  revalidatePath("/billing");
  revalidatePath("/");
}
export async function updateCatalogItemAction(
  itemId: number,
  formData: FormData
) {
  if (!itemId || Number.isNaN(itemId)) {
    throw new Error("Invalid store item.");
  }

  const name = String(formData.get("name") || "").trim();

  const defaultPriceInput = String(formData.get("defaultPrice") || "").trim();
  const defaultPrice = Number(defaultPriceInput);

  const stockTracked = formData.get("stockTracked") === "on";
  const currentStockInput = String(formData.get("currentStock") || "").trim();

  if (!name) {
    throw new Error("Item name is required.");
  }

  if (
    defaultPriceInput === "" ||
    Number.isNaN(defaultPrice) ||
    defaultPrice < 0
  ) {
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

  await prisma.storeItem.update({
    where: {
      id: itemId,
    },
    data: {
      name,
      defaultPrice: Math.round(defaultPrice * 100),
      stockTracked,
      currentStock,
    },
  });

  revalidatePath("/store-catalog");
  revalidatePath("/players");
  revalidatePath("/billing");
  revalidatePath("/");
}