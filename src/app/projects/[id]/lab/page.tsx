"use client";

import { useParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { AppShell, Card, PageLead } from "@/components/app-shell";
import { LineEditor } from "@/components/line-editor";
import { StepFooter, StepNav } from "@/components/step-nav";
import { Button } from "@/components/ui/button";
import { labLinesFor, stepHref, useEstimateStore, useProject } from "@/lib/store";

function LabPage() {
  const { id } = useParams<{ id: string }>();
  const project = useProject(id);
  const setLabLines = useEstimateStore((s) => s.setLabLines);
  const resetLab = useEstimateStore((s) => s.resetLab);
  const toggleScope = useEstimateStore((s) => s.toggleScope);
  if (!project) return null;

  const labOn = project.scoped.includes("Laboratory Testing");
  const lines = labLinesFor(project);

  return (
    <AppShell>
      <StepNav project={project} current="lab" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageLead title="Laboratory tests">
          Suggested from field trips and samples: concrete cylinders, grout,
          mortar, soils classification, asphalt density.
        </PageLead>
        {project.labTouched ? (
          <Button type="button" variant="secondary" onClick={() => resetLab(id)}>
            <RotateCcw />
            Reset suggestions
          </Button>
        ) : null}
      </div>

      {!labOn ? (
        <Card className="mb-5">
          <p className="text-sm text-muted">
            Laboratory Testing is not in scope. Suggestions still show so you
            can add the parent if they look right.
          </p>
          <Button
            type="button"
            className="mt-3"
            size="sm"
            onClick={() => toggleScope(id, "Laboratory Testing")}
          >
            Add Laboratory Testing
          </Button>
        </Card>
      ) : null}

      <Card>
        {lines.length === 0 ? (
          <p className="text-sm text-muted">
            No lab tests suggested yet. Add earthwork, concrete, masonry, grout,
            or asphalt on Scope and fill trips.
          </p>
        ) : (
          <LineEditor
            lines={lines}
            allowLab
            onChange={(next) => setLabLines(id, next)}
          />
        )}
        {project.labTouched ? (
          <p className="mt-3 text-xs text-hint">Edited — no longer auto-updating.</p>
        ) : (
          <p className="mt-3 text-xs text-subtle">
            Auto-updating from field drivers until you edit a line.
          </p>
        )}
      </Card>

      <StepFooter
        back={{ to: stepHref(id, "trips"), label: "Back to trips" }}
        next={{ to: stepHref(id, "worksheet") }}
        nextLabel="Open worksheet"
      />
    </AppShell>
  );
}

export default LabPage;
