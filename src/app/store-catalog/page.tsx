import AddCatalogItemDialog from "@/components/catalog/AddCatalogItemDialog";
import prisma from "@/lib/prisma";
import { formatINR } from "@/lib/money";

export default async function StoreCatalogPage() {
  const catalogItems = await prisma.storeItem.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-bold">Store Catalog</h2>
          <p className="mt-2 text-slate-500">
            Manage items, prices, and stock levels.
          </p>
        </div>

        <AddCatalogItemDialog />
      </div>

      <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-500">
              <th className="px-5 py-4 font-semibold">Item Name</th>
              <th className="px-5 py-4 font-semibold">Default Price</th>
              <th className="px-5 py-4 font-semibold">Stock</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {catalogItems.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  No catalog items found. Add your first item.
                </td>
              </tr>
            )}

            {catalogItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100 hover:bg-slate-50 last:border-b-0"
              >
                <td className="px-5 py-4 font-medium">{item.name}</td>

                <td className="px-5 py-4 font-semibold">
                  {formatINR(item.defaultPrice)}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-500">
                    {item.stockTracked
                      ? item.currentStock ?? 0
                      : "∞ Unlimited"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-4">
                    <button className="text-slate-500 hover:text-cyan-600">
                      Edit
                    </button>

                    <button className="text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Tip: Click a stock badge to quickly update the quantity. Leave stock
        untracked for unlimited items.
      </p>
    </>
  );
}