"use client";

import { useState } from "react";
import { formatINR } from "@/lib/money";
import DeleteCatalogItemButton from "@/components/catalog/DeleteCatalogItemButton";
import EditCatalogItemDialog from "@/components/catalog/EditCatalogItemDialog";
import InlineStockEditor from "@/components/catalog/InlineStockEditor";
import { Card, CardContent } from "@/components/ui/card";

type CatalogItem = {
  id: number;
  name: string;
  defaultPrice: number;
  stockTracked: boolean;
  currentStock: number | null;
};

export default function StoreCatalogClient({ items }: { items: CatalogItem[] }) {
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  function openEdit(item: CatalogItem) {
    setSelectedItem(item);
    setIsEditOpen(true);
  }

  return (
    <>
      <div className="space-y-3">
        {items.length === 0 ? (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex h-40 items-center justify-center text-center text-sm text-muted-foreground">
              No catalog items found. Add your first item.
            </CardContent>
          </Card>
        ) : (
          items.map((item) => {
            const isTracked = item.stockTracked;
            const currentStock = item.currentStock ?? 0;
            const isOutOfStock = isTracked && currentStock <= 0;
            const isLowStock = isTracked && currentStock > 0 && currentStock <= 5;

            return (
              <Card
                key={item.id}
                className={`border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isOutOfStock ? "border-red-200" : isLowStock ? "border-orange-200" : ""
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-bold text-slate-950 md:text-xl">{item.name}</h2>

                      <p className="mt-1 text-base font-medium text-slate-500">{formatINR(item.defaultPrice)}</p>

                      <div className="mt-3">
                        <InlineStockEditor
                          itemId={item.id}
                          stockTracked={item.stockTracked}
                          currentStock={item.currentStock}
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <EditCatalogItemDialog onOpen={() => openEdit(item)} />

                      <DeleteCatalogItemButton itemId={item.id} itemName={item.name} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <EditCatalogItemDialog
        key={selectedItem?.id ?? 0}
        item={selectedItem}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
