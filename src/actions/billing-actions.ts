"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

function getBillingDateRange(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return {
    startDate,
    endDate,
  };
}

function getDueDate(year: number, month: number) {
  // If bill month is May, due date is June 10
  return new Date(year, month, 10);
}

function getInvoiceStatus(totalAmount: number, paidAmount: number) {
  const balance = Math.max(totalAmount - paidAmount, 0);

  if (totalAmount > 0 && balance === 0) {
    return "PAID" as const;
  }

  if (paidAmount > 0 && balance > 0) {
    return "PARTIAL" as const;
  }

  return "UNPAID" as const;
}

export async function recordPaymentAction({
  playerId,
  month,
  year,
  formData,
}: {
  playerId: number;
  month: number;
  year: number;
  formData: FormData;
}) {
  const amountInput = String(formData.get("amount") || "").trim();
  const amount = Number(amountInput);

  const paidAtInput = String(formData.get("paidAt") || "").trim();
  const method = String(formData.get("method") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!playerId || Number.isNaN(playerId)) {
    throw new Error("Invalid player.");
  }

  if (amountInput === "" || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than 0.");
  }

  const amountInPaise = Math.round(amount * 100);

  const paidAt = paidAtInput
    ? new Date(`${paidAtInput}T00:00:00`)
    : new Date();

  const { startDate, endDate } = getBillingDateRange(year, month);

  await prisma.$transaction(async (tx) => {
    const player = await tx.player.findUnique({
      where: {
        id: playerId,
      },
    });

    if (!player) {
      throw new Error("Player not found.");
    }

    const purchases = await tx.purchase.findMany({
      where: {
        playerId,
        purchaseDate: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    const totalAmount = purchases.reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0
    );

    if (totalAmount <= 0) {
      throw new Error("No purchases found for this billing month.");
    }

    const invoice = await tx.invoice.upsert({
      where: {
        playerId_month_year: {
          playerId,
          month,
          year,
        },
      },
      update: {
        totalAmount,
        dueDate: getDueDate(year, month),
      },
      create: {
        playerId,
        month,
        year,
        dueDate: getDueDate(year, month),
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        status: "UNPAID",
      },
    });

    await tx.purchase.updateMany({
      where: {
        playerId,
        purchaseDate: {
          gte: startDate,
          lt: endDate,
        },
      },
      data: {
        invoiceId: invoice.id,
      },
    });

    const existingPayments = await tx.payment.aggregate({
      where: {
        invoiceId: invoice.id,
      },
      _sum: {
        amount: true,
      },
    });

    const alreadyPaid = existingPayments._sum.amount ?? 0;
    const currentBalance = Math.max(totalAmount - alreadyPaid, 0);

    if (amountInPaise > currentBalance) {
      throw new Error(
        `Payment is higher than balance. Current balance is ₹${(
          currentBalance / 100
        ).toFixed(2)}.`
      );
    }

    await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: amountInPaise,
        paidAt,
        method: method || null,
        notes: notes || null,
      },
    });

    const paidAmount = alreadyPaid + amountInPaise;
    const balance = Math.max(totalAmount - paidAmount, 0);
    const status = getInvoiceStatus(totalAmount, paidAmount);

    await tx.invoice.update({
      where: {
        id: invoice.id,
      },
      data: {
        totalAmount,
        paidAmount,
        balance,
        status,
      },
    });
  });

  revalidatePath("/billing");
  revalidatePath(`/billing/${playerId}`);
  revalidatePath(`/players/${playerId}`);
  revalidatePath("/players");
}
export async function updatePaymentAction({
  paymentId,
  playerId,
  formData,
}: {
  paymentId: number;
  playerId: number;
  formData: FormData;
}) {
  if (!paymentId || Number.isNaN(paymentId)) {
    throw new Error("Invalid payment.");
  }

  if (!playerId || Number.isNaN(playerId)) {
    throw new Error("Invalid player.");
  }

  const amountInput = String(formData.get("amount") || "").trim();
  const amount = Number(amountInput);

  const paidAtInput = String(formData.get("paidAt") || "").trim();
  const method = String(formData.get("method") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (amountInput === "" || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Payment amount must be greater than 0.");
  }

  const amountInPaise = Math.round(amount * 100);

  const paidAt = paidAtInput
    ? new Date(`${paidAtInput}T00:00:00`)
    : new Date();

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        invoice: true,
      },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.invoice.playerId !== playerId) {
      throw new Error("This payment does not belong to this player.");
    }

    const otherPayments = await tx.payment.aggregate({
      where: {
        invoiceId: payment.invoiceId,
        id: {
          not: paymentId,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const otherPaidAmount = otherPayments._sum.amount ?? 0;
    const newPaidAmount = otherPaidAmount + amountInPaise;

    if (newPaidAmount > payment.invoice.totalAmount) {
      throw new Error(
        `Payment total cannot exceed bill total. Maximum allowed amount is ₹${(
          (payment.invoice.totalAmount - otherPaidAmount) /
          100
        ).toFixed(2)}.`
      );
    }

    await tx.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        amount: amountInPaise,
        paidAt,
        method: method || null,
        notes: notes || null,
      },
    });

    const balance = Math.max(payment.invoice.totalAmount - newPaidAmount, 0);
    const status = getInvoiceStatus(payment.invoice.totalAmount, newPaidAmount);

    await tx.invoice.update({
      where: {
        id: payment.invoiceId,
      },
      data: {
        paidAmount: newPaidAmount,
        balance,
        status,
      },
    });
  });

  revalidatePath("/billing");
  revalidatePath(`/billing/${playerId}`);
  revalidatePath(`/players/${playerId}`);
  revalidatePath("/players");
  revalidatePath("/");
}

export async function deletePaymentAction({
  paymentId,
  playerId,
}: {
  paymentId: number;
  playerId: number;
}) {
  if (!paymentId || Number.isNaN(paymentId)) {
    throw new Error("Invalid payment.");
  }

  if (!playerId || Number.isNaN(playerId)) {
    throw new Error("Invalid player.");
  }

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        invoice: true,
      },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.invoice.playerId !== playerId) {
      throw new Error("This payment does not belong to this player.");
    }

    await tx.payment.delete({
      where: {
        id: paymentId,
      },
    });

    const remainingPayments = await tx.payment.aggregate({
      where: {
        invoiceId: payment.invoiceId,
      },
      _sum: {
        amount: true,
      },
    });

    const paidAmount = remainingPayments._sum.amount ?? 0;
    const balance = Math.max(payment.invoice.totalAmount - paidAmount, 0);
    const status = getInvoiceStatus(payment.invoice.totalAmount, paidAmount);

    await tx.invoice.update({
      where: {
        id: payment.invoiceId,
      },
      data: {
        paidAmount,
        balance,
        status,
      },
    });
  });

  revalidatePath("/billing");
  revalidatePath(`/billing/${playerId}`);
  revalidatePath(`/players/${playerId}`);
  revalidatePath("/players");
  revalidatePath("/");
}