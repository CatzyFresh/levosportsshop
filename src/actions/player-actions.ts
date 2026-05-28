"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";

export async function createPlayerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const batch = String(formData.get("batch") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    throw new Error("Player name is required.");
  }

  await prisma.player.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      batch: batch || null,
      notes: notes || null,
    },
  });

  revalidatePath("/players");
  revalidateTag("players-page-one", "max");
}
export async function deletePlayerAction(playerId: number) {
  if (!playerId || Number.isNaN(playerId)) {
    throw new Error("Invalid player.");
  }

  const player = await prisma.player.findUnique({
    where: {
      id: playerId,
    },
    include: {
      purchases: true,
      invoices: true,
    },
  });

  if (!player) {
    throw new Error("Player not found.");
  }

  if (player.purchases.length > 0 || player.invoices.length > 0) {
    throw new Error(
      "This player has purchase or billing history. Delete their purchases/payments first, or archive the player later."
    );
  }

  await prisma.player.delete({
    where: {
      id: playerId,
    },
  });

  revalidatePath("/players");
  revalidateTag("players-page-one", "max");
  revalidatePath("/billing");
  revalidatePath("/");
}
export async function updatePlayerAction(playerId: number, formData: FormData) {
  if (!playerId || Number.isNaN(playerId)) {
    throw new Error("Invalid player.");
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const batch = String(formData.get("batch") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    throw new Error("Player name is required.");
  }

  await prisma.player.update({
    where: {
      id: playerId,
    },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      batch: batch || null,
      notes: notes || null,
    },
  });

  revalidatePath("/players");
  revalidateTag("players-page-one", "max");
  revalidatePath(`/players/${playerId}`);
  revalidatePath("/billing");
  revalidatePath(`/billing/${playerId}`);
  revalidatePath("/");
}