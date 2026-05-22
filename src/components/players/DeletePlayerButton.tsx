"use client";

import { useTransition } from "react";
import { deletePlayerAction } from "@/actions/player-actions";

type DeletePlayerButtonProps = {
  playerId: number;
  playerName: string;
};

export default function DeletePlayerButton({
  playerId,
  playerName,
}: DeletePlayerButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${playerName}? This cannot be undone.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deletePlayerAction(playerId);
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Something went wrong while deleting the player."
        );
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}