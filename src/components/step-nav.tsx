import { Check } from "lucide-react";
import {
  STEPS,
  projectProgress,
  stepHref,
  type Project,
  type StepKey,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { NavLink } from "./nav-link";

export function StepNav({ project, current }: { project: Project; current: StepKey }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  const currentStep = STEPS[idx] ?? STEPS[0];
  const next = idx >= 0 && idx < STEPS.length - 1 ? STEPS[idx + 1] : null;
  const { done } = projectProgress(project);

  return (
    <div className="no-print mb-8 space-y-3">
      <nav
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        aria-label="Estimate steps"
      >
        {STEPS.map((s, i) => {
          const active = s.key === current;
          const isDone = done.includes(s.key) && !active;
          return (
            <NavLink
              key={s.key}
              to={stepHref(project.id, s.key)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors duration-150",
                active && "bg-ink text-ink-fg shadow-soft",
                isDone && "bg-sage-soft text-sage",
                !active &&
                  !isDone &&
                  "bg-surface text-muted shadow-[inset_0_0_0_1.5px_var(--color-border)] hover:text-fg"
              )}
            >
              {isDone ? (
                <Check className="size-3.5" strokeWidth={2.5} />
              ) : (
                <span className="tabular-nums opacity-70">{i + 1}</span>
              )}
              {s.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="rounded-2xl bg-sage-soft/50 px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
        <p className="text-sm text-muted">
          <span className="font-semibold text-fg">You are here:</span> {currentStep.short}
          {next ? (
            <>
              <span className="mx-2 text-subtle" aria-hidden>
                →
              </span>
              Next:{" "}
              <NavLink
                to={stepHref(project.id, next.key)}
                className="font-medium text-primary hover:text-primary-hover"
              >
                {next.short}
              </NavLink>
            </>
          ) : (
            <span className="ml-2 text-subtle">Export or print when the list looks right.</span>
          )}
        </p>
      </div>
    </div>
  );
}

export function StepFooter({
  back,
  next,
  nextLabel,
}: {
  back?: { to: string; label: string };
  next?: { to: string; label?: string };
  nextLabel?: string;
}) {
  return (
    <div className="no-print mt-10 flex flex-wrap items-center justify-between gap-3">
      {back ? (
        <NavLink
          to={back.to}
          className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-muted hover:text-fg"
        >
          {back.label}
        </NavLink>
      ) : (
        <span />
      )}
      {next ? (
        <NavLink
          to={next.to}
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-fg shadow-soft hover:bg-primary-hover"
        >
          {nextLabel ?? next.label ?? "Continue"}
        </NavLink>
      ) : null}
    </div>
  );
}
