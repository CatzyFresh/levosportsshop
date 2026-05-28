"use client";

import { useState, useTransition } from "react";
import ModalShell from "@/components/common/ModalShell";
import { updatePlayerAction } from "@/actions/player-actions";
import { coachBatchOptions } from "@/lib/coaches";
import { Pencil } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";
import { toast } from "sonner";

type EditPlayerDialogProps = {
 player: {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  batch: string | null;
  notes: string | null;
};
};

export default function EditPlayerDialog({ player }: EditPlayerDialogProps) {
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
        await updatePlayerAction(player.id, formData);
        toast.success("Player updated successfully");
        closeDialog();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update player";
        setError(message);
        toast.error("Failed to update player", { description: message });
      }
    });
  }

  return (
    <>
      <RowActionButton label="Edit player" onClick={() => setIsOpen(true)}>
        <Pencil className="h-5 w-5" />
      </RowActionButton>

      {isOpen && (
        <ModalShell
          title="Edit Player"
          description="Update this player's contact and profile details."
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
                form={`edit-player-form-${player.id}`}
                disabled={isPending}
                className="rounded-xl bg-cyan-600 px-4 font-semibold text-white shadow-sm transition-all hover:bg-cyan-700 hover:shadow-md disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save changes"}
              </button>
            </>
          }
        >
          <form
            id={`edit-player-form-${player.id}`}
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
                Player Name *
              </label>
              <input
                name="name"
                type="text"
                defaultValue={player.name}
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
                defaultValue={player.phone ?? ""}
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
                defaultValue={player.email ?? ""}
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>
            <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                Batch
            </label>

            <select
                name="batch"
                defaultValue={player.batch ?? ""}
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
                rows={3}
                defaultValue={player.notes ?? ""}
                className="w-full resize-none rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>
          </form>
        </ModalShell>
      )}
    </>
  );
}