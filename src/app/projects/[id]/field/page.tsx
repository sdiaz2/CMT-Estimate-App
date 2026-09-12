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
  DEFAULT_PAVEMENT_LF_PER_TRIP,
  DEFAULT_PAVEMENT_SF_PER_TRIP,
  DEFAULT_PIERS_PER_TRIP_BELLED,
  DEFAULT_PIERS_PER_TRIP_CASED,
  DEFAULT_PIERS_PER_TRIP_STRAIGHT,
  DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP,
  DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP,
  DEFAULT_UTILITY_TRENCH_LF_PER_TRIP,
  DEFAULT_YD3_PER_TRIP_GRADE_BEAMS,
  DEFAULT_YD3_PER_TRIP_BUILDING_SLAB,
  DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT,
  DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT,
  MIN_TRIPS_BUILDING_SLAB,
  MIN_TRIPS_GRADE_BEAMS_PIER_CAPS,
  concreteTripRuleLabels,
  earthworkTripRuleLabels,
  foundationTripRuleLabel,
  hasConcreteTakeoff,
  hasEarthworkTakeoff,
  hasFoundationTakeoff,
  isCipDeepFoundationsParent,
  isConcreteTestingReinforcingParent,
  isEarthworkTestingParent,
  parseDrivers,
  suggestConcreteTrips,
  suggestEarthworkTrips,
  suggestFoundationTrips,
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
  const suggestion = suggestEarthworkTrips(takeoff);
  const labels = earthworkTripRuleLabels(takeoff);
  const foundationSuggestion = suggestFoundationTrips(takeoff);
  const foundationLabel = foundationTripRuleLabel(takeoff);
  const foundationTakeoffApplies = hasFoundationTakeoff(takeoff);
  const concreteSuggestion = suggestConcreteTrips(takeoff);
  const concreteLabels = concreteTripRuleLabels(takeoff);
  const concreteTakeoffApplies = hasConcreteTakeoff(takeoff);
  const buildingSf = takeoff.buildingAreaSf ?? 0;
  const pavementSf = takeoff.pavementAreaSf ?? 0;
  const pavementLf = takeoff.pavementSubgradeLf ?? 0;
  const sidewalkLf = takeoff.sidewalkLf ?? 0;
  const utilityTrenchLf = takeoff.utilityTrenchLf ?? 0;
  const limeTreated = !!takeoff.limeTreatedPavementSubgrade;
  const ruleAppliesBuilding =
    !!takeoff.moistureConditionedSubgrade && !!takeoff.flexibleBaseCap;
  const hasEarthworkTesting = fieldParents.some((p) =>
    isEarthworkTestingParent(p.catalog.name)
  );
  const hasCipDeepFoundations = fieldParents.some((p) =>
    isCipDeepFoundationsParent(p.catalog.name)
  );
  const hasConcreteTesting = fieldParents.some((p) =>
    isConcreteTestingReinforcingParent(p.catalog.name)
  );
  const takeoffApplies = hasEarthworkTakeoff(takeoff);

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
              pavementAreaSf: project.pavementAreaSf,
              limeTreatedPavementSubgrade: project.limeTreatedPavementSubgrade,
              pavementSfPerTrip: project.pavementSfPerTrip,
              pavementSubgradeLf: project.pavementSubgradeLf,
              pavementLfPerTrip: project.pavementLfPerTrip,
              pavementNotes: project.pavementNotes,
              sidewalkLf: project.sidewalkLf,
              sidewalksBunchedTogether: project.sidewalksBunchedTogether,
              sidewalkSpreadLfPerTrip: project.sidewalkSpreadLfPerTrip,
              sidewalkBunchedLfPerTrip: project.sidewalkBunchedLfPerTrip,
              utilityTrenchLf: project.utilityTrenchLf,
              utilityTrenchLfPerTrip: project.utilityTrenchLfPerTrip,
              foundationScheduleTrips: project.foundationScheduleTrips,
              pierCount: project.pierCount,
              pierType: project.pierType,
              piersPerTripStraight: project.piersPerTripStraight,
              piersPerTripCased: project.piersPerTripCased,
              piersPerTripBelled: project.piersPerTripBelled,
              concreteYd3GradeBeamsPierCaps:
                project.concreteYd3GradeBeamsPierCaps,
              yd3PerTripGradeBeams: project.yd3PerTripGradeBeams,
              concreteYd3BuildingSlab: project.concreteYd3BuildingSlab,
              yd3PerTripBuildingSlab: project.yd3PerTripBuildingSlab,
              concreteYd3PrivatePavement: project.concreteYd3PrivatePavement,
              yd3PerTripPrivatePavement: project.yd3PerTripPrivatePavement,
              concreteYd3PublicPavement: project.concreteYd3PublicPavement,
              yd3PerTripPublicPavement: project.yd3PerTripPublicPavement,
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
            >
              Save takeoff facts
            </button>
            {takeoffApplies && (
              <p className="text-xs text-slate-600">
                Earthwork preview: <strong>{suggestion.total} trips</strong>
                {labels.combined ? ` — ${labels.combined}` : ""}
              </p>
            )}
            {foundationTakeoffApplies && (
              <p className="text-xs text-slate-600">
                Foundation preview:{" "}
                <strong>{foundationSuggestion.trips} trips</strong>
                {foundationSuggestion.source === "schedule"
                  ? " (from schedule)"
                  : " (from pier count)"}
              </p>
            )}
            {concreteTakeoffApplies && (
              <p className="text-xs text-slate-600">
                Concrete preview:{" "}
                <strong>{concreteSuggestion.total} trips</strong>
                {[
                  concreteSuggestion.gradeBeamsPierCapsTrips > 0
                    ? `grade beams/pier caps ${concreteSuggestion.gradeBeamsPierCapsTrips}`
                    : null,
                  concreteSuggestion.buildingSlabTrips > 0
                    ? `building slab ${concreteSuggestion.buildingSlabTrips}`
                    : null,
                  concreteSuggestion.privatePavementTrips > 0
                    ? `private pavement ${concreteSuggestion.privatePavementTrips}`
                    : null,
                  concreteSuggestion.publicPavementTrips > 0
                    ? `public pavement ${concreteSuggestion.publicPavementTrips}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" + ")
                  ? ` (${[
                      concreteSuggestion.gradeBeamsPierCapsTrips > 0
                        ? `grade beams/pier caps ${concreteSuggestion.gradeBeamsPierCapsTrips}`
                        : null,
                      concreteSuggestion.buildingSlabTrips > 0
                        ? `building slab ${concreteSuggestion.buildingSlabTrips}`
                        : null,
                      concreteSuggestion.privatePavementTrips > 0
                        ? `private pavement ${concreteSuggestion.privatePavementTrips}`
                        : null,
                      concreteSuggestion.publicPavementTrips > 0
                        ? `public pavement ${concreteSuggestion.publicPavementTrips}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" + ")})`
                  : ""}
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
            const isFoundation = isCipDeepFoundationsParent(parent.catalog.name);
            const isConcrete = isConcreteTestingReinforcingParent(
              parent.catalog.name
            );
            const displayDrivers =
              isEarthwork && takeoffApplies && n(drivers.trips) === 0
                ? { ...drivers, trips: suggestion.total }
                : isFoundation &&
                    foundationTakeoffApplies &&
                    n(drivers.trips) === 0
                  ? { ...drivers, trips: foundationSuggestion.trips }
                  : isConcrete &&
                      concreteTakeoffApplies &&
                      n(drivers.trips) === 0
                    ? { ...drivers, trips: concreteSuggestion.total }
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
                  <div className="mb-4 space-y-2">
                    {(buildingSf > 0 || !takeoffApplies) && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                        <p className="font-medium">{labels.building}</p>
                        <p className="mt-1 text-xs text-amber-900/80">
                          Moisture-conditioned subgrade + flexible base cap
                          {ruleAppliesBuilding
                            ? " (flags on for this project)."
                            : " (turn on both flags in Takeoff if that describes this job)."}
                        </p>
                      </div>
                    )}
                    {(limeTreated
                      ? pavementSf > 0 || !takeoffApplies
                      : pavementLf > 0 || !takeoffApplies) && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                        <p className="font-medium">{labels.pavement}</p>
                        <p className="mt-1 text-xs text-amber-900/80">
                          {limeTreated
                            ? "Lime-treated pavement uses the SF rule only (LF rule not applied)."
                            : "No lime treatment: pavement subgrade uses the LF rule only (SF rule not applied)."}
                        </p>
                      </div>
                    )}
                    {(sidewalkLf > 0 || !takeoffApplies) && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                        <p className="font-medium">{labels.sidewalk}</p>
                        <p className="mt-1 text-xs text-amber-900/80">
                          Spread-out default{" "}
                          {DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP} LF/trip; bunched{" "}
                          {DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP} LF/trip
                          (editable).
                        </p>
                      </div>
                    )}
                    {(utilityTrenchLf > 0 || !takeoffApplies) && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                        <p className="font-medium">{labels.utilityTrench}</p>
                        <p className="mt-1 text-xs text-amber-900/80">
                          Storm/sewer/water trench backfill: default{" "}
                          {DEFAULT_UTILITY_TRENCH_LF_PER_TRIP} LF/trip (typical
                          150–175, editable).
                        </p>
                      </div>
                    )}
                    {labels.combined && (
                      <div className="rounded-md border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-950">
                        {labels.combined}
                        <span className="mt-1 block text-xs font-normal text-amber-900/80">
                          Apply suggestions uses the total for Trips and cascades
                          hours / gauge / vehicle. Numbers stay editable.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {isFoundation && (
                  <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    <p className="font-medium">{foundationLabel}</p>
                    <p className="mt-1 text-xs text-amber-900/80">
                      Schedule trips override pier-count rules when set (&gt;0).
                      Straight-shaft default {DEFAULT_PIERS_PER_TRIP_STRAIGHT}{" "}
                      piers/trip (9–12); cased {DEFAULT_PIERS_PER_TRIP_CASED}{" "}
                      (4–6); belled {DEFAULT_PIERS_PER_TRIP_BELLED} (5–9). Apply
                      suggestions sets Trips and cascades Foundation Inspection /
                      OT / Vehicle. Numbers stay editable.
                    </p>
                  </div>
                )}

                {isConcrete && (
                  <div className="mb-4 space-y-2">
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      <p className="font-medium">
                        {concreteLabels.gradeBeamsPierCaps}
                      </p>
                      <p className="mt-1 text-xs text-amber-900/80">
                        Rule A — Grade beams and pier caps: max(
                        {MIN_TRIPS_GRADE_BEAMS_PIER_CAPS}, ceil(yd³ / divisor)).
                        Default {DEFAULT_YD3_PER_TRIP_GRADE_BEAMS} yd³/trip
                        (typical 100–175).
                      </p>
                    </div>
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      <p className="font-medium">
                        {concreteLabels.buildingSlab}
                      </p>
                      <p className="mt-1 text-xs text-amber-900/80">
                        Rule B — Building slab: 1 trip /{" "}
                        {DEFAULT_YD3_PER_TRIP_BUILDING_SLAB} yd³ or more; if
                        yd³ &gt; 0 but ceil &lt; 2, minimum{" "}
                        {MIN_TRIPS_BUILDING_SLAB} trips.
                      </p>
                    </div>
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      <p className="font-medium">
                        {concreteLabels.privatePavement}
                      </p>
                      <p className="mt-1 text-xs text-amber-900/80">
                        Rule C — Private pavement: 1 trip /{" "}
                        {DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT} yd³ or less;
                        trips = ceil(yd³ / divisor) only (no min-2).
                      </p>
                    </div>
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      <p className="font-medium">
                        {concreteLabels.publicPavement}
                      </p>
                      <p className="mt-1 text-xs text-amber-900/80">
                        Rule C — Public pavement: 1 trip /{" "}
                        {DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT} yd³ or less;
                        trips = ceil(yd³ / divisor) only (no min-2). Apply
                        suggestions sets Trips and cascades Concrete Testing /
                        OT / Vehicle. Numbers stay editable.
                      </p>
                    </div>
                    {concreteLabels.combined && (
                      <div className="rounded-md border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-950">
                        {concreteLabels.combined}
                      </div>
                    )}
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

      {hasEarthworkTesting && !takeoffApplies && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: enter building SF, pavement (lime SF or non-lime LF), sidewalk LF,
          and/or utility trench LF in Takeoff above. Defaults: building{" "}
          {DEFAULT_EARTHWORK_SF_PER_TRIP.toLocaleString()} SF/trip; lime pavement{" "}
          {DEFAULT_PAVEMENT_SF_PER_TRIP.toLocaleString()} SF/trip; non-lime{" "}
          {DEFAULT_PAVEMENT_LF_PER_TRIP} LF/trip; sidewalks{" "}
          {DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP}/{DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP}{" "}
          LF; utility trench {DEFAULT_UTILITY_TRENCH_LF_PER_TRIP} LF. Trips are
          summed.
        </p>
      )}

      {hasCipDeepFoundations && !foundationTakeoffApplies && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: for CIP Deep Foundations, enter schedule trips (overrides pier
          rules) or pier count + type. Defaults: straight-shaft{" "}
          {DEFAULT_PIERS_PER_TRIP_STRAIGHT} piers/trip; cased{" "}
          {DEFAULT_PIERS_PER_TRIP_CASED}; belled {DEFAULT_PIERS_PER_TRIP_BELLED}.
        </p>
      )}

      {hasConcreteTesting && !concreteTakeoffApplies && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: for Concrete Testing &amp; Reinforcing Steel Observations, enter
          grade beams / pier caps yd³ (default{" "}
          {DEFAULT_YD3_PER_TRIP_GRADE_BEAMS}/trip), building slab yd³ (default{" "}
          {DEFAULT_YD3_PER_TRIP_BUILDING_SLAB}/trip), and/or private/public
          pavement yd³ (defaults {DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT}/
          {DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT}). A/B use min{" "}
          {MIN_TRIPS_GRADE_BEAMS_PIER_CAPS} when volume &gt; 0; C is ceil only.
          Total = A + B + private + public.
        </p>
      )}
    </div>
  );
}

function n(v: unknown, fallback = 0): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : fallback;
}
