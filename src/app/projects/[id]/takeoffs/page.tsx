"use client";

import { useParams } from "next/navigation";
import { AppShell, PageLead } from "@/components/app-shell";
import { StepFooter, StepNav } from "@/components/step-nav";
import { TakeoffForm } from "@/components/takeoff-form";
import { TripPreview } from "@/components/trip-preview";
import { stepHref, useEstimateStore, useProject } from "@/lib/store";

function TakeoffsPage() {
  const { id } = useParams<{ id: string }>();
  const project = useProject(id);
  const patchTakeoff = useEstimateStore((s) => s.patchTakeoff);
  if (!project) return null;

  return (
    <AppShell>
      <StepNav project={project} current="takeoffs" />
      <PageLead title="Plan quantities">
        Enter takeoffs for the work you scoped. Trip math updates live and
        writes through to unlocked parents on the next step.
      </PageLead>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <TakeoffForm
          scoped={project.scoped}
          takeoff={project.takeoff}
          onChange={(patch) => patchTakeoff(id, patch)}
        />
        <div className="lg:sticky lg:top-24">
          <TripPreview scoped={project.scoped} takeoff={project.takeoff} />
        </div>
      </div>

      <StepFooter
        back={{ to: stepHref(id, "scope"), label: "Back to scope" }}
        next={{ to: stepHref(id, "trips") }}
        nextLabel="Review trips & hours"
      />
    </AppShell>
  );
}

export default TakeoffsPage;
