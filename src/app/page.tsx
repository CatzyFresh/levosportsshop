import StatCard from "@/components/common/StatCard";

export default function DashboardPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-4xl font-bold">Dashboard</h2>
        <p className="mt-2 text-slate-500">
          Overview of shop performance and activities.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard title="Sales (Month)" value="₹0.00" />
        <StatCard title="Total Players" value="90" />
        <StatCard title="Purchases (Month)" value="0" />
        <StatCard title="Active Players" value="0" />
      </div>

      <p className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">
        Payment Tracking
      </p>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatCard title="Outstanding" value="₹0.00" tone="danger" />
        <StatCard title="Collected (Month)" value="₹0.00" tone="success" />
        <StatCard title="Overdue Bills" value="0" />
        <StatCard title="Paid (Month)" value="1" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">
            Sales Revenue (Last 6 Months)
          </h3>
          <div className="h-72 flex items-center justify-center text-slate-400">
            Chart will come here later
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">
            Top Spenders (This Month)
          </h3>
          <div className="h-72 flex items-center justify-center text-slate-400">
            No spenders this month
          </div>
        </div>
      </div>
    </>
  );
}