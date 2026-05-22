"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createPlayerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) {
    throw new Error("Player name is required.");
  }

  await prisma.player.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      notes: notes || null,
    },
  });

  revalidatePath("/players");
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
  revalidatePath("/billing");
  revalidatePath("/");
}