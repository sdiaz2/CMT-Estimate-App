"use client";

import { useParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { AppShell, Card, PageLead } from "@/components/app-shell";
import { LineEditor } from "@/components/line-editor";
import { StepFooter, StepNav } from "@/components/step-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalogByName } from "@/lib/catalog";
import {
  driversFromTrips,
  hasAutoTripRule,
  HOURS_PER_TRIP,
  ruleLabelForParent,
  suggestedTripsForParent,
} from "@/lib/heuristics-ui";
import {
  fieldLinesFor,
  stepHref,
  useEstimateStore,
  useProject,
} from "@/lib/store";
import type { Drivers } from "@/lib/types";

function TripsPage() {
  const { id } = useParams<{ id: string }>();
  const project = useProject(id);
  const setDrivers = useEstimateStore((s) => s.setDrivers);
  const unlockAndApply = useEstimateStore((s) => s.unlockAndApply);
  const setParentLines = useEstimateStore((s) => s.setParentLines);
  if (!project) return null;

  const fieldParents = project.scoped.filter(
    (n) => catalogByName(n)?.category !== "lab"
  );

  return (
    <AppShell>
      <StepNav project={project} current="trips" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageLead title="Trips & hours">
          Rule suggestions apply automatically unless you lock a parent by
          editing it. Hours default to 4 per trip, OT at 15%.
        </PageLead>
        <Button
          type="button"
          variant="secondary"
          onClick={() => unlockAndApply(id)}
        >
          <RotateCcw />
          Reset all to rules
        </Button>
      </div>

      {fieldParents.length === 0 ? (
        <Card>
          <p className="text-muted">
            No field parents in scope. Go back and pick testing items.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {fieldParents.map((name) => {
            const parent = project.parents[name];
            const d = parent?.drivers ?? {};
            const suggested = suggestedTripsForParent(name, project.takeoff);
            const auto = hasAutoTripRule(name);
            const lines = fieldLinesFor(project, name);

            function patch(part: Partial<Drivers>, lock = true) {
              setDrivers(id, name, { ...d, ...part }, lock);
            }

            return (
              <Card key={name} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-fg">
                      {name}
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs text-subtle">
                      {ruleLabelForParent(name, project.takeoff)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {parent?.tripsLocked ? (
                      <span className="rounded-full bg-hint-bg px-3 py-1 text-xs font-semibold text-hint">
                        Overridden
                      </span>
                    ) : auto && suggested > 0 ? (
                      <span className="rounded-full bg-sage-soft px-3 py-1 text-xs font-semibold text-sage">
                        From takeoff
                      </span>
                    ) : null}
                    {parent?.tripsLocked ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => unlockAndApply(id, name)}
                      >
                        Use rule ({suggested})
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <label className="block">
                    <span className="text-xs font-medium text-muted">Trips</span>
                    <Input
                      type="number"
                      className="mt-1 tabular-nums"
                      value={d.trips ?? 0}
                      onChange={(e) => {
                        const trips = Number(e.target.value) || 0;
                        const next = driversFromTrips(
                          trips,
                          typeof d.notes === "string" ? d.notes : undefined
                        );
                        setDrivers(id, name, { ...d, ...next, samples: d.samples });
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-muted">Hours</span>
                    <Input
                      type="number"
                      className="mt-1 tabular-nums"
                      value={d.hours ?? 0}
                      onChange={(e) =>
                        patch({ hours: Number(e.target.value) || 0 })
                      }
                    />
                    <span className="mt-1 block text-[0.7rem] text-subtle">
                      {HOURS_PER_TRIP} hr/trip default
                    </span>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-muted">OT hours</span>
                    <Input
                      type="number"
                      className="mt-1 tabular-nums"
                      value={d.otHours ?? 0}
                      onChange={(e) =>
                        patch({ otHours: Number(e.target.value) || 0 })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-muted">Samples</span>
                    <Input
                      type="number"
                      className="mt-1 tabular-nums"
                      value={d.samples ?? 0}
                      onChange={(e) =>
                        patch({ samples: Number(e.target.value) || 0 })
                      }
                    />
                  </label>
                </div>

                <details className="rounded-2xl bg-surface-2/60 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-medium text-muted">
                    Worksheet lines
                  </summary>
                  <div className="mt-3">
                    <LineEditor
                      lines={lines}
                      onChange={(next) => setParentLines(id, name, next)}
                    />
                    {parent?.lines ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="mt-2"
                        onClick={() => setParentLines(id, name, null)}
                      >
                        Restore generated lines
                      </Button>
                    ) : null}
                  </div>
                </details>
              </Card>
            );
          })}
        </div>
      )}

      <StepFooter
        back={{ to: stepHref(id, "takeoffs"), label: "Back to takeoffs" }}
        next={{ to: stepHref(id, "lab") }}
        nextLabel="Continue to lab"
      />
    </AppShell>
  );
}

export default TripsPage;
