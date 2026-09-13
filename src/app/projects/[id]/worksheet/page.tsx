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
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-umber">
          {project.name}
        </h1>
        <p className="page-lead mt-2">
          This is your clean list for Pricing Tool: parent, description,
          quantity, units, and trips. Export, copy, or print — then re-key rates
          in Pricing Tool.
        </p>
        {(project.location || project.docsReceived) && (
          <p className="mt-2 text-xs text-umber-faint">
            {project.location && <>Location: {project.location}. </>}
            {project.docsReceived && <>Docs: {project.docsReceived}</>}
          </p>
        )}
      </div>

      <WorksheetActions projectName={project.name} rows={rows} />

      <div className="table-wrap-soft print-break">
        <table className="table-soft min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-umber-muted">
            <tr>
              <th className="px-5 py-4">Parent</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4 text-right">Quantity</th>
              <th className="px-5 py-4">Units</th>
              <th className="px-5 py-4 text-right">Trips</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <p className="text-base font-medium text-umber">
                    Nothing on the worksheet yet
                  </p>
                  <p className="mt-2 text-sm text-umber-muted">
                    Go back to Trips &amp; hours (and Lab) and apply suggestions
                    first.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={`${r.parent}-${r.description}-${i}`}
                  className={i % 2 === 1 ? "bg-sand/30" : undefined}
                >
                  <td className="px-5 py-3 align-top text-umber-muted">
                    {r.parent}
                  </td>
                  <td className="px-5 py-3 align-top font-medium text-umber">
                    {r.description}
                  </td>
                  <td className="px-5 py-3 align-top text-right tabular-nums text-umber">
                    {r.quantity}
                  </td>
                  <td className="px-5 py-3 align-top text-umber-muted">
                    {r.units}
                  </td>
                  <td className="px-5 py-3 align-top text-right tabular-nums text-umber-muted">
                    {r.trips ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {project.parents.some((p) => p.catalog.name.includes("8%")) && (
        <p className="mt-5 text-xs text-hint">
          Admin support note (8%): enter approximately 8% of technical fees as a
          separate line when re-keying into Pricing Tool — quantities here are
          not locked fees.
        </p>
      )}
    </div>
  );
}
