"use client";

import { useTransition } from "react";
import { deleteCatalogItemAction } from "@/actions/catalog-actions";
import { Trash2 } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";

type DeleteCatalogItemButtonProps = {
  itemId: number;
  itemName: string;
};

export default function DeleteCatalogItemButton({
  itemId,
  itemName,
}: DeleteCatalogItemButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${itemName}? If this item has purchase history, it will be archived instead of permanently deleted.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteCatalogItemAction(itemId);
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Something went wrong while deleting the store item."
        );
      }
    });
  }

  return (
    <RowActionButton
      label={`Delete ${itemName}`}
      tone="danger"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-5 w-5" />
    </RowActionButton>
  );
}