"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Players", href: "/players" },
  { name: "Store Catalog", href: "/store-catalog" },
  { name: "Billing", href: "/billing" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-950 text-white flex flex-col min-h-screen">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="h-10 w-10 rounded-md bg-cyan-500 flex items-center justify-center font-bold">
          SC
        </div>
        <h1 className="text-xl font-bold">Levo Sports</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-4 py-3 font-semibold ${
                isActive
                  ? "bg-cyan-500 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button className="w-full rounded-md px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
          Logout
        </button>
      </div>
    </aside>
  );
}