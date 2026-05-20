
import Link from "next/link";
const billingPlayers = [
  {
    id: "114",
    name: "Aadhvik",
    contact: "No contact",
    orders: 2,
    status: "Unpaid",
    amount: "₹1,100.00",
  },
  {
    id: "115",
    name: "Aarav",
    contact: "No contact",
    orders: 0,
    status: "Paid",
    amount: "₹0.00",
  },
  {
    id: "116",
    name: "Aarish",
    contact: "No contact",
    orders: 0,
    status: "Paid",
    amount: "₹0.00",
  },
  {
    id: "117",
    name: "Aathav",
    contact: "No contact",
    orders: 0,
    status: "Paid",
    amount: "₹0.00",
  },
  {
    id: "118",
    name: "Abdullah",
    contact: "No contact",
    orders: 0,
    status: "Paid",
    amount: "₹0.00",
  },
];

const filters = ["All Players", "Unpaid", "Partial", "Overdue", "Paid"];

export default function BillingPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-4xl font-bold">Billing Center</h2>
        <p className="mt-2 text-slate-500">
          Track invoices and record payments for all players.
        </p>
      </div>

      <div className="mb-8 grid max-w-5xl grid-cols-3 gap-5">
        <BillingSummaryCard
          title="Total Outstanding"
          value="₹0.00"
          danger
        />
        <BillingSummaryCard title="Overdue Invoices" value="0" />
        <BillingSummaryCard title="Pending Invoices" value="0" />
      </div>

      <div className="mb-6 max-w-5xl">
        <input
          type="text"
          placeholder="Search for a player..."
          className="w-full rounded-md border border-slate-300 bg-white px-5 py-4 text-lg outline-none focus:border-cyan-500"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {filters.map((filter, index) => (
          <button
            key={filter}
            className={`rounded-full border px-5 py-2 text-sm font-semibold ${
              index === 0
                ? "border-cyan-500 bg-cyan-500 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="max-w-5xl space-y-4">
        {billingPlayers.map((player) => (
          <div
            key={player.name}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-cyan-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{player.name}</h3>

                {player.status === "Paid" && (
                  <span className="rounded-md bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    ✓ Paid
                  </span>
                )}
              </div>

              <p className="mt-2 text-slate-500">
                {player.contact} · {player.orders} orders
              </p>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Lifetime
                </p>
                <p className="text-lg font-bold text-cyan-600">
                  {player.amount}
                </p>
              </div>
              <Link
                    href={`/billing/${player.id}`}
                    className="text-2xl font-bold text-slate-900 hover:text-cyan-600"
                    >
                    →
                </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function BillingSummaryCard({
  title,
  value,
  danger,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
        {title}
      </p>

      <p
        className={`mt-3 text-3xl font-bold ${
          danger ? "text-red-600" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}