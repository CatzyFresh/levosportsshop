"use client";

import { useState, useTransition } from "react";
import { deletePaymentAction } from "@/actions/billing-actions";
import { Trash2 } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type DeletePaymentButtonProps = {
  paymentId: number;
  playerId: number;
};

export default function DeletePaymentButton({ paymentId, playerId }: DeletePaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deletePaymentAction({ paymentId, playerId });
        toast.success("Payment recorded successfully");
        setIsOpen(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to record payment";
        toast.error("Failed to record payment", { description: message });
      }
    });
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <span>
          <RowActionButton label="Delete payment" tone="danger">
            <Trash2 className="h-5 w-5" />
          </RowActionButton>
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The bill balance will increase again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="rounded-xl">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="rounded-xl font-semibold">
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
