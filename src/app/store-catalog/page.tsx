import prisma from "@/lib/prisma";

import AddCatalogItemDialog from "@/components/catalog/AddCatalogItemDialog";
import StoreCatalogClient from "@/components/catalog/StoreCatalogClient";

import { Card, CardContent } from "@/components/ui/card";

export default async function StoreCatalogPage() {
  const items = await prisma.storeItem.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const trackedItems = items.filter((item) => item.stockTracked);

  const outOfStockItems = trackedItems.filter(
    (item) => (item.currentStock ?? 0) <= 0
  ).length;

  const lowStockItems = trackedItems.filter((item) => {
    const stock = item.currentStock ?? 0;
    return stock > 0 && stock <= 5;
  }).length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Store Catalog
          </h1>

          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Manage items, prices, and stock levels.
          </p>
        </div>

        <AddCatalogItemDialog />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          title="Items Tracked"
          value={trackedItems.length}
        />

        <SummaryCard
          title="Out of Stock"
          value={outOfStockItems}
          danger={outOfStockItems > 0}
        />

        <SummaryCard
          title="Low Stock (≤5)"
          value={lowStockItems}
          warning={lowStockItems > 0}
        />
      </div>

      <StoreCatalogClient items={items} />

      <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
        Tip: Click a stock badge to quickly update the quantity. Leave stock
        untracked for unlimited items.
      </p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  danger,
  warning,
}: {
  title: string;
  value: string | number;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <Card
      className={`border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        danger
          ? "border-red-200 bg-red-50/40"
          : warning
            ? "border-orange-200 bg-orange-50/40"
            : ""
      }`}
    >
      <CardContent className="flex min-h-24 flex-col items-center justify-center p-4 text-center">
        <div
          className={`text-2xl font-bold md:text-3xl ${
            danger
              ? "text-red-600"
              : warning
                ? "text-orange-600"
                : "text-slate-950"
          }`}
        >
          {value}
        </div>

        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground md:text-sm">
          <span>{title}</span>
        </div>
      </CardContent>
    </Card>
  );
}
