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
  DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES,
  DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT,
  DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING,
  DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS,
  DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP,
  DEFAULT_STRUCTURE_LEVEL_COUNT,
  DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS,
  DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT,
  DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT,
  MIN_TRIPS_BUILDING_SLAB,
  MIN_TRIPS_GRADE_BEAMS_PIER_CAPS,
  normalizePierType,
  pierTypeLabel,
  suggestConcreteTrips,
  suggestEarthworkTrips,
  suggestFoundationTrips,
  suggestGroutTrips,
  suggestMasonryTrips,
  suggestStructuralSteelTrips,
  suggestFloorFlatnessTrips,
  suggestPostTensionTrips,
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
  masonryLoadBearingCmuSf?: number | null;
  masonrySfPerTripLoadBearingCmu?: number | null;
  masonryElevatorBuildingCount?: number | null;
  masonryElevatorShaftHeightFt?: number | null;
  masonryFtPerTripElevatorShaft?: number | null;
  masonryCmuEnclosureCount?: number | null;
  groutBaseplatesInSpecialInspection?: boolean;
  buildingPadSf?: number | null;
  ft2PerTripGroutBaseplates?: number | null;
  structuralSteelBuildingSf?: number | null;
  structuralSteelSfPerTrip?: number | null;
  structuralSteelFinalInspectionTrips?: number | null;
  structureLevelCount?: number | null;
  slabOnGradePourCount?: number | null;
  floorFlatnessSf?: number | null;
  ft2PerTripFloorFlatness?: number | null;
  postTensionSlabPourCount?: number | null;
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
  const masonryLoadBearingDivisor =
    values?.masonrySfPerTripLoadBearingCmu &&
    values.masonrySfPerTripLoadBearingCmu > 0
      ? values.masonrySfPerTripLoadBearingCmu
      : DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING;
  const masonryElevatorShaftDivisor =
    values?.masonryFtPerTripElevatorShaft &&
    values.masonryFtPerTripElevatorShaft > 0
      ? values.masonryFtPerTripElevatorShaft
      : DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT;
  const groutFt2Divisor =
    values?.ft2PerTripGroutBaseplates &&
    values.ft2PerTripGroutBaseplates > 0
      ? values.ft2PerTripGroutBaseplates
      : DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES;
  const structuralSteelSfDivisor =
    values?.structuralSteelSfPerTrip && values.structuralSteelSfPerTrip > 0
      ? values.structuralSteelSfPerTrip
      : DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP;
  const structuralSteelFinalTrips =
    values?.structuralSteelFinalInspectionTrips != null &&
    values.structuralSteelFinalInspectionTrips >= 0
      ? values.structuralSteelFinalInspectionTrips
      : DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS;
  const structureLevelCount =
    values?.structureLevelCount != null && values.structureLevelCount >= 1
      ? Math.floor(values.structureLevelCount)
      : DEFAULT_STRUCTURE_LEVEL_COUNT;
  const floorFlatnessFt2Divisor =
    values?.ft2PerTripFloorFlatness && values.ft2PerTripFloorFlatness > 0
      ? values.ft2PerTripFloorFlatness
      : DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS;
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
  const masonrySuggestion = suggestMasonryTrips({
    masonryLoadBearingCmuSf: values?.masonryLoadBearingCmuSf,
    masonrySfPerTripLoadBearingCmu: masonryLoadBearingDivisor,
    masonryElevatorBuildingCount: values?.masonryElevatorBuildingCount,
    masonryElevatorShaftHeightFt: values?.masonryElevatorShaftHeightFt,
    masonryFtPerTripElevatorShaft: masonryElevatorShaftDivisor,
    masonryCmuEnclosureCount: values?.masonryCmuEnclosureCount,
  });
  const loadBearingCmuSf = values?.masonryLoadBearingCmuSf ?? 0;
  const elevatorBuildingCount = values?.masonryElevatorBuildingCount ?? 0;
  const elevatorShaftHeightFt = values?.masonryElevatorShaftHeightFt ?? 0;
  const cmuEnclosureCount = values?.masonryCmuEnclosureCount ?? 0;
  const showMasonry = masonrySuggestion.total > 0;
  const showLoadBearingCmu = (loadBearingCmuSf ?? 0) > 0;
  const showElevatorShaft =
    (elevatorBuildingCount ?? 0) > 0 && (elevatorShaftHeightFt ?? 0) > 0;
  const showEnclosure = (cmuEnclosureCount ?? 0) > 0;
  const groutSuggestion = suggestGroutTrips({
    groutBaseplatesInSpecialInspection:
      values?.groutBaseplatesInSpecialInspection,
    buildingPadSf: values?.buildingPadSf,
    buildingAreaSf: values?.buildingAreaSf,
    ft2PerTripGroutBaseplates: groutFt2Divisor,
  });
  const showGrout = groutSuggestion.trips > 0;
  const groutBaseplates = !!values?.groutBaseplatesInSpecialInspection;
  const steelSuggestion = suggestStructuralSteelTrips({
    structuralSteelBuildingSf: values?.structuralSteelBuildingSf,
    buildingAreaSf: values?.buildingAreaSf,
    structuralSteelSfPerTrip: structuralSteelSfDivisor,
    structuralSteelFinalInspectionTrips: structuralSteelFinalTrips,
    structureLevelCount,
  });
  const showSteel = steelSuggestion.trips > 0;
  const floorFlatnessSuggestion = suggestFloorFlatnessTrips({
    slabOnGradePourCount: values?.slabOnGradePourCount,
    floorFlatnessSf: values?.floorFlatnessSf,
    buildingAreaSf: values?.buildingAreaSf,
    ft2PerTripFloorFlatness: floorFlatnessFt2Divisor,
  });
  const showFloorFlatness = floorFlatnessSuggestion.trips > 0;
  const postTensionSuggestion = suggestPostTensionTrips({
    postTensionSlabPourCount: values?.postTensionSlabPourCount,
    slabOnGradePourCount: values?.slabOnGradePourCount,
  });
  const showPostTension = postTensionSuggestion.trips > 0;
  const showBuilding = (buildingSf ?? 0) > 0;
  const showPavement =
    limeTreated ? (pavementSf ?? 0) > 0 : (pavementLf ?? 0) > 0;
  const showSidewalk = (sidewalkLf ?? 0) > 0;
  const showUtilityTrench = (utilityTrenchLf ?? 0) > 0;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <h3 className="text-sm font-semibold text-umber">
          Quantities from the plans
        </h3>
        <p className="mt-1 text-sm text-umber-muted">
          Enter quantities from the plans. Open a section only if that work is on this job —
          suggestions stay editable after you apply them.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">
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
            className="input-soft mt-1.5 w-full text-sm"
            placeholder="e.g. 100000"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">
            Building SF per trip
          </span>
          <input
            name="earthworkSfPerTrip"
            type="number"
            step="any"
            min="1"
            defaultValue={String(buildingDivisor)}
            className="input-soft mt-1.5 w-full text-sm"
          />
          <span className="mt-0.5 block text-xs text-umber-faint">
            typical 2700–3000 (editable)
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-umber-soft">
          <input
            type="checkbox"
            name="moistureConditionedSubgrade"
            value="true"
            defaultChecked={!!values?.moistureConditionedSubgrade}
            className="rounded accent-terracotta"
          />
          Moisture-conditioned subgrade
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-umber-soft">
          <input
            type="checkbox"
            name="flexibleBaseCap"
            value="true"
            defaultChecked={!!values?.flexibleBaseCap}
            className="rounded accent-terracotta"
          />
          Flexible base cap
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">
            Moisture depth note (optional)
          </span>
          <input
            name="moistureDepthNote"
            type="text"
            defaultValue={values?.moistureDepthNote ?? ""}
            className="input-soft mt-1.5 w-full text-sm"
            placeholder="e.g. 8 in moisture conditioning"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">
            Flexible base thickness note (optional)
          </span>
          <input
            name="flexibleBaseThicknessNote"
            type="text"
            defaultValue={values?.flexibleBaseThicknessNote ?? ""}
            className="input-soft mt-1.5 w-full text-sm"
            placeholder="e.g. 6 in flexible base"
          />
        </label>
      </div>

      <details className="takeoff-section" open={compact}>
        <summary>Pavement</summary>

        <label className="mb-3 inline-flex items-center gap-2 text-sm text-umber-soft">
          <input
            type="checkbox"
            name="limeTreatedPavementSubgrade"
            value="true"
            defaultChecked={limeTreated}
            className="rounded accent-terracotta"
          />
          Lime-treated pavement subgrade (uses SF rule; otherwise LF rule)
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 150000"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Pavement SF per trip
            </span>
            <input
              name="pavementSfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(pavementSfDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              typical 25,000–30,000 (default mid 27,500)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 2400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Pavement LF per trip
            </span>
            <input
              name="pavementLfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(pavementLfDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              typical 200–400 (default mid 300)
            </span>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="text-sm font-medium text-umber-soft">
            Pavement notes (optional)
          </span>
          <input
            name="pavementNotes"
            type="text"
            defaultValue={values?.pavementNotes ?? ""}
            className="input-soft mt-1.5 w-full text-sm"
            placeholder="e.g. 8 in lime-treated subgrade"
          />
        </label>
      </details>

      <details className="takeoff-section" open={compact}>
        <summary>Sidewalks</summary>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 500"
            />
          </label>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 pb-2 text-sm text-umber-soft">
              <input
                type="checkbox"
                name="sidewalksBunchedTogether"
                value="true"
                defaultChecked={sidewalksBunched}
                className="rounded accent-terracotta"
              />
              Sidewalks bunched together
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Spread-out LF per trip
            </span>
            <input
              name="sidewalkSpreadLfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(sidewalkSpreadDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 125 (when not bunched)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Bunched LF per trip
            </span>
            <input
              name="sidewalkBunchedLfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(sidewalkBunchedDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 150 (when bunched)
            </span>
          </label>
        </div>
      </details>

      <details className="takeoff-section" open={compact}>
        <summary>Utility trenches</summary>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 800"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              storm / sewer / water trench
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Utility trench LF per trip
            </span>
            <input
              name="utilityTrenchLfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(utilityTrenchDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              typical 150–175 (default mid 162.5)
            </span>
          </label>
        </div>
      </details>

      <details className="takeoff-section" open={compact}>
        <summary>Deep foundations (piers)</summary>

        <p className="mb-3 text-xs text-umber-faint">
          If a construction schedule is provided, enter schedule trips — that
          count overrides pier-count rules. Otherwise trips = ceil(pier count /
          piers per trip) by pier type: straight-shaft default{" "}
          <strong>{DEFAULT_PIERS_PER_TRIP_STRAIGHT}</strong> (typical 9–12),
          cased <strong>{DEFAULT_PIERS_PER_TRIP_CASED}</strong> (4–6), belled{" "}
          <strong>{DEFAULT_PIERS_PER_TRIP_BELLED}</strong> (5–9).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 6 — overrides pier rules when set"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              Leave blank / 0 to use pier-count rules
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 36"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-umber-soft">
              Pier type
            </span>
            <select
              name="pierType"
              defaultValue={pierType}
              className="input-soft !rounded-2xl mt-1.5 w-full text-sm"
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
            <span className="text-sm font-medium text-umber-soft">
              Straight-shaft piers per trip
            </span>
            <input
              name="piersPerTripStraight"
              type="number"
              step="any"
              min="1"
              defaultValue={String(piersStraightDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              typical 9–12 (default mid 10.5)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Cased piers per trip
            </span>
            <input
              name="piersPerTripCased"
              type="number"
              step="any"
              min="1"
              defaultValue={String(piersCasedDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              typical 4–6 (default 5)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Belled / underreamed piers per trip
            </span>
            <input
              name="piersPerTripBelled"
              type="number"
              step="any"
              min="1"
              defaultValue={String(piersBelledDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              typical 5–9 (default 7)
            </span>
          </label>
        </div>
        {showFoundation && (
          <div className="mt-3 hint-banner px-4 py-3 text-sm">
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
      </details>

      <details className="takeoff-section" open={compact}>
        <summary>Concrete & rebar</summary>

        <p className="mb-3 text-xs text-umber-faint">
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
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              yd³ per trip (grade beams / pier caps)
            </span>
            <input
              name="yd3PerTripGradeBeams"
              type="number"
              step="any"
              min="1"
              defaultValue={String(yd3GradeBeamsDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              typical 100–175 (default mid 137.5)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 200"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              yd³ per trip (building slab)
            </span>
            <input
              name="yd3PerTripBuildingSlab"
              type="number"
              step="any"
              min="1"
              defaultValue={String(yd3BuildingSlabDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 300 (1 trip / 300 yd³ or more; min 2 if less)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              yd³ per trip (private pavement)
            </span>
            <input
              name="yd3PerTripPrivatePavement"
              type="number"
              step="any"
              min="1"
              defaultValue={String(yd3PrivatePavementDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 500 (1 trip / 500 yd³ or less; ceil only)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
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
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 800"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              yd³ per trip (public pavement)
            </span>
            <input
              name="yd3PerTripPublicPavement"
              type="number"
              step="any"
              min="1"
              defaultValue={String(yd3PublicPavementDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 900 (1 trip / 900 yd³ or less; ceil only)
            </span>
          </label>
        </div>
        {showConcrete && (
          <div className="mt-3 hint-banner px-4 py-3 text-sm">
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
      </details>


      <details className="takeoff-section" open={compact}>
        <summary>Masonry</summary>

        <p className="mb-3 text-xs text-umber-faint">
          Rule A — Load-bearing CMU: ceil(SF / divisor), default{" "}
          <strong>{DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING.toLocaleString()}</strong>{" "}
          SF/trip. Rule B — Elevator shaft CMU: buildings with elevator ×
          ceil(height ft /{" "}
          <strong>{DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT}</strong>). Rule C —
          Dumpster/equipment CMU enclosures: 1 trip each. Total = A + B + C.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Load-bearing CMU wall (SF)
            </span>
            <input
              name="masonryLoadBearingCmuSf"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.masonryLoadBearingCmuSf != null &&
                values.masonryLoadBearingCmuSf > 0
                  ? String(values.masonryLoadBearingCmuSf)
                  : ""
              }
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 12000"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              SF per trip (load-bearing CMU)
            </span>
            <input
              name="masonrySfPerTripLoadBearingCmu"
              type="number"
              step="any"
              min="1"
              defaultValue={String(masonryLoadBearingDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 5,000 (1 trip / 5,000 SF or less)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Buildings with elevator
            </span>
            <input
              name="masonryElevatorBuildingCount"
              type="number"
              step="1"
              min="0"
              defaultValue={
                values?.masonryElevatorBuildingCount != null &&
                values.masonryElevatorBuildingCount > 0
                  ? String(values.masonryElevatorBuildingCount)
                  : ""
              }
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 2"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              multifamily buildings that have an elevator
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Elevator shaft CMU height (ft per building)
            </span>
            <input
              name="masonryElevatorShaftHeightFt"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.masonryElevatorShaftHeightFt != null &&
                values.masonryElevatorShaftHeightFt > 0
                  ? String(values.masonryElevatorShaftHeightFt)
                  : ""
              }
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 48"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              ft per trip (elevator shaft)
            </span>
            <input
              name="masonryFtPerTripElevatorShaft"
              type="number"
              step="any"
              min="1"
              defaultValue={String(masonryElevatorShaftDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 16 (1 trip / 16 ft height per building)
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              CMU enclosures (dumpster / equipment)
            </span>
            <input
              name="masonryCmuEnclosureCount"
              type="number"
              step="1"
              min="0"
              defaultValue={
                values?.masonryCmuEnclosureCount != null &&
                values.masonryCmuEnclosureCount > 0
                  ? String(values.masonryCmuEnclosureCount)
                  : ""
              }
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 3"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              1 trip each
            </span>
          </label>
        </div>
        {showMasonry && (
          <div className="mt-3 hint-banner px-4 py-3 text-sm">
            {showLoadBearingCmu && (
              <p>
                Load-bearing CMU: ceil(
                {Number(loadBearingCmuSf).toLocaleString()} /{" "}
                {masonryLoadBearingDivisor.toLocaleString()}) ={" "}
                <strong>
                  {masonrySuggestion.loadBearingCmuTrips} trips
                </strong>
              </p>
            )}
            {showElevatorShaft && (
              <p className={showLoadBearingCmu ? "mt-1" : undefined}>
                Elevator shaft: {Number(elevatorBuildingCount)} × ceil(
                {Number(elevatorShaftHeightFt).toLocaleString()} /{" "}
                {masonryElevatorShaftDivisor.toLocaleString()}) ={" "}
                <strong>
                  {masonrySuggestion.elevatorShaftTrips} trips
                </strong>
              </p>
            )}
            {showEnclosure && (
              <p
                className={
                  showLoadBearingCmu || showElevatorShaft ? "mt-1" : undefined
                }
              >
                Enclosures: {Number(cmuEnclosureCount)} × 1 ={" "}
                <strong>{masonrySuggestion.enclosureTrips} trips</strong>
              </p>
            )}
            <p className="mt-1 font-medium">
              Total masonry:{" "}
              {[
                showLoadBearingCmu
                  ? masonrySuggestion.loadBearingCmuTrips
                  : null,
                showElevatorShaft
                  ? masonrySuggestion.elevatorShaftTrips
                  : null,
                showEnclosure ? masonrySuggestion.enclosureTrips : null,
              ]
                .filter((x) => x != null)
                .join(" + ")}{" "}
              = {masonrySuggestion.total} trips
            </p>
          </div>
        )}
      </details>

      <details className="takeoff-section" open={compact}>
        <summary>High-strength grout</summary>

        <p className="mb-3 text-xs text-umber-faint">
          One (1) trip for every{" "}
          <strong>{DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES.toLocaleString()}</strong>{" "}
          ft² of building pad, <em>only if</em> grout baseplates are present in
          special inspection requirements. Building pad SF often equals building
          area — if pad is blank, building area is used.
        </p>
        <label className="mb-3 inline-flex items-center gap-2 text-sm text-umber-soft">
          <input
            type="checkbox"
            name="groutBaseplatesInSpecialInspection"
            value="true"
            defaultChecked={groutBaseplates}
            className="rounded accent-terracotta"
          />
          Grout baseplates in special inspection requirements
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Building pad (SF)
            </span>
            <input
              name="buildingPadSf"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.buildingPadSf != null && values.buildingPadSf > 0
                  ? String(values.buildingPadSf)
                  : ""
              }
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 100000 — blank uses building area"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              often equals building area; falls back to building area when blank
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              ft² per trip (grout baseplates)
            </span>
            <input
              name="ft2PerTripGroutBaseplates"
              type="number"
              step="any"
              min="1"
              defaultValue={String(groutFt2Divisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 17,000
            </span>
          </label>
        </div>
        {showGrout && (
          <div className="mt-3 hint-banner px-4 py-3 text-sm">
            <p>
              Grout baseplates: ceil(
              {groutSuggestion.padSf.toLocaleString()} /{" "}
              {groutSuggestion.ft2PerTrip.toLocaleString()}) ={" "}
              <strong>{groutSuggestion.trips} trips</strong>
              {groutSuggestion.padSfSource === "buildingAreaSf"
                ? " (using building area)"
                : ""}
            </p>
          </div>
        )}
      </details>

      <details className="takeoff-section" open={compact}>
        <summary>Structural steel</summary>

        <p className="mb-3 text-xs text-umber-faint">
          Per level: one (1) trip for every{" "}
          <strong>
            {DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP.toLocaleString()}
          </strong>{" "}
          ft² plus{" "}
          <strong>{DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS}</strong>{" "}
          final — then multiply by structure levels. Applied to{" "}
          <strong>Structural Steel Inspections</strong> only. Optional Bolting /
          Welding / NDT breakouts can be added manually. Steel building SF
          (typically floor plate) falls back to building area when blank. Final
          is only added when area &gt; 0.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Structural steel building (SF)
            </span>
            <input
              name="structuralSteelBuildingSf"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.structuralSteelBuildingSf != null &&
                values.structuralSteelBuildingSf > 0
                  ? String(values.structuralSteelBuildingSf)
                  : ""
              }
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 100000 — blank uses building area"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              typically floor plate SF; falls back to building area when blank
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Structure levels
            </span>
            <input
              name="structureLevelCount"
              type="number"
              step="1"
              min="1"
              defaultValue={String(structureLevelCount)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 1 (min 1); multiplies per-level trips
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              SF per trip (structural steel)
            </span>
            <input
              name="structuralSteelSfPerTrip"
              type="number"
              step="any"
              min="1"
              defaultValue={String(structuralSteelSfDivisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 20,000
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Final inspection trips (per level)
            </span>
            <input
              name="structuralSteelFinalInspectionTrips"
              type="number"
              step="1"
              min="0"
              defaultValue={String(structuralSteelFinalTrips)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 1 (added only when area &gt; 0)
            </span>
          </label>
        </div>
        {showSteel && (
          <div className="mt-3 hint-banner px-4 py-3 text-sm">
            <p>
              {steelSuggestion.structureLevelCount} levels × (ceil(
              {steelSuggestion.sf.toLocaleString()} /{" "}
              {steelSuggestion.sfPerTrip.toLocaleString()}) +{" "}
              {steelSuggestion.finalTripsPerLevel} final) ={" "}
              {steelSuggestion.structureLevelCount} ×{" "}
              {steelSuggestion.perLevelTrips} ={" "}
              <strong>{steelSuggestion.trips} trips</strong>
              {steelSuggestion.sfSource === "buildingAreaSf"
                ? " (using building area)"
                : ""}
            </p>
            <p className="mt-1 text-xs text-hint/80">
              Applied only to Structural Steel Inspections when that parent is in
              scope.
            </p>
          </div>
        )}
      </details>

      <details className="takeoff-section" open={compact}>
        <summary>Floor flatness</summary>
        <p className="mb-3 text-xs text-umber-faint">
          One (1) trip per building slab-on-grade pour{" "}
          <em>or</em> one (1) trip per{" "}
          <strong>
            {DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS.toLocaleString()}
          </strong>{" "}
          ft² — suggested trips ={" "}
          <strong>max(pour trips, SF trips)</strong>. Applied only when this
          parent is in scope. Floor flatness SF falls back to building area
          (building slab SF) when blank.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Slab-on-grade pour count
            </span>
            <input
              name="slabOnGradePourCount"
              type="number"
              step="1"
              min="0"
              defaultValue={
                values?.slabOnGradePourCount != null &&
                values.slabOnGradePourCount > 0
                  ? String(values.slabOnGradePourCount)
                  : ""
              }
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 2"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              1 trip per pour
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Floor flatness / building slab (SF)
            </span>
            <input
              name="floorFlatnessSf"
              type="number"
              step="any"
              min="0"
              defaultValue={
                values?.floorFlatnessSf != null && values.floorFlatnessSf > 0
                  ? String(values.floorFlatnessSf)
                  : ""
              }
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="blank uses building area"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              falls back to building area when blank
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              ft² per trip (floor flatness)
            </span>
            <input
              name="ft2PerTripFloorFlatness"
              type="number"
              step="any"
              min="1"
              defaultValue={String(floorFlatnessFt2Divisor)}
              className="input-soft mt-1.5 w-full text-sm"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              default 30,000
            </span>
          </label>
        </div>
        {showFloorFlatness && (
          <div className="mt-3 hint-banner px-4 py-3 text-sm">
            <p>
              pours: {floorFlatnessSuggestion.pourTrips} | SF rule:{" "}
              {floorFlatnessSuggestion.sfTrips} → using max{" "}
              <strong>{floorFlatnessSuggestion.trips}</strong>
              {floorFlatnessSuggestion.sfSource === "buildingAreaSf"
                ? " (SF from building area)"
                : floorFlatnessSuggestion.sf > 0
                  ? ` (${floorFlatnessSuggestion.sf.toLocaleString()} / ${floorFlatnessSuggestion.ft2PerTrip.toLocaleString()})`
                  : ""}
            </p>
            <p className="mt-1 text-xs text-hint/80">
              Applied only to Floor Flatness Testing &amp; Observations when that
              parent is in scope.
            </p>
          </div>
        )}
      </details>

      <details className="takeoff-section" open={compact}>
        <summary>Post-tension</summary>
        <p className="mb-3 text-xs text-umber-faint">
          Total trips = <strong>2 × pour count</strong> when pours &gt; 0
          (covers one pre-pour and one tendon stressing visit per pour). Applied
          only when this parent is in scope. Dedicated post-tension pour count
          falls back to slab-on-grade pours (often the same).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-umber-soft">
              Post-tension slab pour count
            </span>
            <input
              name="postTensionSlabPourCount"
              type="number"
              step="1"
              min="0"
              defaultValue={
                values?.postTensionSlabPourCount != null &&
                values.postTensionSlabPourCount > 0
                  ? String(values.postTensionSlabPourCount)
                  : ""
              }
              className="input-soft mt-1.5 w-full text-sm"
              placeholder="e.g. 3"
            />
            <span className="mt-0.5 block text-xs text-umber-faint">
              often same as slab pours; blank uses slab-on-grade pour count
            </span>
          </label>
        </div>
        {showPostTension && (
          <div className="mt-3 hint-banner px-4 py-3 text-sm">
            <p>
              Suggested: <strong>{postTensionSuggestion.trips}</strong> trips (2
              × {postTensionSuggestion.pourCount} pours)
              {postTensionSuggestion.pourSource === "slabOnGradePourCount"
                ? " (from slab-on-grade pours)"
                : ""}
            </p>
            <p className="mt-1 text-xs text-hint/80">
              Applied only to Post-Tension Testing &amp; Observations when that
              parent is in scope. Apply suggestions sets one hours line (hours ×
              trips) plus Vehicle — not separate pre-pour / stressing rows.
            </p>
          </div>
        )}
      </details>

      {(showBuilding || showPavement || showSidewalk || showUtilityTrench) && (
        <div className="hint-banner px-4 py-3 text-sm">
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
