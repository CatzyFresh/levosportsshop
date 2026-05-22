import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileTopBar from "@/components/MobileTopBar";

export const metadata: Metadata = {
  title: "Levo Sports Shop",
  description: "Player purchases and monthly billing system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-100 text-slate-950 md:flex">
          <Sidebar />

          <div className="flex min-h-screen flex-1 flex-col">
            <MobileTopBar />

            <main className="flex-1 px-4 py-5 md:p-10">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}