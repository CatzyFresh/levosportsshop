"use client";

import { useTransition } from "react";
import { deletePaymentAction } from "@/actions/billing-actions";
import { Trash2 } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";

type DeletePaymentButtonProps = {
  paymentId: number;
  playerId: number;
};

export default function DeletePaymentButton({
  paymentId,
  playerId,
}: DeletePaymentButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment? The bill balance will increase again."
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deletePaymentAction({
          paymentId,
          playerId,
        });
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Something went wrong while deleting the payment."
        );
      }
    });
  }

  return (
        <RowActionButton
      label="Delete payment"
      tone="danger"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-5 w-5" />
    </RowActionButton>
  );
}