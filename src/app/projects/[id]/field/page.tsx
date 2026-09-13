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
  DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES,
  DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT,
  DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING,
  DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS,
  DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP,
  DEFAULT_STRUCTURE_LEVEL_COUNT,
  DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS,
  DEFAULT_YD3_PER_TRIP_GRADE_BEAMS,
  DEFAULT_YD3_PER_TRIP_BUILDING_SLAB,
  DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT,
  DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT,
  MIN_TRIPS_BUILDING_SLAB,
  MIN_TRIPS_GRADE_BEAMS_PIER_CAPS,
  concreteTripRuleLabels,
  earthworkTripRuleLabels,
  foundationTripRuleLabel,
  groutTripRuleLabel,
  hasConcreteTakeoff,
  hasEarthworkTakeoff,
  hasFoundationTakeoff,
  hasGroutTakeoff,
  hasMasonryTakeoff,
  hasStructuralSteelTakeoff,
  hasFloorFlatnessTakeoff,
  hasPostTensionTakeoff,
  isCipDeepFoundationsParent,
  isConcreteTestingReinforcingParent,
  isEarthworkTestingParent,
  isHighStrengthGroutParent,
  isMasonryTestingParent,
  isStructuralSteelParent,
  isFloorFlatnessParent,
  isPostTensionParent,
  masonryTripRuleLabels,
  floorFlatnessTripRuleLabel,
  postTensionTripRuleLabel,
  parseDrivers,
  suggestConcreteTrips,
  suggestEarthworkTrips,
  suggestFoundationTrips,
  suggestGroutTrips,
  suggestMasonryTrips,
  suggestStructuralSteelTrips,
  suggestFloorFlatnessTrips,
  suggestPostTensionTrips,
  structuralSteelTripRuleLabel,
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
  const masonrySuggestion = suggestMasonryTrips(takeoff);
  const masonryLabels = masonryTripRuleLabels(takeoff);
  const masonryTakeoffApplies = hasMasonryTakeoff(takeoff);
  const groutSuggestion = suggestGroutTrips(takeoff);
  const groutLabel = groutTripRuleLabel(takeoff);
  const groutTakeoffApplies = hasGroutTakeoff(takeoff);
  const steelSuggestion = suggestStructuralSteelTrips(takeoff);
  const steelLabel = structuralSteelTripRuleLabel(takeoff);
  const steelTakeoffApplies = hasStructuralSteelTakeoff(takeoff);
  const floorFlatnessSuggestion = suggestFloorFlatnessTrips(takeoff);
  const floorFlatnessLabel = floorFlatnessTripRuleLabel(takeoff);
  const floorFlatnessTakeoffApplies = hasFloorFlatnessTakeoff(takeoff);
  const postTensionSuggestion = suggestPostTensionTrips(takeoff);
  const postTensionLabel = postTensionTripRuleLabel(takeoff);
  const postTensionTakeoffApplies = hasPostTensionTakeoff(takeoff);
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
  const hasMasonryTesting = fieldParents.some((p) =>
    isMasonryTestingParent(p.catalog.name)
  );
  const hasGroutTesting = fieldParents.some((p) =>
    isHighStrengthGroutParent(p.catalog.name)
  );
  const hasStructuralSteel = fieldParents.some((p) =>
    isStructuralSteelParent(p.catalog.name)
  );
  const hasFloorFlatness = fieldParents.some((p) =>
    isFloorFlatnessParent(p.catalog.name)
  );
  const hasPostTension = fieldParents.some((p) =>
    isPostTensionParent(p.catalog.name)
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
              masonryLoadBearingCmuSf: project.masonryLoadBearingCmuSf,
              masonrySfPerTripLoadBearingCmu:
                project.masonrySfPerTripLoadBearingCmu,
              masonryElevatorBuildingCount:
                project.masonryElevatorBuildingCount,
              masonryElevatorShaftHeightFt:
                project.masonryElevatorShaftHeightFt,
              masonryFtPerTripElevatorShaft:
                project.masonryFtPerTripElevatorShaft,
              masonryCmuEnclosureCount: project.masonryCmuEnclosureCount,
              groutBaseplatesInSpecialInspection:
                project.groutBaseplatesInSpecialInspection,
              buildingPadSf: project.buildingPadSf,
              ft2PerTripGroutBaseplates: project.ft2PerTripGroutBaseplates,
              structuralSteelBuildingSf: project.structuralSteelBuildingSf,
              structuralSteelSfPerTrip: project.structuralSteelSfPerTrip,
              structuralSteelFinalInspectionTrips:
                project.structuralSteelFinalInspectionTrips,
              structureLevelCount: project.structureLevelCount,
              slabOnGradePourCount: project.slabOnGradePourCount,
              floorFlatnessSf: project.floorFlatnessSf,
              ft2PerTripFloorFlatness: project.ft2PerTripFloorFlatness,
              postTensionSlabPourCount: project.postTensionSlabPourCount,
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
            {groutTakeoffApplies && (
              <p className="text-xs text-slate-600">
                Grout preview:{" "}
                <strong>{groutSuggestion.trips} trips</strong>
                {groutSuggestion.padSfSource === "buildingAreaSf"
                  ? " (pad from building area)"
                  : " (from building pad)"}
              </p>
            )}
            {steelTakeoffApplies && (
              <p className="text-xs text-slate-600">
                Structural Steel Inspections preview:{" "}
                <strong>{steelSuggestion.trips} trips</strong> (
                {steelSuggestion.structureLevelCount} levels ×{" "}
                {steelSuggestion.perLevelTrips}
                {steelSuggestion.sfSource === "buildingAreaSf"
                  ? "; SF from building area"
                  : ""})
              </p>
            )}
            {floorFlatnessTakeoffApplies && (
              <p className="text-xs text-slate-600">
                Floor Flatness preview:{" "}
                <strong>{floorFlatnessSuggestion.trips} trips</strong> (pours:{" "}
                {floorFlatnessSuggestion.pourTrips} | SF rule:{" "}
                {floorFlatnessSuggestion.sfTrips} → max)
                {floorFlatnessSuggestion.sfSource === "buildingAreaSf"
                  ? " (SF from building area)"
                  : ""}
              </p>
            )}
            {postTensionTakeoffApplies && (
              <p className="text-xs text-slate-600">
                Post-Tension preview:{" "}
                <strong>{postTensionSuggestion.trips} trips</strong> (2 ×{" "}
                {postTensionSuggestion.pourCount} pours)
                {postTensionSuggestion.pourSource === "slabOnGradePourCount"
                  ? " (from slab-on-grade pours)"
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
            const isMasonry = isMasonryTestingParent(parent.catalog.name);
            const isGrout = isHighStrengthGroutParent(parent.catalog.name);
            const isSteel = isStructuralSteelParent(parent.catalog.name);
            const isFloorFlatness = isFloorFlatnessParent(parent.catalog.name);
            const isPostTension = isPostTensionParent(parent.catalog.name);
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
                    : isMasonry &&
                        masonryTakeoffApplies &&
                        n(drivers.trips) === 0
                      ? { ...drivers, trips: masonrySuggestion.total }
                      : isGrout &&
                          groutTakeoffApplies &&
                          n(drivers.trips) === 0
                        ? { ...drivers, trips: groutSuggestion.trips }
                        : isSteel &&
                            steelTakeoffApplies &&
                            n(drivers.trips) === 0
                          ? { ...drivers, trips: steelSuggestion.trips }
                          : isFloorFlatness &&
                              floorFlatnessTakeoffApplies &&
                              n(drivers.trips) === 0
                            ? {
                                ...drivers,
                                trips: floorFlatnessSuggestion.trips,
                              }
                            : isPostTension &&
                                postTensionTakeoffApplies &&
                                n(drivers.trips) === 0
                              ? {
                                  ...drivers,
                                  trips: postTensionSuggestion.trips,
                                }
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

                {isMasonry && (
                  <div className="mb-4 space-y-2">
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      <p className="font-medium">
                        {masonryLabels.loadBearingCmu}
                      </p>
                      <p className="mt-1 text-xs text-amber-900/80">
                        Rule A — Load-bearing CMU wall: 1 trip /{" "}
                        {DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING.toLocaleString()}{" "}
                        SF or less; trips = ceil(SF / divisor).
                      </p>
                    </div>
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      <p className="font-medium">
                        {masonryLabels.elevatorShaft}
                      </p>
                      <p className="mt-1 text-xs text-amber-900/80">
                        Rule B — Multifamily elevator shaft CMU: buildings with
                        elevator × ceil(shaft height ft /{" "}
                        {DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT}) (height is
                        per building).
                      </p>
                    </div>
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                      <p className="font-medium">{masonryLabels.enclosure}</p>
                      <p className="mt-1 text-xs text-amber-900/80">
                        Rule C — Dumpster and/or equipment CMU enclosures: 1 trip
                        each. Apply suggestions sets Trips and cascades Masonry
                        Testing / Vehicle. Numbers stay editable.
                      </p>
                    </div>
                    {masonryLabels.combined && (
                      <div className="rounded-md border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-950">
                        {masonryLabels.combined}
                      </div>
                    )}
                  </div>
                )}

                {isGrout && (
                  <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    <p className="font-medium">{groutLabel}</p>
                    <p className="mt-1 text-xs text-amber-900/80">
                      One (1) trip for every{" "}
                      {DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES.toLocaleString()}{" "}
                      ft² of building pad, only if grout baseplates are present
                      in special inspection. Pad SF falls back to building area
                      when blank. Apply suggestions sets Trips and cascades
                      High-Strength Grout Testing hours (~4 hr/trip) and Vehicle.
                      Numbers stay editable.
                    </p>
                  </div>
                )}

                {isSteel && (
                  <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    <p className="font-medium">{steelLabel}</p>
                    {steelTakeoffApplies && (
                      <p className="mt-1 text-sm">
                        {steelSuggestion.structureLevelCount} levels × (ceil(SF/
                        {steelSuggestion.sfPerTrip.toLocaleString()})+
                        {steelSuggestion.finalTripsPerLevel} final)
                      </p>
                    )}
                    <p className="mt-1 text-xs text-amber-900/80">
                      Per level: 1 trip /{" "}
                      {DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP.toLocaleString()}{" "}
                      ft² + {DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS}{" "}
                      final, then × structure levels (default{" "}
                      {DEFAULT_STRUCTURE_LEVEL_COUNT}). Steel SF falls back to
                      building area. Apply suggestions sets Trips and cascades
                      hours (~4 hr/trip) and Vehicle. Optional Bolting/Welding/NDT
                      breakouts do not use this rule. Numbers stay editable.
                    </p>
                  </div>
                )}

                {isFloorFlatness && (
                  <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    <p className="font-medium">{floorFlatnessLabel}</p>
                    {floorFlatnessTakeoffApplies && (
                      <p className="mt-1 text-sm">
                        pours: {floorFlatnessSuggestion.pourTrips} | SF rule:{" "}
                        {floorFlatnessSuggestion.sfTrips} → using max{" "}
                        <strong>{floorFlatnessSuggestion.trips}</strong>
                      </p>
                    )}
                    <p className="mt-1 text-xs text-amber-900/80">
                      One (1) trip per slab-on-grade pour or 1 trip /{" "}
                      {DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS.toLocaleString()}{" "}
                      ft² — use max of both. Floor flatness SF falls back to
                      building area. Apply suggestions sets Trips and cascades
                      hours (~4 hr/trip) and Vehicle. Numbers stay editable.
                    </p>
                  </div>
                )}

                {isPostTension && (
                  <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    <p className="font-medium">{postTensionLabel}</p>
                    {postTensionTakeoffApplies && (
                      <p className="mt-1 text-sm">
                        Suggested:{" "}
                        <strong>{postTensionSuggestion.trips}</strong> trips (2
                        × {postTensionSuggestion.pourCount} pours)
                      </p>
                    )}
                    <p className="mt-1 text-xs text-amber-900/80">
                      Trips = 2 × pours (one pre-pour + one tendon stressing
                      visit per pour). Dedicated pour count falls back to
                      slab-on-grade (often the same). Apply suggestions sets
                      Trips and one Post-Tension Testing &amp; Observations hours
                      line (~4 hr/trip) plus Vehicle — not separate pre-pour /
                      stressing rows. Numbers stay editable.
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

      {hasMasonryTesting && !masonryTakeoffApplies && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: for Masonry Testing &amp; Observations, enter load-bearing CMU SF
          (default {DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING.toLocaleString()}{" "}
          SF/trip), multifamily elevator building count + shaft height ft/building
          (default {DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT} ft/trip), and/or
          CMU enclosure count (1 trip each). Total = A + B + C.
        </p>
      )}

      {hasGroutTesting && !groutTakeoffApplies && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: for High-Strength Grout Testing &amp; Observations, turn on
          &quot;grout baseplates in special inspection&quot; and enter building
          pad SF (or rely on building area). Default{" "}
          {DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES.toLocaleString()} ft²/trip.
        </p>
      )}

      {hasStructuralSteel && !steelTakeoffApplies && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: for Structural Steel Inspections, enter steel building SF (or rely
          on building area) and structure levels (default{" "}
          {DEFAULT_STRUCTURE_LEVEL_COUNT}). Per level:{" "}
          {DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP.toLocaleString()} SF/trip +{" "}
          {DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS} final; total = levels ×
          per-level trips.
        </p>
      )}

      {hasFloorFlatness && !floorFlatnessTakeoffApplies && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: for Floor Flatness Testing &amp; Observations, enter slab-on-grade
          pour count and/or floor flatness SF (falls back to building area).
          Suggested trips = max(pours, ceil(SF /{" "}
          {DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS.toLocaleString()})).
        </p>
      )}

      {hasPostTension && !postTensionTakeoffApplies && (
        <p className="mt-4 text-xs text-slate-500">
          Tip: for Post-Tension Testing &amp; Observations, enter post-tension
          slab pour count (or rely on slab-on-grade pours). Suggested trips = 2 ×
          pours.
        </p>
      )}
    </div>
  );
}

function n(v: unknown, fallback = 0): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : fallback;
}
