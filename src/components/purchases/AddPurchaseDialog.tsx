"use client";

import { useMemo, useState } from "react";
import ModalShell from "@/components/common/ModalShell";

const catalogItems = [
  { id: "1", name: "Strings (MSV)", price: 850 },
  { id: "2", name: "Ball can (Head tour)", price: 430 },
  { id: "3", name: "Grips", price: 100 },
  { id: "4", name: "Stringing Service", price: 250 },
];

export default function AddPurchaseDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [customItemName, setCustomItemName] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const total = useMemo(() => {
    return unitPrice * quantity;
  }, [unitPrice, quantity]);

  function handleItemChange(itemId: string) {
    setSelectedItemId(itemId);

    const selectedItem = catalogItems.find((item) => item.id === itemId);

    if (selectedItem) {
      setCustomItemName(selectedItem.name);
      setUnitPrice(selectedItem.price);
    }
  }

  function closeDialog() {
    setIsOpen(false);
    setSelectedItemId("");
    setCustomItemName("");
    setUnitPrice(0);
    setQuantity(1);
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
                className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={closeDialog}
                className="rounded-md bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600"
              >
                Save Purchase
              </button>
            </>
          }
        >
          <form className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Store Item
              </label>

              <select
                value={selectedItemId}
                onChange={(event) => handleItemChange(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="">Choose item or enter custom item</option>

                {catalogItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - ₹{item.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Item Name *
              </label>

              <input
                type="text"
                value={customItemName}
                onChange={(event) => setCustomItemName(event.target.value)}
                placeholder="Enter item name"
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Unit Price *
                </label>

                <input
                  type="number"
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(Number(event.target.value))}
                  min={0}
                  className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Quantity *
                </label>

                <input
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
                type="date"
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>

              <textarea
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