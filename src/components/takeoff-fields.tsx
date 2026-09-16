import type { ReactNode } from "react";
import { Input } from "./ui/input";

function num(v: number | null | undefined): string {
  return v == null || !Number.isFinite(v) ? "" : String(v);
}

function parseNum(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function Num({
  label,
  value,
  onChange,
  hint,
  suffix,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (n: number | null) => void;
  hint?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted">{label}</span>
      <div className="relative mt-1.5">
        <Input
          type="number"
          inputMode="decimal"
          value={num(value)}
          onChange={(e) => onChange(parseNum(e.target.value))}
          className="tabular-nums"
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-medium text-subtle">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-2/80 px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 accent-primary"
      />
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-subtle">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Section({
  title,
  trips,
  children,
}: {
  title: string;
  trips?: number;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-surface-2/55 p-4 sm:rounded-3xl sm:p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-fg">{title}</h3>
        {trips != null && trips > 0 ? (
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tabular-nums text-primary">
            {trips} trip{trips === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
