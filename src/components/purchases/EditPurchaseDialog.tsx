"use client";

import { useMemo, useState, useTransition } from "react";
import ModalShell from "@/components/common/ModalShell";
import { updatePurchaseAction } from "@/actions/purchase-actions";
import { Pencil } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";
import { toast } from "sonner";

type StoreItemOption = {
  id: number;
  name: string;
  defaultPrice: number;
  stockTracked: boolean;
  currentStock: number | null;
};

type EditPurchaseDialogProps = {
  playerId: number;
  storeItems: StoreItemOption[];
  purchase: {
    id: number;
    storeItemId: number | null;
    itemName: string;
    unitPrice: number;
    quantity: number;
    purchaseDate: string;
    notes: string | null;
  };
};

export default function EditPurchaseDialog({
  playerId,
  storeItems,
  purchase,
}: EditPurchaseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(
    purchase.storeItemId ? String(purchase.storeItemId) : ""
  );
  const [itemName, setItemName] = useState(purchase.itemName);
  const [unitPrice, setUnitPrice] = useState(purchase.unitPrice / 100);
  const [quantity, setQuantity] = useState(purchase.quantity);
  const [purchaseDate, setPurchaseDate] = useState(purchase.purchaseDate);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const total = useMemo(() => {
    return unitPrice * quantity;
  }, [unitPrice, quantity]);

  function handleItemChange(itemId: string) {
    setSelectedItemId(itemId);

    const selectedItem = storeItems.find((item) => String(item.id) === itemId);

    if (selectedItem) {
      setItemName(selectedItem.name);
      setUnitPrice(selectedItem.defaultPrice / 100);
    }
  }

  function closeDialog() {
    setIsOpen(false);
    setSelectedItemId(purchase.storeItemId ? String(purchase.storeItemId) : "");
    setItemName(purchase.itemName);
    setUnitPrice(purchase.unitPrice / 100);
    setQuantity(purchase.quantity);
    setPurchaseDate(purchase.purchaseDate);
    setError("");
  }

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        await updatePurchaseAction({
          purchaseId: purchase.id,
          playerId,
          formData,
        });

        toast.success("Purchase updated successfully");
        closeDialog();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update purchase";
        setError(message);
        toast.error("Failed to update purchase", { description: message });
      }
    });
  }

  return (
    <>
      <RowActionButton label="Edit purchase" onClick={() => setIsOpen(true)}>
        <Pencil className="h-5 w-5" />
      </RowActionButton>

      {isOpen && (
        <ModalShell
          title="Edit Purchase"
          description="Update this purchase entry."
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
                form={`edit-purchase-form-${purchase.id}`}
                disabled={isPending}
                className="rounded-xl bg-cyan-600 px-4 font-semibold text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow-md disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save changes"}
              </button>
            </>
          }
        >
          <form
            id={`edit-purchase-form-${purchase.id}`}
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
                Select Store Item
              </label>

              <select
                name="storeItemId"
                value={selectedItemId}
                onChange={(event) => handleItemChange(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="">Custom item</option>

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
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
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
                defaultValue={purchase.notes ?? ""}
                placeholder="Optional notes"
                className="w-full resize-none rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="rounded-lg bg-slate-100 p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-600">Updated Total</p>
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