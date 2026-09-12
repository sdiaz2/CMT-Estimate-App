import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  applyAllFieldSuggestions,
  applyFieldSuggestions,
  getMissChecks,
  updateParentDrivers,
} from "@/lib/actions";
import { StepNav } from "@/components/StepNav";
import { MissCheckBanner } from "@/components/MissCheckBanner";
import { LineItemsEditor } from "@/components/LineItemsEditor";
import { parseDrivers } from "@/lib/heuristics";

export const dynamic = "force-dynamic";

const DRIVER_FIELDS: { key: string; label: string; step?: string }[] = [
  { key: "trips", label: "Trips" },
  { key: "hours", label: "Hours" },
  { key: "otHours", label: "OT hours" },
  { key: "days", label: "Days" },
  { key: "gaugeDays", label: "Gauge days" },
  { key: "vehicleTrips", label: "Vehicle trips" },
  { key: "samples", label: "Samples" },
  { key: "cylindersPerSample", label: "Cyl / sample" },
];

export default async function FieldPage({
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

  const fieldParents = project.parents.filter((p) => p.catalog.category !== "lab");
  const prompts = await getMissChecks(id);

  return (
    <div>
      <StepNav projectId={id} current="field" />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Edit drivers (trips/hours/OT/vehicle) then apply rule-based
            suggestions. Every quantity stays fully editable — suggestions never
            lock numbers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={applyAllFieldSuggestions.bind(null, id)}>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
            >
              Apply suggestions (all)
            </button>
          </form>
          <Link
            href={`/projects/${id}/lab`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            Next: Lab →
          </Link>
        </div>
      </div>

      <MissCheckBanner prompts={prompts} />

      {fieldParents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No field/admin parents selected.{" "}
          <Link href={`/projects/${id}/scope`} className="text-blue-600 hover:underline">
            Choose scope
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {fieldParents.map((parent) => {
            const drivers = parseDrivers(parent.drivers);
            const fieldLines = parent.lineItems.filter((l) => !l.isLab);
            return (
              <section
                key={parent.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {parent.catalog.name}
                  </h2>
                  <form action={applyFieldSuggestions.bind(null, id, parent.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200"
                    >
                      Apply suggestions
                    </button>
                  </form>
                </div>

                <form
                  action={updateParentDrivers.bind(null, id, parent.id)}
                  className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
                >
                  {DRIVER_FIELDS.map((f) => (
                    <label key={f.key} className="block text-xs text-slate-500">
                      {f.label}
                      <input
                        name={f.key}
                        type="number"
                        step="any"
                        defaultValue={
                          drivers[f.key] !== undefined ? String(drivers[f.key]) : ""
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm text-slate-900"
                      />
                    </label>
                  ))}
                  <div className="col-span-2 flex items-end sm:col-span-4 lg:col-span-8">
                    <button
                      type="submit"
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                    >
                      Save drivers
                    </button>
                  </div>
                </form>

                <LineItemsEditor
                  projectId={id}
                  projectParentId={parent.id}
                  lines={fieldLines}
                  isLab={false}
                />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
