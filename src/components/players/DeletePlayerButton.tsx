"use client";

import { useState, useTransition } from "react";
import { deletePlayerAction } from "@/actions/player-actions";
import { Trash2 } from "lucide-react";
import { RowActionButton } from "@/components/common/RowActions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type DeletePlayerButtonProps = {
  playerId: number;
  playerName: string;
};

export default function DeletePlayerButton({
  playerId,
  playerName,
}: DeletePlayerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deletePlayerAction(playerId);
        toast.success("Player deleted successfully");
        setIsOpen(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete player";
        toast.error("Failed to delete player", { description: message });
      }
    });
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <span>
          <RowActionButton label={`Delete ${playerName}`} tone="danger">
            <Trash2 className="h-5 w-5" />
          </RowActionButton>
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {playerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the player.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} className="rounded-xl">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-xl font-semibold"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
