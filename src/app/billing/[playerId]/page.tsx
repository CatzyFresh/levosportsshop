import Link from "next/link";
import RecordPaymentDialog from "@/components/payments/RecordPaymentDialog";

const billItems = [
  {
    date: "May 16, 2026",
    description: "Strings (MSV)",
    qty: 1,
    price: "₹850.00",
    total: "₹850.00",
  },
  {
    date: "May 16, 2026",
    description: "Stringing Service",
    qty: 1,
    price: "₹250.00",
    total: "₹250.00",
  },
];

export default function SinglePlayerBillPage() {
  return (
    <>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link href="/billing" className="text-sm font-semibold text-cyan-600">
            ← Back to Billing
          </Link>

          <h2 className="mt-3 text-4xl font-bold">Bill - Aadhvik</h2>
          <p className="mt-2 text-slate-500">
            Monthly statement and payment tracking.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">
            Print Bill
          </button>

          <button className="rounded-md bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600">
            Share Bill
          </button>
        </div>
      </div>

      <div className="mb-8 grid max-w-5xl grid-cols-4 gap-5">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Total
          </p>
          <p className="mt-3 text-3xl font-bold">₹1,100.00</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Paid
          </p>
          <p className="mt-3 text-3xl font-bold text-green-600">₹0.00</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Balance
          </p>
          <p className="mt-3 text-3xl font-bold text-red-600">₹1,100.00</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Status
          </p>
          <p className="mt-3 inline-block rounded-md bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
            Unpaid
          </p>
        </div>
      </div>

      <div className="mb-6 flex max-w-5xl items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="font-bold">Billing Month</p>
          <p className="text-slate-500">May 2026</p>
        </div>

        <div>
          <p className="font-bold">Due Date</p>
          <p className="text-slate-500">June 10, 2026</p>
        </div>

        <RecordPaymentDialog />
      </div>

      <div className="max-w-5xl rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-xl font-bold">Monthly Statement</h3>
          <p className="mt-1 text-slate-500">
            Purchases made during May 2026.
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm text-slate-500">
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Description</th>
              <th className="px-5 py-4 font-semibold">Qty</th>
              <th className="px-5 py-4 font-semibold">Price</th>
              <th className="px-5 py-4 text-right font-semibold">Total</th>
            </tr>
          </thead>

          <tbody>
            {billItems.map((item) => (
              <tr
                key={item.description}
                className="border-b border-slate-100 last:border-b-0"
              >
                <td className="px-5 py-4 text-slate-500">{item.date}</td>
                <td className="px-5 py-4 font-medium">{item.description}</td>
                <td className="px-5 py-4">{item.qty}</td>
                <td className="px-5 py-4">{item.price}</td>
                <td className="px-5 py-4 text-right font-semibold">
                  {item.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-slate-200 p-6 text-right">
          <p className="text-slate-500">Grand Total</p>
          <p className="text-3xl font-bold">₹1,100.00</p>
        </div>
      </div>

      <p className="mt-6 max-w-5xl text-center text-sm text-slate-500">
        Thank you for your business. Please pay by the 10th of the following
        month.
      </p>
    </>
  );
}