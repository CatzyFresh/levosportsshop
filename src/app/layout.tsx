import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
        <div className="flex min-h-screen bg-slate-100 text-slate-950">
          <Sidebar />
          <main className="flex-1 p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}