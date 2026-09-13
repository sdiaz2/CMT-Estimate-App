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
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-umber">
          {project.name}
        </h1>
        <p className="page-lead mt-2">
          Check every parent task this job needs. Miss-check tips appear if a
          common related item is missing — they are suggestions only.
        </p>
      </div>

      <MissCheckBanner prompts={prompts} />

      <form action={setProjectScope.bind(null, id)} className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {catalog.map((c) => {
            const hints = parseHints(c.relatedHints);
            return (
              <label
                key={c.id}
                className="card-soft flex cursor-pointer gap-3 p-5 transition-shadow hover:shadow-[var(--shadow-card)]"
              >
                <input
                  type="checkbox"
                  name="catalogId"
                  value={c.id}
                  defaultChecked={selected.has(c.id)}
                  className="mt-1 size-4 accent-terracotta"
                />
                <span>
                  <span className="block text-sm font-medium text-umber">
                    {c.name}
                  </span>
                  <span className="mt-0.5 block text-xs uppercase tracking-wide text-umber-faint">
                    {c.category}
                  </span>
                  {hints.length > 0 && (
                    <span className="mt-1.5 block text-xs text-umber-muted">
                      Often with: {hints.join("; ")}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
            Save scope and enter takeoffs →
          </button>
        </div>
      </form>
    </div>
  );
}
