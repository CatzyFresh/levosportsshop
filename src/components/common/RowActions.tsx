import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "default" | "danger";

type RowActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: Tone;
  children: ReactNode;
};

type RowActionLinkProps = {
  href: string;
  label: string;
  children: ReactNode;
};

function getToneClass(tone: Tone) {
  if (tone === "danger") {
    return "text-red-500 hover:bg-red-50 hover:text-red-700";
  }

  return "text-slate-600 hover:bg-cyan-50 hover:text-cyan-700";
}

export function RowActionButton({
  label,
  tone = "default",
  children,
  className = "",
  ...props
}: RowActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${getToneClass(
        tone
      )} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function RowActionLink({ href, label, children }: RowActionLinkProps) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition hover:bg-cyan-50 hover:text-cyan-700"
    >
      {children}
    </Link>
  );
}