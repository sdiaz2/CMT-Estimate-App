"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Copy, Plus, Search, Trash2, Warehouse } from "lucide-react";
import { AppShell, Card, EmptyState } from "@/components/app-shell";
import { InstallBanner } from "@/components/pwa-install";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEnsureHydrated, useProjectList } from "@/lib/hydrate";
import { buildSampleProject } from "@/lib/sample-project";
import {
  projectProgress,
  useEstimateStore,
} from "@/lib/store";
import { formatWhen } from "@/lib/utils";

function Home() {
  const hydrated = useEnsureHydrated();
  const projects = useProjectList();
  const importProject = useEstimateStore((s) => s.importProject);
  const duplicateProject = useEstimateStore((s) => s.duplicateProject);
  const deleteProject = useEstimateStore((s) => s.deleteProject);
  const router = useRouter();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.location.toLowerCase().includes(needle)
    );
  }, [projects, q]);

  function loadSample() {
    const id = importProject(buildSampleProject());
    router.push(`/projects/${id}`);
  }

  return (
    <AppShell
      actions={
        <Button asChild>
          <Link href="/projects/new">
            <Plus />
            New estimate
          </Link>
        </Button>
      }
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Rebuild · construction materials testing
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-fg sm:text-5xl">
            Fee worksheets, without the scramble.
          </h1>
          <p className="mt-3 text-muted">
            Setup, scope, takeoffs, trips, lab, worksheet — then re-key into
            Pricing Tool. Estimates stay on this phone. This is not the older
            “Your projects” cloud app.
          </p>
        </div>
      </div>

      <InstallBanner />

      {!hydrated ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-3xl bg-surface-2"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No estimates yet"
          body="Start a blank job, or load a 100,000 SF warehouse with lime pavement, 36 piers, and steel already filled in."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/projects/new">Create your first estimate</Link>
              </Button>
              <Button variant="secondary" type="button" onClick={loadSample}>
                <Warehouse />
                Try sample warehouse
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects"
                className="pl-10"
                aria-label="Search projects"
              />
            </div>
            <Button variant="secondary" type="button" onClick={loadSample}>
              <Warehouse />
              Sample warehouse
            </Button>
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted">No projects match that search.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((p) => {
                const { percent, done } = projectProgress(p);
                return (
                  <Card key={p.id} className="flex flex-col">
                    <Link href={`/projects/${p.id}`} className="block">
                      <h2 className="font-display text-xl font-semibold text-fg">
                        {p.name}
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        {p.location || "No location"} · {p.scoped.length} scope
                        items
                      </p>
                    </Link>
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-subtle">
                        <span>{done.length} of 6 steps</span>
                        <span className="tabular-nums">{percent}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-subtle">{formatWhen(p.updatedAt)}</p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Duplicate"
                          onClick={() => {
                            const nid = duplicateProject(p.id);
                            if (nid) router.push(`/projects/${nid}`);
                          }}
                        >
                          <Copy />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete"
                          onClick={() => {
                            if (confirm(`Delete “${p.name}”?`))
                              deleteProject(p.id);
                          }}
                        >
                          <Trash2 />
                        </Button>
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/projects/${p.id}/worksheet`}>
                            Worksheet
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

export default Home;
