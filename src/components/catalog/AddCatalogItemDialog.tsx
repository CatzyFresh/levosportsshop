"use client";

import { useState } from "react";
import ModalShell from "@/components/common/ModalShell";

export default function AddCatalogItemDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [trackStock, setTrackStock] = useState(false);

  function closeDialog() {
    setIsOpen(false);
    setTrackStock(false);
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
                className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={closeDialog}
                className="rounded-md bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600"
              >
                Save Item
              </button>
            </>
          }
        >
          <form className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Item Name *
              </label>

              <input
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
                type="number"
                min={0}
                placeholder="Example: 100"
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />

              <p className="mt-2 text-sm text-slate-500">
                Enter amount in rupees. Example: 850 for ₹850.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
              <input
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