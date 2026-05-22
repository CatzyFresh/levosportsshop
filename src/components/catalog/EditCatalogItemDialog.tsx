"use client";

import { useState, useTransition } from "react";
import ModalShell from "@/components/common/ModalShell";
import { updateCatalogItemAction } from "@/actions/catalog-actions";
import { Pencil } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";

type EditCatalogItemDialogProps = {
  item: {
    id: number;
    name: string;
    defaultPrice: number;
    stockTracked: boolean;
    currentStock: number | null;
  };
};

export default function EditCatalogItemDialog({
  item,
}: EditCatalogItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [trackStock, setTrackStock] = useState(item.stockTracked);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    setIsOpen(false);
    setTrackStock(item.stockTracked);
    setError("");
  }

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        await updateCatalogItemAction(item.id, formData);
        closeDialog();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while updating the item."
        );
      }
    });
  }

  return (
    <>
      <RowActionButton label="Edit store item" onClick={() => setIsOpen(true)}>
        <Pencil className="h-5 w-5" />
      </RowActionButton>

      {isOpen && (
        <ModalShell
          title="Edit Store Item"
          description="Update item name, price, and stock settings."
          onClose={closeDialog}
          footer={
            <>
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                form={`edit-catalog-item-form-${item.id}`}
                disabled={isPending}
                className="rounded-md bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </>
          }
        >
          <form
            id={`edit-catalog-item-form-${item.id}`}
            action={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Item Name *
              </label>

              <input
                name="name"
                type="text"
                defaultValue={item.name}
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Default Price *
              </label>

              <input
                name="defaultPrice"
                type="number"
                min={0}
                step="0.01"
                defaultValue={item.defaultPrice / 100}
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />

              <p className="mt-2 text-sm text-slate-500">
                Enter amount in rupees. Example: 850 for ₹850.
              </p>
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
                <p className="text-sm text-slate-500">
                  Enable this for items where quantity matters.
                </p>
              </div>
            </label>

            {trackStock && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Stock *
                </label>

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
      )}
    </>
  );
}