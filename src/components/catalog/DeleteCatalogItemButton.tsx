"use client";

import { useState, useTransition } from "react";
import { deleteCatalogItemAction } from "@/actions/catalog-actions";
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

type DeleteCatalogItemButtonProps = {
  itemId: number;
  itemName: string;
};

export default function DeleteCatalogItemButton({ itemId, itemName }: DeleteCatalogItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCatalogItemAction(itemId);
        toast.success("Store item removed successfully");
        setIsOpen(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to remove store item";
        toast.error("Failed to remove store item", { description: message });
      }
    });
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <span>
          <RowActionButton label={`Delete ${itemName}`} tone="danger">
            <Trash2 className="h-5 w-5" />
          </RowActionButton>
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {itemName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. If this item has purchase history, it will be deactivated instead of permanently deleted.
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
