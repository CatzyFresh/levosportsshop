"use client";

import { useTransition } from "react";
import { deletePlayerAction } from "@/actions/player-actions";
import { Trash2 } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";

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
        <RowActionButton
      label={`Delete ${playerName}`}
      tone="danger"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-5 w-5" />
    </RowActionButton>
  );
}