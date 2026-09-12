import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StepNav } from "@/components/StepNav";
import { WorksheetActions } from "@/components/WorksheetClient";

export const dynamic = "force-dynamic";

export default async function WorksheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      parents: {
        include: {
          catalog: true,
          lineItems: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!project) notFound();

  const rows = project.parents.flatMap((p) =>
    p.lineItems.map((li) => ({
      parent: p.catalog.name,
      description: li.description,
      quantity: li.quantity,
      units: li.units,
      trips: li.trips,
    }))
  );

  return (
    <div>
      <StepNav projectId={id} current="worksheet" />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Clean worksheet for re-key into Pricing Tool. Columns map as{" "}
          <strong>Parent → Description | Quantity | Units | Trips</strong>.
          Optional display rates are omitted here so you can enter Pricing Tool
          rates during re-key. Export CSV, copy TSV, or print.
        </p>
        {(project.location || project.docsReceived) && (
          <p className="mt-2 text-xs text-slate-500">
            {project.location && <>Location: {project.location}. </>}
            {project.docsReceived && <>Docs: {project.docsReceived}</>}
          </p>
        )}
      </div>

      <WorksheetActions projectName={project.name} rows={rows} />

      <div className="print-break overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Quantity</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3 text-right">Trips</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No line items yet. Apply suggestions on Trips/Hours and Lab.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={`${r.parent}-${r.description}-${i}`}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-2 align-top text-slate-600">{r.parent}</td>
                  <td className="px-4 py-2 align-top font-medium text-slate-900">
                    {r.description}
                  </td>
                  <td className="px-4 py-2 align-top text-right tabular-nums">
                    {r.quantity}
                  </td>
                  <td className="px-4 py-2 align-top">{r.units}</td>
                  <td className="px-4 py-2 align-top text-right tabular-nums text-slate-600">
                    {r.trips ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {project.parents.some((p) => p.catalog.name.includes("8%")) && (
        <p className="mt-4 text-xs text-amber-800">
          Admin support note (8%): enter approximately 8% of technical fees as a
          separate line when re-keying into Pricing Tool — quantities here are
          not locked fees.
        </p>
      )}
    </div>
  );
}
