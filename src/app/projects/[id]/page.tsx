"use client";

import { useParams } from "next/navigation";
import { AppShell, Card, Field, PageLead } from "@/components/app-shell";
import { StepFooter, StepNav } from "@/components/step-nav";
import { Input, Textarea } from "@/components/ui/input";
import { stepHref, useEstimateStore, useProject } from "@/lib/store";

function SetupPage() {
  const { id } = useParams<{ id: string }>();
  const project = useProject(id);
  const patchProject = useEstimateStore((s) => s.patchProject);
  if (!project) return null;

  return (
    <AppShell>
      <StepNav project={project} current="setup" />
      <PageLead title={project.name}>
        Confirm the job details. Plan quantities are entered after scope.
      </PageLead>
      <Card className="mx-auto max-w-2xl space-y-5">
        <Field label="Project name">
          <Input
            value={project.name}
            onChange={(e) => patchProject(id, { name: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input
            value={project.location}
            onChange={(e) => patchProject(id, { location: e.target.value })}
          />
        </Field>
        <Field label="Docs received">
          <Textarea
            rows={3}
            value={project.docsReceived}
            onChange={(e) => patchProject(id, { docsReceived: e.target.value })}
          />
        </Field>
        <Field label="Notes">
          <Textarea
            rows={3}
            value={project.notes}
            onChange={(e) => patchProject(id, { notes: e.target.value })}
          />
        </Field>
        <p className="text-xs text-subtle">Saved automatically on this device.</p>
      </Card>
      <StepFooter
        back={{ to: "/", label: "All projects" }}
        next={{ to: stepHref(id, "scope"), label: "Pick scope" }}
        nextLabel="Continue to scope"
      />
    </AppShell>
  );
}

export default SetupPage;
