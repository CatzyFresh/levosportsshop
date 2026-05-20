"use client";

import { useState } from "react";
import ModalShell from "@/components/common/ModalShell";

export default function AddPlayerDialog() {
  const [isOpen, setIsOpen] = useState(false);

  function closeDialog() {
    setIsOpen(false);
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
                className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={closeDialog}
                className="rounded-md bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600"
              >
                Save Player
              </button>
            </>
          }
        >
          <form className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Player Name *
              </label>
              <input
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
                type="email"
                placeholder="Enter email address"
                className="w-full rounded-md border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>
              <textarea
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