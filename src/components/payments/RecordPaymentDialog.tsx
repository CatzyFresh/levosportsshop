"use client";

import { useState } from "react";
import ModalShell from "@/components/common/ModalShell";

export default function RecordPaymentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(1100);

  function closeDialog() {
    setIsOpen(false);
    setAmount(1100);
  }

  const balanceAfterPayment = Math.max(1100 - amount, 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
      >
        + Record Payment
      </button>

      {isOpen && (
        <ModalShell
          title="Record Payment"
          description="Add a payment received from Aadhvik."
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
                className="rounded-md bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
              >
                Save Payment
              </button>
            </>
          }
        >
          <form className="space-y-5">
            <div className="rounded-lg bg-slate-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">
                  Current Balance
                </p>
                <p className="text-2xl font-bold text-red-600">₹1,100.00</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Amount *
              </label>

              <input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />

              <p className="mt-2 text-sm text-slate-500">
                Enter the amount received in rupees.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Date
              </label>

              <input
                type="date"
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Method
              </label>

              <select className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500">
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>

              <textarea
                rows={3}
                placeholder="Optional payment notes"
                className="w-full resize-none rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-green-700">
                  Balance After Payment
                </p>
                <p className="text-2xl font-bold text-green-700">
                  ₹{balanceAfterPayment.toFixed(2)}
                </p>
              </div>
            </div>
          </form>
        </ModalShell>
      )}
    </>
  );
}