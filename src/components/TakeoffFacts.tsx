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
  normalizePierType,
  pierTypeLabel,
  suggestConcreteTrips,
  suggestEarthworkTrips,
  suggestFoundationTrips,
  type PierType,
} from "@/lib/heuristics";

export type TakeoffFactsValues = {
  buildingAreaSf?: number | null;
  moistureConditionedSubgrade?: boolean;
  flexibleBaseCap?: boolean;
  earthworkSfPerTrip?: number | null;
  moistureDepthNote?: string;
  flexibleBaseThicknessNote?: string;
  pavementAreaSf?: number | null;
  limeTreatedPavementSubgrade?: boolean;
  pavementSfPerTrip?: number | null;
  pavementSubgradeLf?: number | null;
  pavementLfPerTrip?: number | null;
  pavementNotes?: string;
  sidewalkLf?: number | null;
  sidewalksBunchedTogether?: boolean;
  sidewalkSpreadLfPerTrip?: number | null;
  sidewalkBunchedLfPerTrip?: number | null;
  utilityTrenchLf?: number | null;
  utilityTrenchLfPerTrip?: number | null;
  foundationScheduleTrips?: number | null;
  pierCount?: number | null;
  pierType?: string | null;
  piersPerTripStraight?: number | null;
  piersPerTripCased?: number | null;
  piersPerTripBelled?: number | null;
  concreteYd3GradeBeamsPierCaps?: number | null;
  yd3PerTripGradeBeams?: number | null;
  concreteYd3BuildingSlab?: number | null;
  yd3PerTripBuildingSlab?: number | null;
  concreteYd3PrivatePavement?: number | null;
  yd3PerTripPrivatePavement?: number | null;
  concreteYd3PublicPavement?: number | null;
  yd3PerTripPublicPavement?: number | null;
};

/** Shared Takeoff / Project facts fields (used inside a parent <form>). */
export function TakeoffFactsFields({
  values,
  compact = false,
}: {
  values?: TakeoffFactsValues;
  compact?: boolean;
}) {
  const buildingDivisor =
    values?.earthworkSfPerTrip && values.earthworkSfPerTrip > 0
      ? values.earthworkSfPerTrip
      : DEFAULT_EARTHWORK_SF_PER_TRIP;
  const pavementSfDivisor =
    values?.pavementSfPerTrip && values.pavementSfPerTrip > 0
      ? values.pavementSfPerTrip
      : DEFAULT_PAVEMENT_SF_PER_TRIP;
  const pavementLfDivisor =
    values?.pavementLfPerTrip && values.pavementLfPerTrip > 0
      ? values.pavementLfPerTrip
      : DEFAULT_PAVEMENT_LF_PER_TRIP;
  const sidewalkSpreadDivisor =
    values?.sidewalkSpreadLfPerTrip && values.sidewalkSpreadLfPerTrip > 0
      ? values.sidewalkSpreadLfPerTrip
      : DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP;
  const sidewalkBunchedDivisor =
    values?.sidewalkBunchedLfPerTrip && values.sidewalkBunchedLfPerTrip > 0
      ? values.sidewalkBunchedLfPerTrip
      : DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP;
  const utilityTrenchDivisor =
    values?.utilityTrenchLfPerTrip && values.utilityTrenchLfPerTrip > 0
      ? values.utilityTrenchLfPerTrip
      : DEFAULT_UTILITY_TRENCH_LF_PER_TRIP;
  const pierType = normalizePierType(values?.pierType);
  const piersStraightDivisor =
    values?.piersPerTripStraight && values.piersPerTripStraight > 0
      ? values.piersPerTripStraight
      : DEFAULT_PIERS_PER_TRIP_STRAIGHT;
  const piersCasedDivisor =
    values?.piersPerTripCased && values.piersPerTripCased > 0
      ? values.piersPerTripCased
      : DEFAULT_PIERS_PER_TRIP_CASED;
  const piersBelledDivisor =
    values?.piersPerTripBelled && values.piersPerTripBelled > 0
      ? values.piersPerTripBelled
      : DEFAULT_PIERS_PER_TRIP_BELLED;
  const yd3GradeBeamsDivisor =
    values?.yd3PerTripGradeBeams && values.yd3PerTripGradeBeams > 0
      ? values.yd3PerTripGradeBeams
      : DEFAULT_YD3_PER_TRIP_GRADE_BEAMS;
  const yd3BuildingSlabDivisor =
    values?.yd3PerTripBuildingSlab && values.yd3PerTripBuildingSlab > 0
      ? values.yd3PerTripBuildingSlab
      : DEFAULT_YD3_PER_TRIP_BUILDING_SLAB;
  const yd3PrivatePavementDivisor =
    values?.yd3PerTripPrivatePavement && values.yd3PerTripPrivatePavement > 0
      ? values.yd3PerTripPrivatePavement
      : DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT;
  const yd3PublicPavementDivisor =
    values?.yd3PerTripPublicPavement && values.yd3PerTripPublicPavement > 0
      ? values.yd3PerTripPublicPavement
      : DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT;
  const limeTreated = !!values?.limeTreatedPavementSubgrade;
  const sidewalksBunched = !!values?.sidewalksBunchedTogether;

  const suggestion = suggestEarthworkTrips({
    buildingAreaSf: values?.buildingAreaSf,
    earthworkSfPerTrip: buildingDivisor,
    pavementAreaSf: values?.pavementAreaSf,
    limeTreatedPavementSubgrade: limeTreated,
    pavementSfPerTrip: pavementSfDivisor,
    pavementSubgradeLf: values?.pavementSubgradeLf,
    pavementLfPerTrip: pavementLfDivisor,
    sidewalkLf: values?.sidewalkLf,
    sidewalksBunchedTogether: sidewalksBunched,
    sidewalkSpreadLfPerTrip: sidewalkSpreadDivisor,
    sidewalkBunchedLfPerTrip: sidewalkBunchedDivisor,
    utilityTrenchLf: values?.utilityTrenchLf,
    utilityTrenchLfPerTrip: utilityTrenchDivisor,
  });

  const buildingSf = values?.buildingAreaSf ?? 0;
  const pavementSf = values?.pavementAreaSf ?? 0;
  const pavementLf = values?.pavementSubgradeLf ?? 0;
  const sidewalkLf = values?.sidewalkLf ?? 0;
  const utilityTrenchLf = values?.utilityTrenchLf ?? 0;
  const foundationSuggestion = suggestFoundationTrips({
    foundationScheduleTrips: values?.foundationScheduleTrips,
    pierCount: values?.pierCount,
    pierType,
    piersPerTripStraight: piersStraightDivisor,
    piersPerTripCased: piersCasedDivisor,
    piersPerTripBelled: piersBelledDivisor,
  });
  const showFoundation = foundationSuggestion.trips > 0;
  const concreteSuggestion = suggestConcreteTrips({
    concreteYd3GradeBeamsPierCaps: values?.concreteYd3GradeBeamsPierCaps,
    yd3PerTripGradeBeams: yd3GradeBeamsDivisor,
    concreteYd3BuildingSlab: values?.concreteYd3BuildingSlab,
    yd3PerTripBuildingSlab: yd3BuildingSlabDivisor,
    concreteYd3PrivatePavement: values?.concreteYd3PrivatePavement,
    yd3PerTripPrivatePavement: yd3PrivatePavementDivisor,
    concreteYd3PublicPavement: values?.concreteYd3PublicPavement,
    yd3PerTripPublicPavement: yd3PublicPavementDivisor,
  });
  const gradeBeamsYd3 = values?.concreteYd3GradeBeamsPierCaps ?? 0;
  const buildingSlabYd3 = values?.concreteYd3BuildingSlab ?? 0;
  const privatePavementYd3 = values?.concreteYd3PrivatePavement ?? 0;
  const publicPavementYd3 = values?.concreteYd3PublicPavement ?? 0;
  const showConcrete = concreteSuggestion.total > 0;
  const showGradeBeams = (gradeBeamsYd3 ?? 0) > 0;
  const showBuildingSlab = (buildingSlabYd3 ?? 0) > 0;
  const showPrivatePavement = (privatePavementYd3 ?? 0) > 0;
  const showPublicPavement = (publicPavementYd3 ?? 0) > 0;
  const showBuilding = (buildingSf ?? 0) > 0;
  const showPavement =
    limeTreated ? (pavementSf ?? 0) > 0 : (pavementLf ?? 0) > 0;
  const showSidewalk = (sidewalkLf ?? 0) > 0;
  const showUtilityTrench = (utilityTrenchLf ?? 0) > 0;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Takeoff / Project facts
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Earthwork trips = building + pavement (lime SF <em>or</em> non-lime LF) +
          sidewalks + utility trench. Building default{" "}
          <strong>{DEFAULT_EARTHWORK_SF_PER_TRIP.toLocaleString()}</strong>{" "}
          SF/trip; lime pavement{" "}
          <strong>{DEFAULT_PAVEMENT_SF_PER_TRIP.toLocaleString()}</strong>{" "}
          SF/trip; non-lime pavement{" "}
          <strong>{DEFAULT_PAVEMENT_LF_PER_TRIP}</strong> LF/trip; sidewalks{" "}
          <strong>{DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP}</strong> LF (spread) /{" "}
          <strong>{DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP}</strong> LF (bunched);
          utility trench{" "}
          <strong>{DEFAULT_UTILITY_TRENCH_LF_PER_TRIP}</strong> LF/trip (typical
          150–175). Concrete: Rule A grade beams default{" "}
          <strong>{DEFAULT_YD3_PER_TRIP_GRADE_BEAMS}</strong> yd³/trip (min{" "}
          {MIN_TRIPS_GRADE_BEAMS_PIER_CAPS}); Rule B slab{" "}
          <strong>{DEFAULT_YD3_PER_TRIP_BUILDING_SLAB}</strong>; Rule C private{" "}
          <strong>{DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT}</strong> / public{" "}
          <strong>{DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT}</strong> (ceil only, no
          min-2). Suggestions never lock — edit freely after Apply.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Building area (SF)
          </span>
          <input
            name="buildingAreaSf"
            type="number"
            step="any"
            min="0"
            defaultValue={
              values?.buildingAreaSf != null ? String(values.buildingAreaSf) : ""
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. 100000"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Building SF per trip
          </span>
          <input
            name="earthworkSfPerTrip"
            type="number"
            step="any"
            min="1"
            defaultValue={String(buildingDivisor)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <span className="mt-0.5 block text-xs text-slate-500">
            typical 2700–3000 (editable)
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="moistureConditionedSubgrade"
            value="true"
            defaultChecked={!!values?.moistureConditionedSubgrade}
            className="rounded border-slate-300"
          />
          Moisture-conditioned subgrade
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="flexibleBaseCap"
            value="true"
            defaultChecked={!!values?.flexibleBaseCap}
            className="rounded border-slate-300"
          />
          Flexible base cap
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Moisture depth note (optional)
          </span>
          <input
            name="moistureDepthNote"
            type="text"
            defaultValue={values?.moistureDepthNote ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. 8 in moisture conditioning"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Flexible base thickness note (optional)
          </span>
          <input
            name="flexibleBaseThicknessNote"
            type="text"
            defaultValue={values?.flexibleBaseThicknessNote ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. 6 in flexible base"
          />
        </label>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Pavement subgrade
        </p>
        <label className="mb-3 inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="limeTreatedPavementSubgrade"
            value="true"
            defaultChecked={limeTreated}
            className="rounded border-slate-300"
          />
          Lime-treated pavement subgrade (uses SF rule; otherwise LF rule)
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Pavement area (SF) — lime-treated
            </span>
            <input
              name="pavementAreaSf"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.pavementAreaSf != null
                  ? String(values.pavementAreaSf)
                  : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 150000"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Pavement SF per trip
            </span>
            <input
              name="pavementSfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(pavementSfDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              typical 25,000–30,000 (default mid 27,500)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Pavement subgrade (LF) — not lime-treated
            </span>
            <input
              name="pavementSubgradeLf"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.pavementSubgradeLf != null
                  ? String(values.pavementSubgradeLf)
                  : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 2400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Pavement LF per trip
            </span>
            <input
              name="pavementLfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(pavementLfDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              typical 200–400 (default mid 300)
            </span>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="text-sm font-medium text-slate-700">
            Pavement notes (optional)
          </span>
          <input
            name="pavementNotes"
            type="text"
            defaultValue={values?.pavementNotes ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. 8 in lime-treated subgrade"
          />
        </label>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Sitework sidewalks
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Sidewalk length (LF)
            </span>
            <input
              name="sidewalkLf"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.sidewalkLf != null ? String(values.sidewalkLf) : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 500"
            />
          </label>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 pb-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="sidewalksBunchedTogether"
                value="true"
                defaultChecked={sidewalksBunched}
                className="rounded border-slate-300"
              />
              Sidewalks bunched together
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Spread-out LF per trip
            </span>
            <input
              name="sidewalkSpreadLfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(sidewalkSpreadDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              default 125 (when not bunched)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Bunched LF per trip
            </span>
            <input
              name="sidewalkBunchedLfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(sidewalkBunchedDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              default 150 (when bunched)
            </span>
          </label>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Utility trench backfill
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Utility trench length (LF)
            </span>
            <input
              name="utilityTrenchLf"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.utilityTrenchLf != null
                  ? String(values.utilityTrenchLf)
                  : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 800"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              storm / sewer / water trench
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Utility trench LF per trip
            </span>
            <input
              name="utilityTrenchLfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(utilityTrenchDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              typical 150–175 (default mid 162.5)
            </span>
          </label>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          CIP Deep Foundations (Drilled Straight Shaft Piers)
        </p>
        <p className="mb-3 text-xs text-slate-500">
          If a construction schedule is provided, enter schedule trips — that
          count overrides pier-count rules. Otherwise trips = ceil(pier count /
          piers per trip) by pier type: straight-shaft default{" "}
          <strong>{DEFAULT_PIERS_PER_TRIP_STRAIGHT}</strong> (typical 9–12),
          cased <strong>{DEFAULT_PIERS_PER_TRIP_CASED}</strong> (4–6), belled{" "}
          <strong>{DEFAULT_PIERS_PER_TRIP_BELLED}</strong> (5–9).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Schedule trips (optional)
            </span>
            <input
              name="foundationScheduleTrips"
              type="number"
              step="1"
              min="0"
              defaultValue={
                values?.foundationScheduleTrips != null &&
                values.foundationScheduleTrips > 0
                  ? String(values.foundationScheduleTrips)
                  : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 6 — overrides pier rules when set"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              Leave blank / 0 to use pier-count rules
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Pier count
            </span>
            <input
              name="pierCount"
              type="number"
              step="1"
              min="0"
              defaultValue={
                values?.pierCount != null && values.pierCount > 0
                  ? String(values.pierCount)
                  : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 36"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              Pier type
            </span>
            <select
              name="pierType"
              defaultValue={pierType}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="straight_shaft">
                Straight-shaft (1 trip / ~9–12 piers)
              </option>
              <option value="cased">Cased (1 trip / ~4–6 piers)</option>
              <option value="belled">
                Belled / underreamed (1 trip / ~5–9 piers)
              </option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Straight-shaft piers per trip
            </span>
            <input
              name="piersPerTripStraight"
              type="number"
              step="any"
              min="1"
              defaultValue={String(piersStraightDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              typical 9–12 (default mid 10.5)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Cased piers per trip
            </span>
            <input
              name="piersPerTripCased"
              type="number"
              step="any"
              min="1"
              defaultValue={String(piersCasedDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              typical 4–6 (default 5)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Belled / underreamed piers per trip
            </span>
            <input
              name="piersPerTripBelled"
              type="number"
              step="any"
              min="1"
              defaultValue={String(piersBelledDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              typical 5–9 (default 7)
            </span>
          </label>
        </div>
        {showFoundation && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {foundationSuggestion.source === "schedule" ? (
              <p>
                Schedule:{" "}
                <strong>{foundationSuggestion.trips} trips</strong> (overrides
                pier-count rules)
              </p>
            ) : (
              <p>
                {pierTypeLabel(pierType as PierType)}: ceil(
                {foundationSuggestion.pierCount} /{" "}
                {foundationSuggestion.piersPerTrip}) ={" "}
                <strong>{foundationSuggestion.trips} trips</strong>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Concrete Testing &amp; Reinforcing Steel Observations
        </p>
        <p className="mb-3 text-xs text-slate-500">
          Rule A — Grade beams/pier caps: max(
          {MIN_TRIPS_GRADE_BEAMS_PIER_CAPS}, ceil(yd³ / divisor)), default{" "}
          <strong>{DEFAULT_YD3_PER_TRIP_GRADE_BEAMS}</strong> (typical 100–175).
          Rule B — Building slab: max({MIN_TRIPS_BUILDING_SLAB}, ceil(yd³ /
          divisor)), default{" "}
          <strong>{DEFAULT_YD3_PER_TRIP_BUILDING_SLAB}</strong>. Rule C —
          Pavement: private ceil(yd³ /{" "}
          <strong>{DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT}</strong>), public
          ceil(yd³ / <strong>{DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT}</strong>) —
          no min-2. Total = A + B + private + public.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Grade beams / pier caps (yd³)
            </span>
            <input
              name="concreteYd3GradeBeamsPierCaps"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.concreteYd3GradeBeamsPierCaps != null &&
                values.concreteYd3GradeBeamsPierCaps > 0
                  ? String(values.concreteYd3GradeBeamsPierCaps)
                  : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              yd³ per trip (grade beams / pier caps)
            </span>
            <input
              name="yd3PerTripGradeBeams"
              type="number"
              step="any"
              min="1"
              defaultValue={String(yd3GradeBeamsDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              typical 100–175 (default mid 137.5)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Building slab (yd³)
            </span>
            <input
              name="concreteYd3BuildingSlab"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.concreteYd3BuildingSlab != null &&
                values.concreteYd3BuildingSlab > 0
                  ? String(values.concreteYd3BuildingSlab)
                  : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 200"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              yd³ per trip (building slab)
            </span>
            <input
              name="yd3PerTripBuildingSlab"
              type="number"
              step="any"
              min="1"
              defaultValue={String(yd3BuildingSlabDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              default 300 (1 trip / 300 yd³ or more; min 2 if less)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Private pavement (yd³)
            </span>
            <input
              name="concreteYd3PrivatePavement"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.concreteYd3PrivatePavement != null &&
                values.concreteYd3PrivatePavement > 0
                  ? String(values.concreteYd3PrivatePavement)
                  : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              yd³ per trip (private pavement)
            </span>
            <input
              name="yd3PerTripPrivatePavement"
              type="number"
              step="any"
              min="1"
              defaultValue={String(yd3PrivatePavementDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              default 500 (1 trip / 500 yd³ or less; ceil only)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Public pavement (yd³)
            </span>
            <input
              name="concreteYd3PublicPavement"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.concreteYd3PublicPavement != null &&
                values.concreteYd3PublicPavement > 0
                  ? String(values.concreteYd3PublicPavement)
                  : ""
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. 800"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              yd³ per trip (public pavement)
            </span>
            <input
              name="yd3PerTripPublicPavement"
              type="number"
              step="any"
              min="1"
              defaultValue={String(yd3PublicPavementDivisor)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-0.5 block text-xs text-slate-500">
              default 900 (1 trip / 900 yd³ or less; ceil only)
            </span>
          </label>
        </div>
        {showConcrete && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            {showGradeBeams && (
              <p>
                Grade beams / pier caps: max(
                {MIN_TRIPS_GRADE_BEAMS_PIER_CAPS}, ceil(
                {Number(gradeBeamsYd3).toLocaleString()} /{" "}
                {yd3GradeBeamsDivisor.toLocaleString()})) ={" "}
                <strong>
                  {concreteSuggestion.gradeBeamsPierCapsTrips} trips
                </strong>
              </p>
            )}
            {showBuildingSlab && (
              <p className={showGradeBeams ? "mt-1" : undefined}>
                Building slab: max({MIN_TRIPS_BUILDING_SLAB}, ceil(
                {Number(buildingSlabYd3).toLocaleString()} /{" "}
                {yd3BuildingSlabDivisor.toLocaleString()})) ={" "}
                <strong>{concreteSuggestion.buildingSlabTrips} trips</strong>
              </p>
            )}
            {showPrivatePavement && (
              <p
                className={
                  showGradeBeams || showBuildingSlab ? "mt-1" : undefined
                }
              >
                Private pavement: ceil(
                {Number(privatePavementYd3).toLocaleString()} /{" "}
                {yd3PrivatePavementDivisor.toLocaleString()}) ={" "}
                <strong>
                  {concreteSuggestion.privatePavementTrips} trips
                </strong>
              </p>
            )}
            {showPublicPavement && (
              <p
                className={
                  showGradeBeams || showBuildingSlab || showPrivatePavement
                    ? "mt-1"
                    : undefined
                }
              >
                Public pavement: ceil(
                {Number(publicPavementYd3).toLocaleString()} /{" "}
                {yd3PublicPavementDivisor.toLocaleString()}) ={" "}
                <strong>
                  {concreteSuggestion.publicPavementTrips} trips
                </strong>
              </p>
            )}
            <p className="mt-1 font-medium">
              Total concrete:{" "}
              {[
                showGradeBeams
                  ? concreteSuggestion.gradeBeamsPierCapsTrips
                  : null,
                showBuildingSlab ? concreteSuggestion.buildingSlabTrips : null,
                showPrivatePavement
                  ? concreteSuggestion.privatePavementTrips
                  : null,
                showPublicPavement
                  ? concreteSuggestion.publicPavementTrips
                  : null,
              ]
                .filter((x) => x != null)
                .join(" + ")}{" "}
              = {concreteSuggestion.total} trips
            </p>
          </div>
        )}
      </div>

      {(showBuilding || showPavement || showSidewalk || showUtilityTrench) && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {showBuilding && (
            <p>
              Building: ceil({Number(buildingSf).toLocaleString()} /{" "}
              {buildingDivisor.toLocaleString()}) ={" "}
              <strong>{suggestion.buildingTrips} trips</strong>
            </p>
          )}
          {showPavement && limeTreated && (
            <p className={showBuilding ? "mt-1" : undefined}>
              Pavement (lime SF): ceil({Number(pavementSf).toLocaleString()} /{" "}
              {pavementSfDivisor.toLocaleString()}) ={" "}
              <strong>{suggestion.pavementTrips} trips</strong>
            </p>
          )}
          {showPavement && !limeTreated && (
            <p className={showBuilding ? "mt-1" : undefined}>
              Pavement (LF): ceil({Number(pavementLf).toLocaleString()} /{" "}
              {pavementLfDivisor.toLocaleString()}) ={" "}
              <strong>{suggestion.pavementTrips} trips</strong>
            </p>
          )}
          {showSidewalk && (
            <p
              className={
                showBuilding || showPavement ? "mt-1" : undefined
              }
            >
              Sidewalks ({sidewalksBunched ? "bunched" : "spread"}): ceil(
              {Number(sidewalkLf).toLocaleString()} /{" "}
              {(sidewalksBunched
                ? sidewalkBunchedDivisor
                : sidewalkSpreadDivisor
              ).toLocaleString()}
              ) = <strong>{suggestion.sidewalkTrips} trips</strong>
            </p>
          )}
          {showUtilityTrench && (
            <p
              className={
                showBuilding || showPavement || showSidewalk
                  ? "mt-1"
                  : undefined
              }
            >
              Utility trench: ceil(
              {Number(utilityTrenchLf).toLocaleString()} /{" "}
              {utilityTrenchDivisor.toLocaleString()}) ={" "}
              <strong>{suggestion.utilityTrenchTrips} trips</strong>
            </p>
          )}
          {(
            [
              showBuilding,
              showPavement,
              showSidewalk,
              showUtilityTrench,
            ].filter(Boolean).length > 1
          ) && (
            <p className="mt-1 font-medium">
              Combined:{" "}
              {[
                showBuilding ? suggestion.buildingTrips : null,
                showPavement ? suggestion.pavementTrips : null,
                showSidewalk ? suggestion.sidewalkTrips : null,
                showUtilityTrench ? suggestion.utilityTrenchTrips : null,
              ]
                .filter((x) => x != null)
                .join(" + ")}{" "}
              = {suggestion.total} trips
            </p>
          )}
        </div>
      )}
    </div>
  );
}
