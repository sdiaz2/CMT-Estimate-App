import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { applyLabSuggestions } from "@/lib/actions";
import { StepNav } from "@/components/StepNav";
import { LineItemsEditor } from "@/components/LineItemsEditor";

export const dynamic = "force-dynamic";

export default async function LabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      parents: {
        include: { catalog: true, lineItems: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!project) notFound();

  let labParent = project.parents.find((p) => p.catalog.name === "Laboratory Testing");

  return (
    <div>
      <StepNav projectId={id} current="lab" />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-umber">
            {project.name}
          </h1>
          <p className="page-lead mt-2">
            Lab tests are suggested from your field trips. Review the list, then
            continue to the worksheet when it looks right.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <form action={applyLabSuggestions.bind(null, id)}>
            <button
              type="submit"
              className={labParent ? "btn-secondary text-sm" : "btn-primary text-sm"}
            >
              {labParent ? "Refresh lab suggestions" : "Suggest lab tests"}
            </button>
          </form>
        </div>
      </div>

      {!labParent ? (
        <div className="empty-state">
          <p className="text-lg font-medium text-umber">No lab lines yet</p>
          <p className="mt-2 text-umber-muted">
            Press <strong className="text-umber">Suggest lab tests</strong> to
            build lines from your field trips, or add Laboratory Testing on{" "}
            <Link
              href={`/projects/${id}/scope`}
              className="font-medium text-terracotta hover:text-terracotta-hover"
            >
              Scope
            </Link>
            .
          </p>
        </div>
      ) : (
        <section className="card-soft p-6">
          <h2 className="mb-5 text-lg font-semibold text-umber">
            {labParent.catalog.name}
          </h2>
          <LineItemsEditor
            projectId={id}
            projectParentId={labParent.id}
            lines={labParent.lineItems}
            isLab
          />
        </section>
      )}
    </div>
  );
}
