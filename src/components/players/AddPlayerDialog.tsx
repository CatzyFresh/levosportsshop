"use client";

import { useState, useTransition } from "react";
import ModalShell from "@/components/common/ModalShell";
import { createPlayerAction } from "@/actions/player-actions";
import { coachBatchOptions } from "@/lib/coaches";
import { toast } from "sonner";

export default function AddPlayerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    setIsOpen(false);
    setError("");
  }

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      try {
        await createPlayerAction(formData);
        toast.success("Player added successfully");
        closeDialog();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to add player";
        setError(message);
        toast.error("Failed to add player", {
          description: message,
        });
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600"
      >
        + Add Player
      </button>

      {isOpen && (
        <ModalShell
          title="Add New Player"
          description="Create a new player profile for shop billing."
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
                form="add-player-form"
                disabled={isPending}
                className="rounded-xl bg-cyan-600 px-4 font-semibold text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow-md disabled:opacity-60"
              >
                {isPending ? "Adding..." : "Add"}
              </button>
            </>
          }
        >
          <form id="add-player-form" action={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Player Name *
              </label>
              <input
                name="name"
                type="text"
                placeholder="Enter player name"
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter email address"
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>
              <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Batch
            </label>

            <select
              name="batch"
              className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 outline-none focus:border-cyan-500"
            >
              <option value="">Select batch / coach</option>

              {coachBatchOptions.map((coach) => (
                <option key={coach} value={coach}>
                  {coach}
                </option>
              ))}
            </select>
          </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>
              <textarea
                name="notes"
                placeholder="Optional notes about the player"
                rows={3}
                className="w-full resize-none rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>
          </form>
        </ModalShell>
      )}
    </>
  );
}