export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect width="32" height="32" rx="10" className="fill-ink" />
      <rect x="7" y="8" width="18" height="4.5" rx="2.25" className="fill-clay" />
      <rect x="7" y="14" width="18" height="4.5" rx="2.25" className="fill-primary" />
      <rect x="7" y="20" width="18" height="4.5" rx="2.25" className="fill-sage-soft" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="size-8 shrink-0" />
      <span className="leading-none">
        <span className="flex items-center gap-2">
          <span className="block font-display text-[1.05rem] font-semibold tracking-tight text-fg">
            CMT Estimate
          </span>
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-primary">
            Rebuild
          </span>
        </span>
        {!compact ? (
          <span className="mt-0.5 block text-[0.7rem] font-medium tracking-wide text-subtle">
            Materials testing
          </span>
        ) : null}
      </span>
    </span>
  );
}
