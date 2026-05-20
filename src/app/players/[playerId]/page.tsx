import Link from "next/link";
import AddPurchaseDialog from "@/components/purchases/AddPurchaseDialog";

const purchases = [
  {
    date: "May 16, 2026",
    item: "Strings (MSV)",
    price: "₹850.00",
    qty: 1,
    total: "₹850.00",
  },
  {
    date: "May 16, 2026",
    item: "Stringing Service",
    price: "₹250.00",
    qty: 1,
    total: "₹250.00",
  },
];

export default function PlayerDetailPage() {
  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link href="/players" className="text-sm font-semibold text-cyan-600">
            ← Back to Players
          </Link>

          <h2 className="mt-3 text-4xl font-bold">Aadhvik</h2>
          <p className="mt-2 text-slate-500">Player purchase profile</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/billing/114"
            className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Generate Bill
          </Link>

          <AddPurchaseDialog />
        </div>
      </div>

      <div className="mb-8 grid max-w-4xl grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Outstanding Balance
          </p>
          <p className="mt-3 text-3xl font-bold text-red-600">₹1,100.00</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Total Orders
          </p>
          <p className="mt-3 text-3xl font-bold">2</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Lifetime Spent
          </p>
          <p className="mt-3 text-3xl font-bold text-cyan-600">₹1,100.00</p>
        </div>
      </div>

      <div className="mb-6 flex gap-3">
        <button className="rounded-md bg-cyan-500 px-5 py-2 font-semibold text-white">
          Purchases
        </button>
        <button className="rounded-md border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-600">
          Stats
        </button>
        <button className="rounded-md border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-600">
          Calendar
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-xl font-bold">Purchase History</h3>
          <p className="mt-1 text-slate-500">
            All purchases made by this player.
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-500">
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Item</th>
              <th className="px-5 py-4 font-semibold">Price</th>
              <th className="px-5 py-4 font-semibold">Qty</th>
              <th className="px-5 py-4 font-semibold">Total</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {purchases.map((purchase) => (
              <tr
                key={purchase.item}
                className="border-b border-slate-100 hover:bg-slate-50 last:border-b-0"
              >
                <td className="px-5 py-4 text-slate-500">{purchase.date}</td>
                <td className="px-5 py-4 font-medium">{purchase.item}</td>
                <td className="px-5 py-4">{purchase.price}</td>
                <td className="px-5 py-4">{purchase.qty}</td>
                <td className="px-5 py-4 font-semibold">{purchase.total}</td>
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
    </>
  );
}