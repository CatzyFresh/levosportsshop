"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCatalogItemAction } from "@/actions/catalog-actions";
import { RowActionButton } from "@/components/common/RowActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteCatalogItemButtonProps = {
  itemId: number;
  itemName: string;
};

export default function DeleteCatalogItemButton({
  itemId,
  itemName,
}: DeleteCatalogItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    startTransition(async () => {
      try {
        await deleteCatalogItemAction(itemId);
        toast.success("Store item removed successfully");
        setIsOpen(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to remove store item";

        toast.error("Failed to remove store item", {
          description: message,
        });
      }
    });
  }

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isPending) setIsOpen(open);
      }}
    >
      <AlertDialogTrigger asChild>
        <span>
          <RowActionButton label={`Delete ${itemName}`} tone="danger">
            <Trash2 className="h-5 w-5" />
          </RowActionButton>
        </span>
      </AlertDialogTrigger>

      <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-xl rounded-none border-0 bg-slate-50 p-8 text-center shadow-2xl sm:p-10">
        <AlertDialogHeader className="space-y-6 text-center">
          <AlertDialogTitle className="text-center text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Delete Item
          </AlertDialogTitle>

          <AlertDialogDescription className="mx-auto max-w-lg text-center text-xl leading-relaxed text-slate-500 sm:text-2xl">
            Delete {itemName}? If this item has purchase history, it will be
            deactivated instead.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-10 flex flex-col gap-5">
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="h-16 w-full rounded-lg border-2 border-cyan-500 bg-red-500 text-2xl font-semibold text-white shadow-sm transition-all hover:bg-red-600 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>

          <AlertDialogCancel
            disabled={isPending}
            className="m-0 h-16 w-full rounded-lg border border-slate-300 bg-white text-2xl font-semibold text-slate-950 shadow-sm transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}