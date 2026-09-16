"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell, PageLead } from "@/components/app-shell";
import { MissCheckBanner } from "@/components/miss-check";
import { StepFooter, StepNav } from "@/components/step-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATALOG, CATEGORY_LABEL, SCOPE_PRESETS } from "@/lib/catalog";
import { stepHref, useEstimateStore, useProject } from "@/lib/store";
import { cn } from "@/lib/utils";

function ScopePage() {
  const { id } = useParams<{ id: string }>();
  const project = useProject(id);
  const toggleScope = useEstimateStore((s) => s.toggleScope);
  const applyPreset = useEstimateStore((s) => s.applyPreset);
  const setScoped = useEstimateStore((s) => s.setScoped);
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();

  const groups = useMemo(() => {
    const cats = ["admin", "field", "lab"] as const;
    return cats.map((cat) => ({
      cat,
      items: CATALOG.filter((c) => {
        if (c.category !== cat) return false;
        if (!needle) return true;
        return (
          c.name.toLowerCase().includes(needle) ||
          c.blurb.toLowerCase().includes(needle)
        );
      }),
    }));
  }, [needle]);

  if (!project) return null;

  return (
    <AppShell>
      <StepNav project={project} current="scope" />
      <PageLead title="Pick the work">
        Select parent tasks. Miss-checks will nudge related sample pickups and
        lab. Presets add a typical set — they don’t remove what you already
        picked.
      </PageLead>

      <div className="mb-5 flex flex-wrap gap-2">
        {SCOPE_PRESETS.map((p) => (
          <Button
            key={p.id}
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => applyPreset(id, p.names)}
          >
            {p.label}
          </Button>
        ))}
        {project.scoped.length > 0 ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setScoped(id, [])}
          >
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter tasks"
          className="pl-10"
          aria-label="Filter tasks"
        />
      </div>

      <p className="mb-4 text-sm text-muted">
        <span className="font-semibold tabular-nums text-fg">
          {project.scoped.length}
        </span>{" "}
        selected
      </p>

      <div className="mb-6">
        <MissCheckBanner project={project} />
      </div>

      <div className="space-y-8">
        {groups.map(({ cat, items }) =>
          items.length === 0 ? null : (
            <section key={cat}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-subtle">
                {CATEGORY_LABEL[cat]}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {items.map((item) => {
                  const on = project.scoped.includes(item.name);
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        onClick={() => toggleScope(id, item.name)}
                        className={cn(
                          "flex min-h-16 w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors duration-150",
                          on
                            ? "bg-primary-soft shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--color-primary)_45%,transparent)]"
                            : "bg-surface shadow-[inset_0_0_0_1.5px_var(--color-border)] hover:bg-surface-2"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                            on
                              ? "border-primary bg-primary text-primary-fg"
                              : "border-border-strong bg-surface"
                          )}
                          aria-hidden
                        >
                          {on ? (
                            <svg viewBox="0 0 12 12" className="size-3 fill-none stroke-current">
                              <path
                                d="M2 6.2 4.6 9 10 3"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : null}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-fg">
                            {item.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {item.blurb}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )
        )}
      </div>

      <StepFooter
        back={{ to: stepHref(id, "setup"), label: "Back to setup" }}
        next={{ to: stepHref(id, "takeoffs") }}
        nextLabel="Continue to takeoffs"
      />
    </AppShell>
  );
}

export default ScopePage;
