"use client";

import { useState, useTransition } from "react";
import ModalShell from "@/components/common/ModalShell";
import { formatINR } from "@/lib/money";
import { updatePaymentAction } from "@/actions/billing-actions";
import { Pencil } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";
import { toast } from "sonner";

type EditPaymentDialogProps = {
  playerId: number;
  payment: {
    id: number;
    amount: number;
    paidAt: string;
    method: string | null;
    notes: string | null;
  };
  invoiceTotalAmount: number;
  invoicePaidAmount: number;
};

export default function EditPaymentDialog({
  playerId,
  payment,
  invoiceTotalAmount,
  invoicePaidAmount,
}: EditPaymentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(payment.amount / 100);
  const [paidAt, setPaidAt] = useState(payment.paidAt);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    setIsOpen(false);
    setAmount(payment.amount / 100);
    setPaidAt(payment.paidAt);
    setError("");
  }

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        await updatePaymentAction({
          paymentId: payment.id,
          playerId,
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

  const newAmountInPaise = Math.round(amount * 100);
  const adjustedPaidAmount =
    invoicePaidAmount - payment.amount + newAmountInPaise;
  const balanceAfterEdit = Math.max(invoiceTotalAmount - adjustedPaidAmount, 0);

  return (
    <>
     <RowActionButton label="Edit payment" onClick={() => setIsOpen(true)}>
        <Pencil className="h-5 w-5" />
      </RowActionButton>

      {isOpen && (
        <ModalShell
          title="Edit Payment"
          description="Correct the payment amount, date, method, or notes."
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
                form={`edit-payment-form-${payment.id}`}
                disabled={isPending}
                className="rounded-xl bg-cyan-600 px-4 font-semibold text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow-md disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save changes"}
              </button>
            </>
          }
        >
          <form
            id={`edit-payment-form-${payment.id}`}
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
                defaultValue={payment.method ?? ""}
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
                defaultValue={payment.notes ?? ""}
                placeholder="Optional payment notes"
                className="w-full resize-none rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-green-700">
                  Balance After Edit
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {formatINR(balanceAfterEdit)}
                </p>
              </div>
            </div>
          </form>
        </ModalShell>
      )}
    </>
  );
}