type StatCardProps = {
  title: string;
  value: string | number;
  tone?: "default" | "success" | "danger" | "cyan";
};

export default function StatCard({
  title,
  value,
  tone = "default",
}: StatCardProps) {
  const valueColor =
    tone === "success"
      ? "text-green-600"
      : tone === "danger"
      ? "text-red-600"
      : tone === "cyan"
      ? "text-cyan-600"
      : "text-slate-950";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-4 text-4xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}