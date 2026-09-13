import Link from "next/link";

const STEPS = [
  {
    key: "setup",
    label: "Setup",
    short: "Project setup",
    href: (id: string) => `/projects/${id}`,
  },
  {
    key: "scope",
    label: "Scope",
    short: "Pick the work",
    href: (id: string) => `/projects/${id}/scope`,
  },
  {
    key: "field",
    label: "Trips & hours",
    short: "Trips and hours",
    href: (id: string) => `/projects/${id}/field`,
  },
  {
    key: "lab",
    label: "Lab tests",
    short: "Lab tests",
    href: (id: string) => `/projects/${id}/lab`,
  },
  {
    key: "worksheet",
    label: "Worksheet",
    short: "Ready to re-key",
    href: (id: string) => `/projects/${id}/worksheet`,
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function StepNav({
  projectId,
  current,
}: {
  projectId: string;
  current: StepKey;
}) {
  const idx = STEPS.findIndex((s) => s.key === current);
  const currentStep = STEPS[idx] ?? STEPS[0];
  const next = idx >= 0 && idx < STEPS.length - 1 ? STEPS[idx + 1] : null;

  return (
    <div className="no-print mb-10 space-y-4">
      <nav className="flex flex-wrap gap-2" aria-label="Estimate steps">
        {STEPS.map((s, i) => {
          const active = s.key === current;
          const done = idx >= 0 && i < idx;
          return (
            <Link
              key={s.key}
              href={s.href(projectId)}
              className={
                active
                  ? "step-pill step-pill-active"
                  : done
                    ? "step-pill step-pill-done"
                    : "step-pill step-pill-idle"
              }
              aria-current={active ? "step" : undefined}
            >
              <span className="mr-1.5 opacity-70">{i + 1}</span>
              {s.label}
            </Link>
          );
        })}
      </nav>
      <div className="guide-banner">
        <p className="text-sm text-umber-soft">
          <span className="font-semibold text-umber">You are here:</span>{" "}
          {currentStep.short}
          {next ? (
            <>
              <span className="mx-2 text-umber-faint" aria-hidden>
                →
              </span>
              <span className="text-umber-muted">
                Next up: {next.short}{" "}
                <Link
                  href={next.href(projectId)}
                  className="font-medium text-terracotta hover:text-terracotta-hover"
                >
                  ({next.label})
                </Link>
              </span>
            </>
          ) : (
            <>
              <span className="mx-2 text-umber-faint" aria-hidden>
                →
              </span>
              <span className="text-umber-muted">
                Export or print when the list looks right
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
