"use client";

import { useParams } from "next/navigation";
import { Check, Download, Printer } from "lucide-react";
import { useState } from "react";
import { AppShell, Card, PageLead } from "@/components/app-shell";
import { StepFooter, StepNav } from "@/components/step-nav";
import { Button } from "@/components/ui/button";
import { stepHref, useProject, worksheetRows } from "@/lib/store";
import { formatNumber } from "@/lib/utils";

function toTsv(projectName: string, rows: ReturnType<typeof worksheetRows>) {
  const header = ["Parent", "Description", "Qty", "Units", "Trips"].join("\t");
  const body = rows
    .map((r) =>
      [r.parent, r.description, r.quantity, r.units, r.trips ?? ""].join("\t")
    )
    .join("\n");
  return `${projectName}\n${header}\n${body}\n`;
}

function WorksheetPage() {
  const { id } = useParams<{ id: string }>();
  const project = useProject(id);
  const [copied, setCopied] = useState(false);
  if (!project) return null;

  const rows = worksheetRows(project);
  const tripTotal = rows.reduce((s, r) => s + (r.trips ?? 0), 0);

  async function copy() {
    const text = toTsv(project!.name, rows);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  function downloadCsv() {
    const header = "Parent,Description,Qty,Units,Trips";
    const body = rows
      .map((r) =>
        [r.parent, r.description, r.quantity, r.units, r.trips ?? ""]
          .map((c) => `"${String(c).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}\n`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project!.name.replace(/\s+/g, "-")}-worksheet.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell>
      <StepNav project={project} current="worksheet" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <PageLead title="Worksheet">
          Parent · Description · Qty · Units · Trips. Copy into Pricing Tool —
          there is no API in this version.
        </PageLead>
        <div className="no-print flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={copy}>
            {copied ? <Check /> : null}
            {copied ? "Copied" : "Copy for Pricing Tool"}
          </Button>
          <Button type="button" variant="secondary" onClick={downloadCsv}>
            <Download />
            CSV
          </Button>
          <Button type="button" variant="ink" onClick={() => window.print()}>
            <Printer />
            Print
          </Button>
        </div>
      </div>

      <div className="mb-4 print:mb-2">
        <p className="font-display text-2xl font-semibold">{project.name}</p>
        <p className="text-sm text-muted">
          {project.location || "No location"}
          {project.docsReceived ? ` · ${project.docsReceived}` : ""}
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="text-muted">
            Nothing to list yet. Add scope and trips first.
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-surface shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-wider text-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Parent</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Units</th>
                <th className="px-4 py-3 font-semibold">Trips</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.id}-${i}`}
                  className="border-t border-border/80 even:bg-bg-warm/40"
                >
                  <td className="max-w-[14rem] px-4 py-3 text-muted">{r.parent}</td>
                  <td className="px-4 py-3 font-medium text-fg">
                    {r.description}
                    {r.notes ? (
                      <span className="mt-0.5 block text-xs font-normal text-subtle">
                        {r.notes}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatNumber(r.quantity, r.quantity % 1 ? 1 : 0)}</td>
                  <td className="px-4 py-3 text-muted">{r.units}</td>
                  <td className="px-4 py-3 tabular-nums">{r.trips ?? "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border-strong bg-surface-2">
                <td className="px-4 py-3 font-semibold" colSpan={2}>
                  {rows.length} lines
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-xs uppercase tracking-wider text-subtle">
                  Trip sum
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums">{tripTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {project.notes ? (
        <p className="mt-4 text-sm text-muted">Notes: {project.notes}</p>
      ) : null}

      <StepFooter back={{ to: stepHref(id, "lab"), label: "Back to lab" }} />
    </AppShell>
  );
}

export default WorksheetPage;
