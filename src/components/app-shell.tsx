import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "./logo";

export function AppShell({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="no-print sticky top-0 z-30 border-b border-border/80 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="rounded-lg focus-visible:outline-none">
            <Wordmark compact />
          </Link>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 shadow-card sm:rounded-3xl sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center shadow-soft">
      <p className="font-display text-2xl font-semibold text-fg">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-muted">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function PageLead({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 max-w-2xl">
      <h1 className="text-3xl font-semibold text-fg sm:text-4xl">{title}</h1>
      {children ? <p className="mt-2 text-base text-muted">{children}</p> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1.5 text-xs text-subtle">{hint}</p> : null}
    </label>
  );
}
