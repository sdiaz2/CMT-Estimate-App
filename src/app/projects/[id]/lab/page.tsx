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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Lab samples/tests are suggested from field trips and drivers
            (compressive strength, Atterberg, Proctor, sieve, Wash #200, asphalt
            bulk density). Apply suggestions, then edit freely.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={applyLabSuggestions.bind(null, id)}>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
            >
              {labParent ? "Re-apply lab suggestions" : "Suggest lab & add Laboratory Testing"}
            </button>
          </form>
          <Link
            href={`/projects/${id}/worksheet`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            Next: Worksheet →
          </Link>
        </div>
      </div>

      {!labParent ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No Laboratory Testing parent yet. Click{" "}
          <strong>Suggest lab</strong> to create it from field drivers, or add it
          on the{" "}
          <Link href={`/projects/${id}/scope`} className="text-blue-600 hover:underline">
            Scope
          </Link>{" "}
          step.
        </div>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
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
