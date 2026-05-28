"use client";

import { useState, useTransition } from "react";
import ModalShell from "@/components/common/ModalShell";
import { updateCatalogItemAction } from "@/actions/catalog-actions";
import { Pencil } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";
import { toast } from "sonner";

type CatalogItem = {
  id: number;
  name: string;
  defaultPrice: number;
  stockTracked: boolean;
  currentStock: number | null;
};

type EditCatalogItemDialogProps = {
  onOpen?: () => void;
  item?: CatalogItem | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function EditCatalogItemDialog({ onOpen, item, open, onOpenChange }: EditCatalogItemDialogProps) {
  const [trackStock, setTrackStock] = useState(item?.stockTracked ?? false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (onOpen) {
    return (
      <RowActionButton label="Edit store item" onClick={onOpen}>
        <Pencil className="h-5 w-5" />
      </RowActionButton>
    );
  }

  function closeDialog() {
    onOpenChange?.(false);
    if (item) {
      setTrackStock(item.stockTracked);
    }
    setError("");
  }

  function handleSubmit(formData: FormData) {
    if (!item) return;

    setError("");

    startTransition(async () => {
      try {
        await updateCatalogItemAction(item.id, formData);
        toast.success("Store item updated successfully");
        closeDialog();
      } catch (submitError) {
        const message = submitError instanceof Error ? submitError.message : "Failed to update store item";
        setError(message);
        toast.error("Failed to update store item", { description: message });
      }
    });
  }

  if (!item || !open) {
    return null;
  }

  return (
    <ModalShell
      title="Edit Store Item"
      description="Update item name, price, and stock settings."
      onClose={closeDialog}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={closeDialog}
            className="rounded-xl"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-catalog-item-form"
            disabled={isPending}
            className="rounded-xl bg-cyan-600 px-4 font-semibold text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow-md disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save changes"}
          </button>
        </>
      }
    >
      <form id="edit-catalog-item-form" action={handleSubmit} className="space-y-5">
        {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Item Name *</label>

          <input
            name="name"
            type="text"
            defaultValue={item.name}
            className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Default Price *</label>

          <input
            name="defaultPrice"
            type="number"
            min={0}
            step="0.01"
            defaultValue={item.defaultPrice / 100}
            className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
          />

          <p className="mt-2 text-sm text-slate-500">Enter amount in rupees. Example: 850 for ₹850.</p>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
          <input
            name="stockTracked"
            type="checkbox"
            checked={trackStock}
            onChange={(event) => setTrackStock(event.target.checked)}
            className="h-5 w-5"
          />

          <div>
            <p className="font-semibold text-slate-800">Track Stock</p>
            <p className="text-sm text-slate-500">Enable this for items where quantity matters.</p>
          </div>
        </label>

        {trackStock && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Current Stock *</label>

            <input
              name="currentStock"
              type="number"
              min={0}
              defaultValue={item.currentStock ?? 0}
              className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {!trackStock && (
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
            Stock will be shown as <strong>∞ Unlimited</strong>.
          </div>
        )}
      </form>
    </ModalShell>
  );
}
