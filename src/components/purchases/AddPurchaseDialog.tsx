"use client";

import { useMemo, useState, useTransition } from "react";
import ModalShell from "@/components/common/ModalShell";
import { createPurchaseAction } from "@/actions/purchase-actions";
import { toast } from "sonner";

type StoreItemOption = {
  id: number;
  name: string;
  defaultPrice: number;
  stockTracked: boolean;
  currentStock: number | null;
};

type AddPurchaseDialogProps = {
  playerId: number;
  storeItems: StoreItemOption[];
};

function getTodayDateInputValue() {
  return new Date().toISOString().split("T")[0];
}

export default function AddPurchaseDialog({
  playerId,
  storeItems,
}: AddPurchaseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [customItemName, setCustomItemName] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(getTodayDateInputValue());
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const total = useMemo(() => {
    return unitPrice * quantity;
  }, [unitPrice, quantity]);

  function handleItemChange(itemId: string) {
    setSelectedItemId(itemId);

    const selectedItem = storeItems.find((item) => String(item.id) === itemId);

    if (selectedItem) {
      setCustomItemName(selectedItem.name);
      setUnitPrice(selectedItem.defaultPrice / 100);
    }
  }

  function closeDialog() {
    setIsOpen(false);
    setSelectedItemId("");
    setCustomItemName("");
    setUnitPrice(0);
    setQuantity(1);
    setPurchaseDate(getTodayDateInputValue());
    setError("");
  }

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        await createPurchaseAction(playerId, formData);
        toast.success("Purchase added successfully");
        closeDialog();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to add purchase";
        setError(message);
        toast.error("Failed to add purchase", { description: message });
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600"
      >
        + Add Purchase
      </button>

      {isOpen && (
        <ModalShell
          title="Add Purchase"
          description="Add a new purchase to this player's account."
          onClose={closeDialog}
          maxWidth="max-w-xl"
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
                form="add-purchase-form"
                disabled={isPending}
                className="rounded-xl bg-cyan-600 px-4 font-semibold text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow-md disabled:opacity-60"
              >
                {isPending ? "Adding..." : "Add"}
              </button>
            </>
          }
        >
          <form id="add-purchase-form" action={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Store Item
              </label>

              <select
                name="storeItemId"
                value={selectedItemId}
                onChange={(event) => handleItemChange(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="">Choose item or enter custom item</option>

                {storeItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ₹{(item.defaultPrice / 100).toFixed(2)}
                    {item.stockTracked
                      ? ` - Stock: ${item.currentStock ?? 0}`
                      : " - Unlimited"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Item Name *
              </label>

              <input
                name="itemName"
                type="text"
                value={customItemName}
                onChange={(event) => setCustomItemName(event.target.value)}
                placeholder="Enter item name"
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Unit Price *
                </label>

                <input
                  name="unitPrice"
                  type="number"
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(Number(event.target.value))}
                  min={0}
                  step="0.01"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Quantity *
                </label>

                <input
                  name="quantity"
                  type="number"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  min={1}
                  className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Purchase Date
              </label>

              <input
                name="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>

              <textarea
                name="notes"
                rows={3}
                placeholder="Optional notes"
                className="w-full resize-none rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="rounded-lg bg-slate-100 p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-600">Total Amount</p>
                <p className="text-3xl font-bold text-slate-950">
                  ₹{total.toFixed(2)}
                </p>
              </div>
            </div>
          </form>
        </ModalShell>
      )}
    </>
  );
}