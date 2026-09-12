import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMissChecks, setProjectScope } from "@/lib/actions";
import { StepNav } from "@/components/StepNav";
import { MissCheckBanner } from "@/components/MissCheckBanner";
import { parseHints } from "@/lib/heuristics";

export const dynamic = "force-dynamic";

export default async function ScopePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { parents: true },
  });
  if (!project) notFound();

  const catalog = await prisma.parentTaskCatalog.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const selected = new Set(project.parents.map((p) => p.catalogId));
  const prompts = await getMissChecks(id);

  return (
    <div>
      <StepNav projectId={id} current="scope" />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Select parent tasks for this estimate. Add or drop freely — miss-check
          prompts flag related work that is often forgotten.
        </p>
      </div>

      <MissCheckBanner prompts={prompts} />

      <form action={setProjectScope.bind(null, id)} className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {catalog.map((c) => {
            const hints = parseHints(c.relatedHints);
            return (
              <label
                key={c.id}
                className="flex cursor-pointer gap-3 rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
              >
                <input
                  type="checkbox"
                  name="catalogId"
                  value={c.id}
                  defaultChecked={selected.has(c.id)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    {c.name}
                  </span>
                  <span className="mt-0.5 block text-xs uppercase tracking-wide text-slate-400">
                    {c.category}
                  </span>
                  {hints.length > 0 && (
                    <span className="mt-1 block text-xs text-slate-500">
                      Often with: {hints.join("; ")}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Save scope & continue to trips/hours
          </button>
        </div>
      </form>
    </div>
  );
}
