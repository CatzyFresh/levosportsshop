"use client";

import type { ReactNode } from "react";

type ModalShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
  maxWidth?: string;
};

export default function ModalShell({
  title,
  description,
  children,
  footer,
  onClose,
  maxWidth = "max-w-lg",
}: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-3 sm:p-4 md:items-center">
      <div
        className={`flex max-h-[92dvh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl md:max-h-[90vh] md:rounded-xl`}
      >
        <div className="flex min-w-0 items-start justify-between gap-4 border-b border-slate-200 p-4 md:p-6">
          <div className="min-w-0">
            <h3 className="break-words text-xl font-bold leading-tight text-slate-950 md:text-2xl">
              {title}
            </h3>

            {description && (
              <p className="mt-1 break-words text-sm leading-relaxed text-slate-500 md:text-base">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 text-2xl leading-none text-slate-400 hover:text-slate-700"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto break-words p-4 md:p-6">
          {children}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-4 md:flex-row md:justify-end md:p-6 [&>button]:w-full md:[&>button]:w-auto">
          {footer}
        </div>
      </div>
    </div>
  );
}