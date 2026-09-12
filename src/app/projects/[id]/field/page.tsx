import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  applyAllFieldSuggestions,
  applyFieldSuggestions,
  getMissChecks,
  updateParentDrivers,
  updateProjectTakeoff,
} from "@/lib/actions";
import { StepNav } from "@/components/StepNav";
import { MissCheckBanner } from "@/components/MissCheckBanner";
import { LineItemsEditor } from "@/components/LineItemsEditor";
import { TakeoffFactsFields } from "@/components/TakeoffFacts";
import {
  DEFAULT_EARTHWORK_SF_PER_TRIP,
  earthworkTripRuleLabel,
  isEarthworkTestingParent,
  parseDrivers,
  suggestEarthworkTrips,
  takeoffFromProject,
} from "@/lib/heuristics";

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
  const takeoff = takeoffFromProject(project);
  const divisor =
    (takeoff.earthworkSfPerTrip && takeoff.earthworkSfPerTrip > 0
      ? takeoff.earthworkSfPerTrip
      : DEFAULT_EARTHWORK_SF_PER_TRIP) || DEFAULT_EARTHWORK_SF_PER_TRIP;
  const buildingSf = takeoff.buildingAreaSf ?? 0;
  const suggestedEarthworkTrips =
    buildingSf > 0 ? suggestEarthworkTrips(buildingSf, divisor) : 0;
  const ruleAppliesCondition =
    !!takeoff.moistureConditionedSubgrade && !!takeoff.flexibleBaseCap;
  const hasEarthworkTesting = fieldParents.some((p) =>
    isEarthworkTestingParent(p.catalog.name)
  );

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

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <form action={updateProjectTakeoff.bind(null, id)} className="space-y-4">
          <TakeoffFactsFields
            compact
            values={{
              buildingAreaSf: project.buildingAreaSf,
              moistureConditionedSubgrade: project.moistureConditionedSubgrade,
              flexibleBaseCap: project.flexibleBaseCap,
              earthworkSfPerTrip: project.earthworkSfPerTrip,
              moistureDepthNote: project.moistureDepthNote,
              flexibleBaseThicknessNote: project.flexibleBaseThicknessNote,
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
            >
              Save takeoff facts
            </button>
            {buildingSf > 0 && (
              <p className="text-xs text-slate-600">
                Preview: ceil({buildingSf.toLocaleString()} / {divisor}) ={" "}
                <strong>{suggestedEarthworkTrips} trips</strong>
                {" "}(range at 2700–3000:{" "}
                {suggestEarthworkTrips(buildingSf, 3000)}–
                {suggestEarthworkTrips(buildingSf, 2700)})
              </p>
            )}
          </div>
        </form>
      </section>

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
            const isEarthwork = isEarthworkTestingParent(parent.catalog.name);
            const displayDrivers =
              isEarthwork && buildingSf > 0 && n(drivers.trips) === 0
                ? { ...drivers, trips: suggestedEarthworkTrips }
                : drivers;

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

                {isEarthwork && (
                  <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    <p className="font-medium">
                      {earthworkTripRuleLabel(buildingSf, divisor)}
                    </p>
                    <p className="mt-1 text-xs text-amber-900/80">
                      Applies when estimating moisture-conditioned subgrade with a
                      flexible base cap
                      {ruleAppliesCondition
                        ? " (flags on for this project)."
                        : " (turn on both flags in Takeoff if that describes this job)."}{" "}
                      When building area &gt; 0, Apply suggestions uses this rule for
                      Trips and cascades hours / gauge / vehicle. Numbers stay editable.
                    </p>
                  </div>
                )}

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
                          displayDrivers[f.key] !== undefined
                            ? String(displayDrivers[f.key])
                            : ""
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

      {hasEarthworkTesting && buildingSf <= 0 && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: enter building area in Takeoff / Project facts above to suggest
          Earthwork Testing trips (1 trip / {divisor} SF, typical 2700–3000).
        </p>
      )}
    </div>
  );
}

function n(v: unknown, fallback = 0): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : fallback;
}
