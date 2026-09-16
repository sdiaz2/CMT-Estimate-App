"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AppShell, Card, Field, PageLead } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useEstimateStore } from "@/lib/store";

function NewProject() {
  const createProject = useEstimateStore((s) => s.createProject);
  const router = useRouter();
  const [name, setName] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = createProject({
      name: String(fd.get("name") || ""),
      location: String(fd.get("location") || ""),
      docsReceived: String(fd.get("docsReceived") || ""),
      notes: String(fd.get("notes") || ""),
    });
    router.push(`/projects/${id}/scope`);
  }

  return (
    <AppShell>
      <PageLead title="New estimate">
        Name the job and note what docs you have. Plan quantities come after you
        pick scope.
      </PageLead>
      <Card className="mx-auto max-w-2xl">
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Project name">
            <Input
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Riverside Elementary Expansion"
            />
          </Field>
          <Field label="Location">
            <Input name="location" placeholder="City, State" />
          </Field>
          <Field label="Docs you received">
            <Textarea
              name="docsReceived"
              rows={3}
              placeholder="Plans dated…, specs sections…, geotech report…"
            />
          </Field>
          <Field label="Notes">
            <Textarea
              name="notes"
              rows={3}
              placeholder="Schedule assumptions, exclusions, etc."
            />
          </Field>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="secondary" asChild>
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit">Save and pick scope</Button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}

export default NewProject;
