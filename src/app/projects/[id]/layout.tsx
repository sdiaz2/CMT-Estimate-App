"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useEnsureHydrated } from "@/lib/hydrate";
import { useProject } from "@/lib/store";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const hydrated = useEnsureHydrated();
  const project = useProject(id);

  if (!hydrated) {
    return (
      <AppShell>
        <div className="h-40 animate-pulse rounded-3xl bg-surface-2" />
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg py-16 text-center">
          <h1 className="font-display text-3xl font-semibold">Estimate not found</h1>
          <p className="mt-2 text-muted">
            It may have been deleted, or this is a different browser.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Back to projects</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return <>{children}</>;
}
