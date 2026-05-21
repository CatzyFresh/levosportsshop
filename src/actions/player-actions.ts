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