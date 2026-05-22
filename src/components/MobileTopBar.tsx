"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/" },
  { name: "Players", href: "/players" },
  { name: "Store Catalog", href: "/store-catalog" },
  { name: "Billing", href: "/billing" },
];

export default function MobileTopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-500 font-bold text-white">
              SC
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-950">
                Levo Sports
              </h1>
              <p className="text-xs text-slate-500">Shop & Billing</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-2xl leading-none text-slate-800 shadow-sm"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu backdrop"
          />

          <aside className="absolute left-0 top-0 h-full w-80 max-w-[85vw] translate-x-0 bg-slate-950 text-white shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500 font-bold text-white">
                  SC
                </div>

                <div>
                  <h2 className="font-bold">Levo Sports</h2>
                  <p className="text-xs text-slate-400">Shop & Billing</p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMenu}
                className="rounded-md px-2 text-3xl leading-none text-slate-300 hover:text-white"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <nav className="space-y-2 p-4">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
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

            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
              <button className="w-full rounded-md px-4 py-3 text-left text-slate-300 hover:bg-slate-800">
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}