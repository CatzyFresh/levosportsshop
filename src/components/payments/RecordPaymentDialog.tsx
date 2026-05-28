"use client";

import { useState, useTransition } from "react";
import ModalShell from "@/components/common/ModalShell";
import { formatINR } from "@/lib/money";
import { recordPaymentAction } from "@/actions/billing-actions";
import { toast } from "sonner";

type RecordPaymentDialogProps = {
  playerId: number;
  playerName: string;
  currentBalance: number;
  month: number;
  year: number;
};

function getTodayDateInputValue() {
  return new Date().toISOString().split("T")[0];
}

export default function RecordPaymentDialog({
  playerId,
  playerName,
  currentBalance,
  month,
  year,
}: RecordPaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(currentBalance / 100);
  const [paidAt, setPaidAt] = useState(getTodayDateInputValue());
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    setIsOpen(false);
    setAmount(currentBalance / 100);
    setPaidAt(getTodayDateInputValue());
    setError("");
  }

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        await recordPaymentAction({
          playerId,
          month,
          year,
          formData,
        });

        toast.success("Payment recorded successfully");
        closeDialog();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to record payment";
        setError(message);
        toast.error("Failed to record payment", { description: message });
      }
    });
  }

  const paymentAmountInPaise = Math.round(amount * 100);
  const balanceAfterPayment = Math.max(currentBalance - paymentAmountInPaise, 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={currentBalance <= 0}
        className="rounded-md bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        + Record Payment
      </button>

      {isOpen && (
        <ModalShell
          title="Record Payment"
          description={`Add a payment received from ${playerName}.`}
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
                form="record-payment-form"
                disabled={isPending}
                className="rounded-xl bg-cyan-600 px-4 font-semibold text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow-md disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Update"}
              </button>
            </>
          }
        >
          <form
            id="record-payment-form"
            action={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="rounded-lg bg-slate-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">
                  Current Balance
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatINR(currentBalance)}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Amount *
              </label>

              <input
                name="amount"
                type="number"
                min={1}
                step="0.01"
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
                name="paidAt"
                type="date"
                value={paidAt}
                onChange={(event) => setPaidAt(event.target.value)}
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Method
              </label>

              <select
                name="method"
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500"
              >
                <option value="">Select payment method</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>

              <textarea
                name="notes"
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
                  {formatINR(balanceAfterPayment)}
                </p>
              </div>
            </div>
          </form>
        </ModalShell>
      )}
    </>
  );
}