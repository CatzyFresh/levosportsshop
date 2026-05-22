"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

type BillingMonthSelectorProps = {
  month: number;
  year: number;
};

export default function BillingMonthSelector({
  month,
  year,
}: BillingMonthSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) => currentYear - 2 + index);

  function updateMonthYear(nextMonth: number, nextYear: number) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("month", String(nextMonth));
    params.set("year", String(nextYear));

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
          Month
        </label>
        <select
          value={month}
          onChange={(event) => updateMonthYear(Number(event.target.value), year)}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold outline-none focus:border-cyan-500"
        >
          {months.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
          Year
        </label>
        <select
          value={year}
          onChange={(event) => updateMonthYear(month, Number(event.target.value))}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 font-semibold outline-none focus:border-cyan-500"
        >
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}