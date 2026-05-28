"use client";

import { useState, useTransition } from "react";
import ModalShell from "@/components/common/ModalShell";
import { createCatalogItemAction } from "@/actions/catalog-actions";
import { toast } from "sonner";

export default function AddCatalogItemDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [trackStock, setTrackStock] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    setIsOpen(false);
    setTrackStock(false);
    setError("");
  }

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        await createCatalogItemAction(formData);
        toast.success("Store item added successfully");
        closeDialog();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add store item";
        setError(message);
        toast.error("Failed to add store item", { description: message });
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600"
      >
        + Add Item
      </button>

      {isOpen && (
        <ModalShell
          title="Add Catalog Item"
          description="Create a new shop item with price and optional stock tracking."
          onClose={closeDialog}
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
                form="add-catalog-item-form"
                disabled={isPending}
                className="rounded-xl bg-cyan-600 px-4 font-semibold text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow-md disabled:opacity-60"
              >
                {isPending ? "Adding..." : "Add"}
              </button>
            </>
          }
        >
          <form
            id="add-catalog-item-form"
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
                placeholder="Example: Tennis Grip"
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
                placeholder="Example: 100"
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
                  placeholder="Example: 25"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {!trackStock && (
              <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                Stock will be shown as <strong>∞ Unlimited</strong>. This is
                useful for services like stringing.
              </div>
            )}
          </form>
        </ModalShell>
      )}
    </>
  );
}