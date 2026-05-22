"use client";

import { useTransition } from "react";
import { deletePurchaseAction } from "@/actions/purchase-actions";

type DeletePurchaseButtonProps = {
  purchaseId: number;
  playerId: number;
};

export default function DeletePurchaseButton({
  purchaseId,
  playerId,
}: DeletePurchaseButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this purchase? This will also update billing and stock."
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deletePurchaseAction({
          purchaseId,
          playerId,
        });
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Something went wrong while deleting the purchase."
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}