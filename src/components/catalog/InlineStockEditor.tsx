"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Infinity, Minus, Package, Plus, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { updateCatalogStockAction } from "@/actions/catalog-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type InlineStockEditorProps = {
  itemId: number;
  stockTracked: boolean;
  currentStock: number | null;
};

export default function InlineStockEditor({
  itemId,
  stockTracked,
  currentStock,
}: InlineStockEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isEditing, setIsEditing] = useState(false);
  const [stock, setStock] = useState(currentStock ?? 0);
  const [draftStock, setDraftStock] = useState(String(currentStock ?? 0));

  if (!stockTracked) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-slate-200 bg-white px-2.5 py-1 text-slate-500"
      >
        <Infinity className="h-3 w-3" />
        Unlimited
      </Badge>
    );
  }

  function updateStock(nextStock: number) {
    const safeStock = Math.max(0, Math.floor(nextStock));

    setStock(safeStock);
    setDraftStock(String(safeStock));
    setIsEditing(false);

    startTransition(async () => {
      try {
        await updateCatalogStockAction(itemId, safeStock);
        toast.success("Stock updated");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update stock."
        );
      }
    });
  }

  function commitDraft() {
    const parsedStock = Number(draftStock);
    updateStock(Number.isFinite(parsedStock) ? parsedStock : 0);
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isPending}
          className="h-8 w-8 rounded-lg"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => updateStock(stock - 1)}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>

        <Input
          type="number"
          min={0}
          value={draftStock}
          disabled={isPending}
          autoFocus
          onChange={(event) => setDraftStock(event.target.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitDraft();
            }

            if (event.key === "Escape") {
              setDraftStock(String(stock));
              setIsEditing(false);
            }
          }}
          className="h-8 w-16 rounded-lg px-1 text-center text-sm"
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isPending}
          className="h-8 w-8 rounded-lg"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => updateStock(stock + 1)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        setDraftStock(String(stock));
        setIsEditing(true);
      }}
      className="inline-flex transition hover:scale-105 disabled:pointer-events-none disabled:opacity-60"
      title="Click to edit stock"
    >
      {isOutOfStock ? (
        <Badge className="gap-1 border-red-200 bg-red-50 px-2.5 py-1 text-red-600 hover:bg-red-50">
          <Package className="h-3 w-3" />
          Out of Stock
        </Badge>
      ) : isLowStock ? (
        <Badge className="gap-1 border-orange-200 bg-orange-50 px-2.5 py-1 text-orange-600 hover:bg-orange-50">
          <TriangleAlert className="h-3 w-3" />
          {stock} left
        </Badge>
      ) : (
        <Badge className="gap-1 border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-600 hover:bg-emerald-50">
          <Package className="h-3 w-3" />
          {stock} in stock
        </Badge>
      )}
    </button>
  );
}