"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  ReceiptText,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Players", href: "/players", icon: Users },
  { name: "Store Catalog", href: "/store-catalog", icon: Store },
  { name: "Billing", href: "/billing", icon: ReceiptText },
];

export default function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
          LS
        </div>

        <div>
          <h1 className="text-lg font-bold leading-tight">Levo Sports</h1>
          <p className="text-xs font-medium text-slate-500">Shop Manager</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:z-40 md:flex md:h-screen md:w-72 md:flex-col border-r border-slate-200/70 bg-white/95 backdrop-blur shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/70 bg-white/90 backdrop-blur px-4 py-3 shadow-sm md:hidden">
        <div>
          <h1 className="text-base font-bold">Levo Sports</h1>
          <p className="text-xs text-slate-500">Shop Manager</p>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-slate-200 p-2 text-slate-700"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div className="font-bold">Menu</div>

              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-slate-200 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="md:ml-72">
        <main className="min-h-screen px-4 py-5 md:px-10 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}