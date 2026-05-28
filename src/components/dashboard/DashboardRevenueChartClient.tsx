"use client";

import dynamic from "next/dynamic";

const DashboardRevenueChart = dynamic(
  () => import("@/components/dashboard/DashboardRevenueChart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
    ),
  }
);

export default DashboardRevenueChart;
