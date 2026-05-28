"use client";

import { useState, useTransition } from "react";
import { deletePurchaseAction } from "@/actions/purchase-actions";
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

type DeletePurchaseButtonProps = {
  purchaseId: number;
  playerId: number;
};

export default function DeletePurchaseButton({
  purchaseId,
  playerId,
}: DeletePurchaseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deletePurchaseAction({ purchaseId, playerId });
        toast.success("Purchase deleted successfully");
        setIsOpen(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete purchase";
        toast.error("Failed to delete purchase", { description: message });
      }
    });
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <span>
          <RowActionButton label="Delete purchase" tone="danger">
            <Trash2 className="h-5 w-5" />
          </RowActionButton>
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this purchase?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Deleting this purchase also updates billing and stock.
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
