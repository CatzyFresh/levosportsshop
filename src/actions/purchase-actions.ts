"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createPurchaseAction(playerId: number, formData: FormData) {
  const storeItemIdInput = String(formData.get("storeItemId") || "").trim();
  const itemName = String(formData.get("itemName") || "").trim();

  const unitPriceInput = String(formData.get("unitPrice") || "").trim();
  const unitPrice = Number(unitPriceInput);

  const quantityInput = String(formData.get("quantity") || "").trim();
  const quantity = Number(quantityInput);

  const purchaseDateInput = String(formData.get("purchaseDate") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!playerId || Number.isNaN(playerId)) {
    throw new Error("Invalid player.");
  }

  if (!itemName) {
    throw new Error("Item name is required.");
  }

  if (unitPriceInput === "" || Number.isNaN(unitPrice) || unitPrice < 0) {
    throw new Error("Unit price must be 0 or more.");
  }

  if (!quantity || Number.isNaN(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const storeItemId = storeItemIdInput ? Number(storeItemIdInput) : null;

  if (storeItemId !== null && Number.isNaN(storeItemId)) {
    throw new Error("Invalid store item.");
  }

  const unitPriceInPaise = Math.round(unitPrice * 100);
  const totalAmount = unitPriceInPaise * quantity;

  const purchaseDate = purchaseDateInput
    ? new Date(`${purchaseDateInput}T00:00:00`)
    : new Date();

  await prisma.$transaction(async (tx) => {
    if (storeItemId !== null) {
      const storeItem = await tx.storeItem.findUnique({
        where: {
          id: storeItemId,
        },
      });

      if (!storeItem) {
        throw new Error("Selected store item was not found.");
      }

      if (storeItem.stockTracked) {
        const currentStock = storeItem.currentStock ?? 0;

        if (currentStock < quantity) {
          throw new Error(
            `Not enough stock. Available stock: ${currentStock}.`
          );
        }

        await tx.storeItem.update({
          where: {
            id: storeItemId,
          },
          data: {
            currentStock: currentStock - quantity,
          },
        });
      }
    }

    await tx.purchase.create({
      data: {
        playerId,
        storeItemId,
        itemName,
        unitPrice: unitPriceInPaise,
        quantity,
        totalAmount,
        purchaseDate,
        notes: notes || null,
      },
    });
  });

  revalidatePath("/players");
  revalidatePath(`/players/${playerId}`);
  revalidatePath("/store-catalog");
}

function getInvoiceStatus(totalAmount: number, paidAmount: number) {
  const balance = Math.max(totalAmount - paidAmount, 0);

  if (totalAmount <= 0) {
    return "PAID" as const;
  }

  if (balance === 0) {
    return "PAID" as const;
  }

  if (paidAmount > 0 && balance > 0) {
    return "PARTIAL" as const;
  }

  return "UNPAID" as const;
}

export async function deletePurchaseAction({
  purchaseId,
  playerId,
}: {
  purchaseId: number;
  playerId: number;
}) {
  if (!purchaseId || Number.isNaN(purchaseId)) {
    throw new Error("Invalid purchase.");
  }

  if (!playerId || Number.isNaN(playerId)) {
    throw new Error("Invalid player.");
  }

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: {
        id: purchaseId,
      },
      include: {
        storeItem: true,
      },
    });

    if (!purchase) {
      throw new Error("Purchase not found.");
    }

    if (purchase.playerId !== playerId) {
      throw new Error("This purchase does not belong to this player.");
    }

    const month = purchase.purchaseDate.getMonth() + 1;
    const year = purchase.purchaseDate.getFullYear();

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);

    const invoice = await tx.invoice.findUnique({
      where: {
        playerId_month_year: {
          playerId,
          month,
          year,
        },
      },
      include: {
        payments: true,
      },
    });

    const remainingPurchases = await tx.purchase.findMany({
      where: {
        playerId,
        id: {
          not: purchaseId,
        },
        purchaseDate: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    });

    const remainingTotalAmount = remainingPurchases.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    const paidAmount =
      invoice?.payments.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;

    if (invoice && paidAmount > remainingTotalAmount) {
      throw new Error(
        "Cannot delete this purchase because recorded payments would become higher than the new bill total. Adjust payments first."
      );
    }

    await tx.purchase.delete({
      where: {
        id: purchaseId,
      },
    });

    if (purchase.storeItemId && purchase.storeItem?.stockTracked) {
      await tx.storeItem.update({
        where: {
          id: purchase.storeItemId,
        },
        data: {
          currentStock: (purchase.storeItem.currentStock ?? 0) + purchase.quantity,
        },
      });
    }

    if (invoice) {
      const balance = Math.max(remainingTotalAmount - paidAmount, 0);

      await tx.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          totalAmount: remainingTotalAmount,
          paidAmount,
          balance,
          status: getInvoiceStatus(remainingTotalAmount, paidAmount),
        },
      });
    }
  });

  revalidatePath("/players");
  revalidatePath(`/players/${playerId}`);
  revalidatePath("/billing");
  revalidatePath(`/billing/${playerId}`);
  revalidatePath("/store-catalog");
}