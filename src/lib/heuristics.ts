import type { Drivers } from "./types";

export type SuggestedLine = {
  description: string;
  quantity: number;
  units: string;
  trips?: number | null;
  isLab: boolean;
  notes?: string;
};

/** Project takeoff facts used by earthwork trip rules. */
export type ProjectTakeoff = {
  buildingAreaSf?: number | null;
  moistureConditionedSubgrade?: boolean;
  flexibleBaseCap?: boolean;
  earthworkSfPerTrip?: number | null;
  pavementAreaSf?: number | null;
  limeTreatedPavementSubgrade?: boolean;
  pavementSfPerTrip?: number | null;
  pavementSubgradeLf?: number | null;
  pavementLfPerTrip?: number | null;
  sidewalkLf?: number | null;
  sidewalksBunchedTogether?: boolean;
  sidewalkSpreadLfPerTrip?: number | null;
  sidewalkBunchedLfPerTrip?: number | null;
  utilityTrenchLf?: number | null;
  utilityTrenchLfPerTrip?: number | null;
  foundationScheduleTrips?: number | null;
  pierCount?: number | null;
  pierType?: PierType | string | null;
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
  // Future pour types (walls, etc.) get their own yd³ + divisor fields here.
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

/**
 * Suggested earthwork trips breakdown.
 * pavementTrips is either lime SF or non-lime LF — never both.
 * sidewalkTrips uses spread (125) or bunched (150) divisor.
 * utilityTrenchTrips = ceil(utilityTrenchLf / utilityTrenchLfPerTrip) — default 162.5 (150–175).
 * total = buildingTrips + pavementTrips + sidewalkTrips + utilityTrenchTrips
 */
export type EarthworkTripSuggestion = {
  buildingTrips: number;
  pavementTrips: number;
  pavementSfTrips: number;
  pavementLfTrips: number;
  sidewalkTrips: number;
  utilityTrenchTrips: number;
  limeTreated: boolean;
  sidewalksBunched: boolean;
  total: number;
};

export const EARTHWORK_HOURS_PER_TRIP = 4;

export const DEFAULT_EARTHWORK_SF_PER_TRIP = 2850;
export const EARTHWORK_SF_PER_TRIP_RANGE = { min: 2700, max: 3000 } as const;

export const DEFAULT_PAVEMENT_SF_PER_TRIP = 27500;
export const PAVEMENT_SF_PER_TRIP_RANGE = { min: 25000, max: 30000 } as const;

export const DEFAULT_PAVEMENT_LF_PER_TRIP = 300;
export const PAVEMENT_LF_PER_TRIP_RANGE = { min: 200, max: 400 } as const;

export const DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP = 125;
export const DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP = 150;

export const DEFAULT_UTILITY_TRENCH_LF_PER_TRIP = 162.5;
export const UTILITY_TRENCH_LF_PER_TRIP_RANGE = { min: 150, max: 175 } as const;

function n(v: unknown, fallback = 0): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : fallback;
}

function ceilTrips(amount: number, divisor: number): number {
  if (amount <= 0 || divisor <= 0) return 0;
  return Math.ceil(amount / divisor);
}

/**
 * Earthwork Testing & Observations trip rules:
 *
 * Building / pad (shared SF; earthwork divisor only): ceil(buildingSF / earthworkSfPerTrip) — default 2850 (2700–3000).
 *
 * Pavement (exactly one):
 *   lime on  → ceil(pavementSF / pavementSfPerTrip) — default 27500 (25000–30000)
 *   lime off → ceil(pavementSubgradeLf / pavementLfPerTrip) — default 300 (200–400)
 *
 * Sidewalks:
 *   spread (default) → ceil(sidewalkLf / sidewalkSpreadLfPerTrip) — default 125
 *   bunched          → ceil(sidewalkLf / sidewalkBunchedLfPerTrip) — default 150
 *
 * Utility trench backfill (storm/sewer/water):
 *   ceil(utilityTrenchLf / utilityTrenchLfPerTrip) — default 162.5 (typical 150–175)
 *
 * total = building + pavement + sidewalk + utilityTrench
 *
 * Example (lime): 100k SF building @ 2850 → 36; 150k SF pavement @ 27500 → 6; combined 42 (+ sidewalk / trench if any).
 * Example trench: 800 LF @ 162.5 → 5 trips.
 */
export function suggestEarthworkTrips(
  takeoff: ProjectTakeoff | null | undefined
): EarthworkTripSuggestion {
  const buildingSf = n(takeoff?.buildingAreaSf, 0);
  const buildingDivisor =
    n(takeoff?.earthworkSfPerTrip, 0) > 0
      ? n(takeoff?.earthworkSfPerTrip)
      : DEFAULT_EARTHWORK_SF_PER_TRIP;

  const limeTreated = !!takeoff?.limeTreatedPavementSubgrade;
  const pavementSf = n(takeoff?.pavementAreaSf, 0);
  const pavementSfDivisor =
    n(takeoff?.pavementSfPerTrip, 0) > 0
      ? n(takeoff?.pavementSfPerTrip)
      : DEFAULT_PAVEMENT_SF_PER_TRIP;
  const pavementLf = n(takeoff?.pavementSubgradeLf, 0);
  const pavementLfDivisor =
    n(takeoff?.pavementLfPerTrip, 0) > 0
      ? n(takeoff?.pavementLfPerTrip)
      : DEFAULT_PAVEMENT_LF_PER_TRIP;

  const sidewalksBunched = !!takeoff?.sidewalksBunchedTogether;
  const sidewalkLf = n(takeoff?.sidewalkLf, 0);
  const sidewalkDivisor = sidewalksBunched
    ? n(takeoff?.sidewalkBunchedLfPerTrip, 0) > 0
      ? n(takeoff?.sidewalkBunchedLfPerTrip)
      : DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP
    : n(takeoff?.sidewalkSpreadLfPerTrip, 0) > 0
      ? n(takeoff?.sidewalkSpreadLfPerTrip)
      : DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP;

  const buildingTrips = ceilTrips(buildingSf, buildingDivisor);
  const pavementSfTrips = limeTreated
    ? ceilTrips(pavementSf, pavementSfDivisor)
    : 0;
  const pavementLfTrips = !limeTreated
    ? ceilTrips(pavementLf, pavementLfDivisor)
    : 0;
  const pavementTrips = limeTreated ? pavementSfTrips : pavementLfTrips;
  const sidewalkTrips = ceilTrips(sidewalkLf, sidewalkDivisor);

  const utilityTrenchLf = n(takeoff?.utilityTrenchLf, 0);
  const utilityTrenchDivisor =
    n(takeoff?.utilityTrenchLfPerTrip, 0) > 0
      ? n(takeoff?.utilityTrenchLfPerTrip)
      : DEFAULT_UTILITY_TRENCH_LF_PER_TRIP;
  const utilityTrenchTrips = ceilTrips(utilityTrenchLf, utilityTrenchDivisor);

  return {
    buildingTrips,
    pavementTrips,
    pavementSfTrips,
    pavementLfTrips,
    sidewalkTrips,
    utilityTrenchTrips,
    limeTreated,
    sidewalksBunched,
    total: buildingTrips + pavementTrips + sidewalkTrips + utilityTrenchTrips,
  };
}

export function hasEarthworkTakeoff(
  takeoff: ProjectTakeoff | null | undefined
): boolean {
  if (n(takeoff?.buildingAreaSf, 0) > 0) return true;
  if (n(takeoff?.sidewalkLf, 0) > 0) return true;
  if (n(takeoff?.utilityTrenchLf, 0) > 0) return true;
  if (takeoff?.limeTreatedPavementSubgrade) {
    return n(takeoff?.pavementAreaSf, 0) > 0;
  }
  return n(takeoff?.pavementSubgradeLf, 0) > 0;
}

export function earthworkTripRuleLabels(
  takeoff: ProjectTakeoff | null | undefined
): {
  building?: string;
  pavement?: string;
  sidewalk?: string;
  utilityTrench?: string;
  combined?: string;
} {
  const buildingSf = n(takeoff?.buildingAreaSf, 0);
  const buildingDivisor =
    n(takeoff?.earthworkSfPerTrip, 0) > 0
      ? n(takeoff?.earthworkSfPerTrip)
      : DEFAULT_EARTHWORK_SF_PER_TRIP;
  const limeTreated = !!takeoff?.limeTreatedPavementSubgrade;
  const pavementSf = n(takeoff?.pavementAreaSf, 0);
  const pavementSfDivisor =
    n(takeoff?.pavementSfPerTrip, 0) > 0
      ? n(takeoff?.pavementSfPerTrip)
      : DEFAULT_PAVEMENT_SF_PER_TRIP;
  const pavementLf = n(takeoff?.pavementSubgradeLf, 0);
  const pavementLfDivisor =
    n(takeoff?.pavementLfPerTrip, 0) > 0
      ? n(takeoff?.pavementLfPerTrip)
      : DEFAULT_PAVEMENT_LF_PER_TRIP;
  const sidewalksBunched = !!takeoff?.sidewalksBunchedTogether;
  const sidewalkLf = n(takeoff?.sidewalkLf, 0);
  const sidewalkDivisor = sidewalksBunched
    ? n(takeoff?.sidewalkBunchedLfPerTrip, 0) > 0
      ? n(takeoff?.sidewalkBunchedLfPerTrip)
      : DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP
    : n(takeoff?.sidewalkSpreadLfPerTrip, 0) > 0
      ? n(takeoff?.sidewalkSpreadLfPerTrip)
      : DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP;
  const utilityTrenchLf = n(takeoff?.utilityTrenchLf, 0);
  const utilityTrenchDivisor =
    n(takeoff?.utilityTrenchLfPerTrip, 0) > 0
      ? n(takeoff?.utilityTrenchLfPerTrip)
      : DEFAULT_UTILITY_TRENCH_LF_PER_TRIP;

  const suggestion = suggestEarthworkTrips(takeoff);
  const out: {
    building?: string;
    pavement?: string;
    sidewalk?: string;
    utilityTrench?: string;
    combined?: string;
  } = {};

  if (buildingSf > 0) {
    out.building = `Earthwork (building / pad): 1 trip / ${buildingDivisor.toLocaleString()} SF → ${suggestion.buildingTrips} trips from ${buildingSf.toLocaleString()} SF (typical 2,700–3,000)`;
  } else {
    out.building = `Earthwork (building / pad): 1 trip / ${buildingDivisor.toLocaleString()} SF (typical 2,700–3,000). Enter Building / pad size to suggest trips.`;
  }

  if (limeTreated) {
    if (pavementSf > 0) {
      out.pavement = `Pavement (lime-treated SF): 1 trip / ${pavementSfDivisor.toLocaleString()} SF → ${suggestion.pavementTrips} trips from ${pavementSf.toLocaleString()} SF (typical 25,000–30,000)`;
    } else {
      out.pavement = `Pavement (lime-treated SF): 1 trip / ${pavementSfDivisor.toLocaleString()} SF (typical 25,000–30,000). Enter pavement area to suggest trips.`;
    }
  } else if (pavementLf > 0) {
    out.pavement = `Pavement (subgrade LF): 1 trip / ${pavementLfDivisor.toLocaleString()} LF → ${suggestion.pavementTrips} trips from ${pavementLf.toLocaleString()} LF (typical 200–400)`;
  } else {
    out.pavement = `Pavement (subgrade LF, no lime): 1 trip / ${pavementLfDivisor.toLocaleString()} LF (typical 200–400). Enter pavement subgrade LF — or turn on lime-treated to use the SF rule.`;
  }

  if (sidewalkLf > 0) {
    const mode = sidewalksBunched ? "bunched" : "spread out";
    out.sidewalk = `Sidewalks (${mode}): 1 trip / ${sidewalkDivisor.toLocaleString()} LF → ${suggestion.sidewalkTrips} trips from ${sidewalkLf.toLocaleString()} LF`;
  } else {
    out.sidewalk = `Sidewalks: spread default 1 / 125 LF; bunched 1 / 150 LF. Enter sidewalk LF to suggest trips.`;
  }

  if (utilityTrenchLf > 0) {
    out.utilityTrench = `Utility trench backfill: 1 trip / ${utilityTrenchDivisor.toLocaleString()} LF → ${suggestion.utilityTrenchTrips} trips from ${utilityTrenchLf.toLocaleString()} LF (typical 150–175)`;
  } else {
    out.utilityTrench = `Utility trench backfill (storm/sewer/water): 1 trip / ${utilityTrenchDivisor.toLocaleString()} LF (typical 150–175). Enter utility trench LF to suggest trips.`;
  }

  const parts: string[] = [];
  if (suggestion.buildingTrips > 0) parts.push(`${suggestion.buildingTrips} building`);
  if (suggestion.pavementTrips > 0) {
    parts.push(
      `${suggestion.pavementTrips} pavement ${limeTreated ? "SF" : "LF"}`
    );
  }
  if (suggestion.sidewalkTrips > 0) parts.push(`${suggestion.sidewalkTrips} sidewalk`);
  if (suggestion.utilityTrenchTrips > 0)
    parts.push(`${suggestion.utilityTrenchTrips} utility trench`);
  if (parts.length > 1) {
    out.combined = `Combined: ${parts.join(" + ")} = ${suggestion.total} trips`;
  } else if (suggestion.total > 0) {
    out.combined = `Total suggested: ${suggestion.total} trips`;
  }

  return out;
}

export function earthworkTripRuleLabel(
  takeoff: ProjectTakeoff | null | undefined
): string {
  const labels = earthworkTripRuleLabels(takeoff);
  return [
    labels.building,
    labels.pavement,
    labels.sidewalk,
    labels.utilityTrench,
    labels.combined,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function applyEarthworkTakeoffToDrivers(
  drivers: Drivers,
  takeoff: ProjectTakeoff | null | undefined
): Drivers {
  const suggestion = suggestEarthworkTrips(takeoff);
  if (suggestion.total <= 0) return { ...drivers };

  const trips = suggestion.total;
  const hours = trips * EARTHWORK_HOURS_PER_TRIP;
  const otHours = Math.round(hours * 0.15 * 10) / 10;

  const buildingSf = n(takeoff?.buildingAreaSf, 0);
  const buildingDivisor =
    n(takeoff?.earthworkSfPerTrip, 0) > 0
      ? n(takeoff?.earthworkSfPerTrip)
      : DEFAULT_EARTHWORK_SF_PER_TRIP;
  const pavementSf = n(takeoff?.pavementAreaSf, 0);
  const pavementSfDivisor =
    n(takeoff?.pavementSfPerTrip, 0) > 0
      ? n(takeoff?.pavementSfPerTrip)
      : DEFAULT_PAVEMENT_SF_PER_TRIP;
  const pavementLf = n(takeoff?.pavementSubgradeLf, 0);
  const pavementLfDivisor =
    n(takeoff?.pavementLfPerTrip, 0) > 0
      ? n(takeoff?.pavementLfPerTrip)
      : DEFAULT_PAVEMENT_LF_PER_TRIP;
  const sidewalkLf = n(takeoff?.sidewalkLf, 0);
  const sidewalkDivisor = suggestion.sidewalksBunched
    ? n(takeoff?.sidewalkBunchedLfPerTrip, 0) > 0
      ? n(takeoff?.sidewalkBunchedLfPerTrip)
      : DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP
    : n(takeoff?.sidewalkSpreadLfPerTrip, 0) > 0
      ? n(takeoff?.sidewalkSpreadLfPerTrip)
      : DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP;
  const utilityTrenchLf = n(takeoff?.utilityTrenchLf, 0);
  const utilityTrenchDivisor =
    n(takeoff?.utilityTrenchLfPerTrip, 0) > 0
      ? n(takeoff?.utilityTrenchLfPerTrip)
      : DEFAULT_UTILITY_TRENCH_LF_PER_TRIP;

  const noteParts: string[] = [];
  if (suggestion.buildingTrips > 0) {
    noteParts.push(
      `building ceil(${buildingSf} / ${buildingDivisor}) = ${suggestion.buildingTrips}`
    );
  }
  if (suggestion.pavementTrips > 0) {
    if (suggestion.limeTreated) {
      noteParts.push(
        `pavement SF ceil(${pavementSf} / ${pavementSfDivisor}) = ${suggestion.pavementTrips}`
      );
    } else {
      noteParts.push(
        `pavement LF ceil(${pavementLf} / ${pavementLfDivisor}) = ${suggestion.pavementTrips}`
      );
    }
  }
  if (suggestion.sidewalkTrips > 0) {
    noteParts.push(
      `sidewalk ceil(${sidewalkLf} / ${sidewalkDivisor}) = ${suggestion.sidewalkTrips}`
    );
  }
  if (suggestion.utilityTrenchTrips > 0) {
    noteParts.push(
      `utility trench ceil(${utilityTrenchLf} / ${utilityTrenchDivisor}) = ${suggestion.utilityTrenchTrips}`
    );
  }
  const notesDefault =
    noteParts.length > 1
      ? `From takeoff: ${noteParts.join(" + ")} = ${trips} trips`
      : `From takeoff: ${noteParts.join("; ")} trips`;

  return {
    ...drivers,
    trips,
    hours,
    otHours,
    days: trips,
    gaugeDays: trips,
    vehicleTrips: trips,
    notes:
      typeof drivers.notes === "string" && drivers.notes.trim()
        ? drivers.notes
        : notesDefault,
  };
}

export function isEarthworkTestingParent(name: string): boolean {
  return name.toLowerCase().includes("earthwork testing");
}

export const FOUNDATION_HOURS_PER_TRIP = 4;

export const PIER_TYPES = ["straight_shaft", "cased", "belled"] as const;
export type PierType = (typeof PIER_TYPES)[number];

export const DEFAULT_PIERS_PER_TRIP_STRAIGHT = 10.5;
export const PIERS_PER_TRIP_STRAIGHT_RANGE = { min: 9, max: 12 } as const;

export const DEFAULT_PIERS_PER_TRIP_CASED = 5;
export const PIERS_PER_TRIP_CASED_RANGE = { min: 4, max: 6 } as const;

export const DEFAULT_PIERS_PER_TRIP_BELLED = 7;
export const PIERS_PER_TRIP_BELLED_RANGE = { min: 5, max: 9 } as const;

export type FoundationTripSuggestion = {
  trips: number;
  source: "schedule" | "piers" | "none";
  pierType: PierType;
  pierCount: number;
  piersPerTrip: number;
  scheduleTrips: number;
};

export function normalizePierType(raw: unknown): PierType {
  const s = String(raw ?? "straight_shaft").toLowerCase().trim();
  if (s === "cased") return "cased";
  if (s === "belled" || s === "underreamed" || s === "belled_underreamed")
    return "belled";
  return "straight_shaft";
}

export function piersPerTripForType(
  takeoff: ProjectTakeoff | null | undefined,
  pierType?: PierType
): number {
  const type = pierType ?? normalizePierType(takeoff?.pierType);
  if (type === "cased") {
    return n(takeoff?.piersPerTripCased, 0) > 0
      ? n(takeoff?.piersPerTripCased)
      : DEFAULT_PIERS_PER_TRIP_CASED;
  }
  if (type === "belled") {
    return n(takeoff?.piersPerTripBelled, 0) > 0
      ? n(takeoff?.piersPerTripBelled)
      : DEFAULT_PIERS_PER_TRIP_BELLED;
  }
  return n(takeoff?.piersPerTripStraight, 0) > 0
    ? n(takeoff?.piersPerTripStraight)
    : DEFAULT_PIERS_PER_TRIP_STRAIGHT;
}

/**
 * CIP Deep Foundations (Drilled Straight Shaft Piers) trip rules:
 *
 * 1. If foundationScheduleTrips > 0 → use schedule trips (do NOT also apply pier-count rules).
 * 2. Else if pierCount > 0 → trips = ceil(pierCount / piersPerTrip) for selected pier type:
 *    - straight_shaft: default 10.5 (typical 9–12)
 *    - cased: default 5 (typical 4–6)
 *    - belled: default 7 (typical 5–9)
 *
 * Example: 36 straight piers @ 10.5 → 4 trips; schedule 6 trips overrides.
 */
export function suggestFoundationTrips(
  takeoff: ProjectTakeoff | null | undefined
): FoundationTripSuggestion {
  const scheduleTrips = Math.max(0, Math.floor(n(takeoff?.foundationScheduleTrips, 0)));
  const pierCount = Math.max(0, Math.floor(n(takeoff?.pierCount, 0)));
  const pierType = normalizePierType(takeoff?.pierType);
  const piersPerTrip = piersPerTripForType(takeoff, pierType);

  if (scheduleTrips > 0) {
    return {
      trips: scheduleTrips,
      source: "schedule",
      pierType,
      pierCount,
      piersPerTrip,
      scheduleTrips,
    };
  }

  if (pierCount > 0 && piersPerTrip > 0) {
    return {
      trips: ceilTrips(pierCount, piersPerTrip),
      source: "piers",
      pierType,
      pierCount,
      piersPerTrip,
      scheduleTrips: 0,
    };
  }

  return {
    trips: 0,
    source: "none",
    pierType,
    pierCount,
    piersPerTrip,
    scheduleTrips: 0,
  };
}

export function hasFoundationTakeoff(
  takeoff: ProjectTakeoff | null | undefined
): boolean {
  return suggestFoundationTrips(takeoff).trips > 0;
}

export function pierTypeLabel(pierType: PierType): string {
  if (pierType === "cased") return "cased";
  if (pierType === "belled") return "belled/underreamed";
  return "straight-shaft";
}

export function pierTypeRangeHelp(pierType: PierType): string {
  if (pierType === "cased") return "typical 4–6";
  if (pierType === "belled") return "typical 5–9";
  return "typical 9–12";
}

export function foundationTripRuleLabel(
  takeoff: ProjectTakeoff | null | undefined
): string {
  const suggestion = suggestFoundationTrips(takeoff);
  if (suggestion.source === "schedule") {
    return `CIP Deep Foundations: construction schedule provides ${suggestion.trips} trips (overrides pier-count rules).`;
  }
  if (suggestion.source === "piers") {
    return `CIP Deep Foundations (${pierTypeLabel(suggestion.pierType)}): 1 trip / ${suggestion.piersPerTrip} piers → ${suggestion.trips} trips from ${suggestion.pierCount} piers (${pierTypeRangeHelp(suggestion.pierType)}).`;
  }
  return `CIP Deep Foundations: enter schedule trips, or pier count + type (straight-shaft default ${DEFAULT_PIERS_PER_TRIP_STRAIGHT}/trip; cased ${DEFAULT_PIERS_PER_TRIP_CASED}; belled ${DEFAULT_PIERS_PER_TRIP_BELLED}). Schedule trips override pier rules when set.`;
}

export function applyFoundationTakeoffToDrivers(
  drivers: Drivers,
  takeoff: ProjectTakeoff | null | undefined
): Drivers {
  const suggestion = suggestFoundationTrips(takeoff);
  if (suggestion.trips <= 0) return { ...drivers };

  const trips = suggestion.trips;
  const hours = trips * FOUNDATION_HOURS_PER_TRIP;
  const otHours = Math.round(hours * 0.15 * 10) / 10;

  let notesDefault: string;
  if (suggestion.source === "schedule") {
    notesDefault = `From construction schedule: ${trips} trips`;
  } else {
    notesDefault = `From takeoff: ceil(${suggestion.pierCount} / ${suggestion.piersPerTrip}) ${pierTypeLabel(suggestion.pierType)} piers = ${trips} trips`;
  }

  return {
    ...drivers,
    trips,
    hours,
    otHours,
    days: trips,
    vehicleTrips: trips,
    notes:
      typeof drivers.notes === "string" && drivers.notes.trim()
        ? drivers.notes
        : notesDefault,
  };
}

export function isCipDeepFoundationsParent(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("cip deep") || n.includes("deep foundations");
}

export const CONCRETE_HOURS_PER_TRIP = 4;

export const DEFAULT_YD3_PER_TRIP_GRADE_BEAMS = 137.5;
export const YD3_PER_TRIP_GRADE_BEAMS_RANGE = { min: 100, max: 175 } as const;
export const MIN_TRIPS_GRADE_BEAMS_PIER_CAPS = 2;

export const DEFAULT_YD3_PER_TRIP_BUILDING_SLAB = 300;
export const MIN_TRIPS_BUILDING_SLAB = 2;

export const DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT = 500;
export const DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT = 900;

/** Shared pour trip helper: when yd³ > 0, max(minTrips, ceil(yd³ / divisor)). */
function concretePourTrips(yd3: number, divisor: number, minTrips: number): number {
  if (yd3 <= 0 || divisor <= 0) return 0;
  return Math.max(minTrips, Math.ceil(yd3 / divisor));
}

/**
 * Suggested concrete trips breakdown.
 * Rule A (grade beams / pier caps) + Rule B (building slab) + Rule C (private/public pavement).
 * total = gradeBeamsPierCapsTrips + buildingSlabTrips + privatePavementTrips + publicPavementTrips
 */
export type ConcreteTripSuggestion = {
  gradeBeamsPierCapsTrips: number;
  buildingSlabTrips: number;
  privatePavementTrips: number;
  publicPavementTrips: number;
  total: number;
};

/**
 * Concrete Testing & Reinforcing Steel Observations — trip rules:
 *
 * Rule A — Grade beams and pier caps:
 *   raw = ceil(concreteYd3GradeBeamsPierCaps / yd3PerTripGradeBeams)
 *   when yd3 > 0: final = max(2, raw)  (minimum 2 trips)
 *   divisor default mid of 100–175 → 137.5
 *
 * Rule B — Building slab:
 *   raw = ceil(concreteYd3BuildingSlab / yd3PerTripBuildingSlab)
 *   when yd3 > 0: final = max(2, raw)  (minimum 2 trips if ceil < 2)
 *   divisor default 300
 *
 * Rule C — Pavement concrete (no extra minimum-2):
 *   Private: ceil(concreteYd3PrivatePavement / yd3PerTripPrivatePavement) — default 500
 *   Public:  ceil(concreteYd3PublicPavement / yd3PerTripPublicPavement) — default 900
 *
 * total = gradeBeamsPierCapsTrips + buildingSlabTrips + privatePavementTrips + publicPavementTrips
 *
 * Example A: 50 yd³ @ 137.5 → ceil(0.36)=1 → min 2 → 2 trips
 * Example A: 400 yd³ @ 137.5 → ceil(2.91)=3 trips
 * Example B: 200 yd³ @ 300 → ceil(0.67)=1 → min 2 → 2 trips
 * Example B: 900 yd³ @ 300 → ceil(3)=3 trips
 * Example C private: 400 @ 500 → 1; 1200 @ 500 → 3
 * Example C public: 800 @ 900 → 1; 2000 @ 900 → 3
 */
export function suggestConcreteTrips(
  takeoff: ProjectTakeoff | null | undefined
): ConcreteTripSuggestion {
  const gradeYd3 = n(takeoff?.concreteYd3GradeBeamsPierCaps, 0);
  const gradeDivisor =
    n(takeoff?.yd3PerTripGradeBeams, 0) > 0
      ? n(takeoff?.yd3PerTripGradeBeams)
      : DEFAULT_YD3_PER_TRIP_GRADE_BEAMS;
  const gradeBeamsPierCapsTrips = concretePourTrips(
    gradeYd3,
    gradeDivisor,
    MIN_TRIPS_GRADE_BEAMS_PIER_CAPS
  );

  const slabYd3 = n(takeoff?.concreteYd3BuildingSlab, 0);
  const slabDivisor =
    n(takeoff?.yd3PerTripBuildingSlab, 0) > 0
      ? n(takeoff?.yd3PerTripBuildingSlab)
      : DEFAULT_YD3_PER_TRIP_BUILDING_SLAB;
  const buildingSlabTrips = concretePourTrips(
    slabYd3,
    slabDivisor,
    MIN_TRIPS_BUILDING_SLAB
  );

  const privateYd3 = n(takeoff?.concreteYd3PrivatePavement, 0);
  const privateDivisor =
    n(takeoff?.yd3PerTripPrivatePavement, 0) > 0
      ? n(takeoff?.yd3PerTripPrivatePavement)
      : DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT;
  const privatePavementTrips = ceilTrips(privateYd3, privateDivisor);

  const publicYd3 = n(takeoff?.concreteYd3PublicPavement, 0);
  const publicDivisor =
    n(takeoff?.yd3PerTripPublicPavement, 0) > 0
      ? n(takeoff?.yd3PerTripPublicPavement)
      : DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT;
  const publicPavementTrips = ceilTrips(publicYd3, publicDivisor);

  return {
    gradeBeamsPierCapsTrips,
    buildingSlabTrips,
    privatePavementTrips,
    publicPavementTrips,
    total:
      gradeBeamsPierCapsTrips +
      buildingSlabTrips +
      privatePavementTrips +
      publicPavementTrips,
  };
}

export function hasConcreteTakeoff(
  takeoff: ProjectTakeoff | null | undefined
): boolean {
  return suggestConcreteTrips(takeoff).total > 0;
}

export function concreteTripRuleLabels(
  takeoff: ProjectTakeoff | null | undefined
): {
  gradeBeamsPierCaps?: string;
  buildingSlab?: string;
  privatePavement?: string;
  publicPavement?: string;
  combined?: string;
} {
  const gradeYd3 = n(takeoff?.concreteYd3GradeBeamsPierCaps, 0);
  const gradeDivisor =
    n(takeoff?.yd3PerTripGradeBeams, 0) > 0
      ? n(takeoff?.yd3PerTripGradeBeams)
      : DEFAULT_YD3_PER_TRIP_GRADE_BEAMS;
  const slabYd3 = n(takeoff?.concreteYd3BuildingSlab, 0);
  const slabDivisor =
    n(takeoff?.yd3PerTripBuildingSlab, 0) > 0
      ? n(takeoff?.yd3PerTripBuildingSlab)
      : DEFAULT_YD3_PER_TRIP_BUILDING_SLAB;
  const privateYd3 = n(takeoff?.concreteYd3PrivatePavement, 0);
  const privateDivisor =
    n(takeoff?.yd3PerTripPrivatePavement, 0) > 0
      ? n(takeoff?.yd3PerTripPrivatePavement)
      : DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT;
  const publicYd3 = n(takeoff?.concreteYd3PublicPavement, 0);
  const publicDivisor =
    n(takeoff?.yd3PerTripPublicPavement, 0) > 0
      ? n(takeoff?.yd3PerTripPublicPavement)
      : DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT;
  const suggestion = suggestConcreteTrips(takeoff);
  const out: {
    gradeBeamsPierCaps?: string;
    buildingSlab?: string;
    privatePavement?: string;
    publicPavement?: string;
    combined?: string;
  } = {};

  if (gradeYd3 > 0) {
    const raw = Math.ceil(gradeYd3 / gradeDivisor);
    out.gradeBeamsPierCaps = `Grade beams / pier caps: ceil(${gradeYd3.toLocaleString()} / ${gradeDivisor}) = ${raw}, min ${MIN_TRIPS_GRADE_BEAMS_PIER_CAPS} → ${suggestion.gradeBeamsPierCapsTrips} trips (typical 100–175 yd³/trip)`;
  } else {
    out.gradeBeamsPierCaps = `Grade beams / pier caps: 1 trip / ${gradeDivisor} yd³ (typical 100–175; default mid 137.5), minimum ${MIN_TRIPS_GRADE_BEAMS_PIER_CAPS} trips when volume > 0. Enter yd³ to suggest trips.`;
  }

  if (slabYd3 > 0) {
    const raw = Math.ceil(slabYd3 / slabDivisor);
    out.buildingSlab = `Building slab: ceil(${slabYd3.toLocaleString()} / ${slabDivisor}) = ${raw}, min ${MIN_TRIPS_BUILDING_SLAB} → ${suggestion.buildingSlabTrips} trips (1 trip / ${slabDivisor} yd³ or more)`;
  } else {
    out.buildingSlab = `Building slab: 1 trip / ${slabDivisor} yd³ (default 300), minimum ${MIN_TRIPS_BUILDING_SLAB} trips when volume > 0 but ceil < 2. Enter yd³ to suggest trips.`;
  }

  if (privateYd3 > 0) {
    out.privatePavement = `Private pavement: ceil(${privateYd3.toLocaleString()} / ${privateDivisor}) = ${suggestion.privatePavementTrips} trips (1 trip / ${privateDivisor} yd³ or less; no min-2)`;
  } else {
    out.privatePavement = `Private pavement: 1 trip / ${privateDivisor} yd³ or less (default 500); trips = ceil(yd³ / divisor) only — no minimum-2. Enter yd³ to suggest trips.`;
  }

  if (publicYd3 > 0) {
    out.publicPavement = `Public pavement: ceil(${publicYd3.toLocaleString()} / ${publicDivisor}) = ${suggestion.publicPavementTrips} trips (1 trip / ${publicDivisor} yd³ or less; no min-2)`;
  } else {
    out.publicPavement = `Public pavement: 1 trip / ${publicDivisor} yd³ or less (default 900); trips = ceil(yd³ / divisor) only — no minimum-2. Enter yd³ to suggest trips.`;
  }

  const parts: string[] = [];
  if (suggestion.gradeBeamsPierCapsTrips > 0)
    parts.push(`${suggestion.gradeBeamsPierCapsTrips} grade beams/pier caps`);
  if (suggestion.buildingSlabTrips > 0)
    parts.push(`${suggestion.buildingSlabTrips} building slab`);
  if (suggestion.privatePavementTrips > 0)
    parts.push(`${suggestion.privatePavementTrips} private pavement`);
  if (suggestion.publicPavementTrips > 0)
    parts.push(`${suggestion.publicPavementTrips} public pavement`);
  if (parts.length > 1) {
    out.combined = `Combined concrete: ${parts.join(" + ")} = ${suggestion.total} trips`;
  } else if (suggestion.total > 0) {
    out.combined = `Total suggested concrete trips: ${suggestion.total}`;
  }

  return out;
}

export function concreteTripRuleLabel(
  takeoff: ProjectTakeoff | null | undefined
): string {
  const labels = concreteTripRuleLabels(takeoff);
  return [
    labels.gradeBeamsPierCaps,
    labels.buildingSlab,
    labels.privatePavement,
    labels.publicPavement,
    labels.combined,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function applyConcreteTakeoffToDrivers(
  drivers: Drivers,
  takeoff: ProjectTakeoff | null | undefined
): Drivers {
  const suggestion = suggestConcreteTrips(takeoff);
  if (suggestion.total <= 0) return { ...drivers };

  const trips = suggestion.total;
  const hours = trips * CONCRETE_HOURS_PER_TRIP;
  const otHours = Math.round(hours * 0.15 * 10) / 10;

  const gradeYd3 = n(takeoff?.concreteYd3GradeBeamsPierCaps, 0);
  const gradeDivisor =
    n(takeoff?.yd3PerTripGradeBeams, 0) > 0
      ? n(takeoff?.yd3PerTripGradeBeams)
      : DEFAULT_YD3_PER_TRIP_GRADE_BEAMS;
  const slabYd3 = n(takeoff?.concreteYd3BuildingSlab, 0);
  const slabDivisor =
    n(takeoff?.yd3PerTripBuildingSlab, 0) > 0
      ? n(takeoff?.yd3PerTripBuildingSlab)
      : DEFAULT_YD3_PER_TRIP_BUILDING_SLAB;
  const privateYd3 = n(takeoff?.concreteYd3PrivatePavement, 0);
  const privateDivisor =
    n(takeoff?.yd3PerTripPrivatePavement, 0) > 0
      ? n(takeoff?.yd3PerTripPrivatePavement)
      : DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT;
  const publicYd3 = n(takeoff?.concreteYd3PublicPavement, 0);
  const publicDivisor =
    n(takeoff?.yd3PerTripPublicPavement, 0) > 0
      ? n(takeoff?.yd3PerTripPublicPavement)
      : DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT;

  const noteParts: string[] = [];
  if (suggestion.gradeBeamsPierCapsTrips > 0) {
    noteParts.push(
      `grade beams/pier caps max(2, ceil(${gradeYd3} / ${gradeDivisor})) = ${suggestion.gradeBeamsPierCapsTrips}`
    );
  }
  if (suggestion.buildingSlabTrips > 0) {
    noteParts.push(
      `building slab max(2, ceil(${slabYd3} / ${slabDivisor})) = ${suggestion.buildingSlabTrips}`
    );
  }
  if (suggestion.privatePavementTrips > 0) {
    noteParts.push(
      `private pavement ceil(${privateYd3} / ${privateDivisor}) = ${suggestion.privatePavementTrips}`
    );
  }
  if (suggestion.publicPavementTrips > 0) {
    noteParts.push(
      `public pavement ceil(${publicYd3} / ${publicDivisor}) = ${suggestion.publicPavementTrips}`
    );
  }
  const notesDefault =
    noteParts.length > 1
      ? `From takeoff: ${noteParts.join(" + ")} = ${trips} trips`
      : `From takeoff: ${noteParts.join("; ")} trips`;

  return {
    ...drivers,
    trips,
    hours,
    otHours,
    days: trips,
    vehicleTrips: trips,
    notes:
      typeof drivers.notes === "string" && drivers.notes.trim()
        ? drivers.notes
        : notesDefault,
  };
}

export function isConcreteTestingReinforcingParent(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("concrete testing") && lower.includes("reinforcing");
}


export const MASONRY_HOURS_PER_TRIP = 4;

export const DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING = 5000;
export const DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT = 16;

/**
 * Suggested masonry trips breakdown.
 * total = loadBearingCmuTrips + elevatorShaftTrips + enclosureTrips
 */
export type MasonryTripSuggestion = {
  loadBearingCmuTrips: number;
  elevatorShaftTrips: number;
  enclosureTrips: number;
  total: number;
};

/**
 * Masonry Testing & Observations — trip rules:
 *
 * Rule A — Load-bearing CMU wall:
 *   ceil(masonryLoadBearingCmuSf / masonrySfPerTripLoadBearingCmu) — default 5000
 *
 * Rule B — Multifamily elevator shaft CMU (per building with an elevator):
 *   when buildingCount > 0 and shaftHeightFt > 0:
 *     buildingCount * ceil(shaftHeightFt / masonryFtPerTripElevatorShaft) — default 16
 *   Fields: masonryElevatorBuildingCount, masonryElevatorShaftHeightFt (height per building)
 *
 * Rule C — Dumpster and/or equipment CMU enclosures:
 *   trips = masonryCmuEnclosureCount (1 trip each)
 *
 * total = A + B + C
 *
 * Example: 12000 SF LB CMU → 3; 2 buildings × 48 ft @ 16 → 6; 3 enclosures → 3; total 12.
 */
export function suggestMasonryTrips(
  takeoff: ProjectTakeoff | null | undefined
): MasonryTripSuggestion {
  const loadBearingSf = n(takeoff?.masonryLoadBearingCmuSf, 0);
  const loadBearingDivisor =
    n(takeoff?.masonrySfPerTripLoadBearingCmu, 0) > 0
      ? n(takeoff?.masonrySfPerTripLoadBearingCmu)
      : DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING;
  const loadBearingCmuTrips = ceilTrips(loadBearingSf, loadBearingDivisor);

  const buildingCount = Math.max(
    0,
    Math.floor(n(takeoff?.masonryElevatorBuildingCount, 0))
  );
  const shaftHeightFt = n(takeoff?.masonryElevatorShaftHeightFt, 0);
  const shaftDivisor =
    n(takeoff?.masonryFtPerTripElevatorShaft, 0) > 0
      ? n(takeoff?.masonryFtPerTripElevatorShaft)
      : DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT;
  const elevatorShaftTrips =
    buildingCount > 0 && shaftHeightFt > 0 && shaftDivisor > 0
      ? buildingCount * Math.ceil(shaftHeightFt / shaftDivisor)
      : 0;

  const enclosureTrips = Math.max(
    0,
    Math.floor(n(takeoff?.masonryCmuEnclosureCount, 0))
  );

  return {
    loadBearingCmuTrips,
    elevatorShaftTrips,
    enclosureTrips,
    total: loadBearingCmuTrips + elevatorShaftTrips + enclosureTrips,
  };
}

export function hasMasonryTakeoff(
  takeoff: ProjectTakeoff | null | undefined
): boolean {
  return suggestMasonryTrips(takeoff).total > 0;
}

export function masonryTripRuleLabels(
  takeoff: ProjectTakeoff | null | undefined
): {
  loadBearingCmu?: string;
  elevatorShaft?: string;
  enclosure?: string;
  combined?: string;
} {
  const loadBearingSf = n(takeoff?.masonryLoadBearingCmuSf, 0);
  const loadBearingDivisor =
    n(takeoff?.masonrySfPerTripLoadBearingCmu, 0) > 0
      ? n(takeoff?.masonrySfPerTripLoadBearingCmu)
      : DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING;
  const buildingCount = Math.max(
    0,
    Math.floor(n(takeoff?.masonryElevatorBuildingCount, 0))
  );
  const shaftHeightFt = n(takeoff?.masonryElevatorShaftHeightFt, 0);
  const shaftDivisor =
    n(takeoff?.masonryFtPerTripElevatorShaft, 0) > 0
      ? n(takeoff?.masonryFtPerTripElevatorShaft)
      : DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT;
  const enclosureCount = Math.max(
    0,
    Math.floor(n(takeoff?.masonryCmuEnclosureCount, 0))
  );
  const suggestion = suggestMasonryTrips(takeoff);
  const out: {
    loadBearingCmu?: string;
    elevatorShaft?: string;
    enclosure?: string;
    combined?: string;
  } = {};

  if (loadBearingSf > 0) {
    out.loadBearingCmu = `Load-bearing CMU: 1 trip / ${loadBearingDivisor.toLocaleString()} SF → ${suggestion.loadBearingCmuTrips} trips from ${loadBearingSf.toLocaleString()} SF`;
  } else {
    out.loadBearingCmu = `Load-bearing CMU wall: 1 trip / ${loadBearingDivisor.toLocaleString()} SF or less (default 5,000). Enter SF to suggest trips.`;
  }

  if (buildingCount > 0 && shaftHeightFt > 0) {
    out.elevatorShaft = `Elevator shaft CMU: ${buildingCount} building(s) × ceil(${shaftHeightFt.toLocaleString()} ft / ${shaftDivisor}) = ${suggestion.elevatorShaftTrips} trips (1 trip / ${shaftDivisor} ft height per building with elevator)`;
  } else {
    out.elevatorShaft = `Multifamily elevator shaft CMU: buildings with elevator × ceil(shaft height ft / ${shaftDivisor}) — default 16 ft/trip. Enter building count and shaft height (per building) to suggest trips.`;
  }

  if (enclosureCount > 0) {
    out.enclosure = `CMU enclosures (dumpster/equipment): ${enclosureCount} enclosure(s) → ${suggestion.enclosureTrips} trips (1 trip each)`;
  } else {
    out.enclosure = `Dumpster and/or equipment CMU enclosures: 1 trip each. Enter enclosure count to suggest trips.`;
  }

  const parts: string[] = [];
  if (suggestion.loadBearingCmuTrips > 0)
    parts.push(`${suggestion.loadBearingCmuTrips} load-bearing CMU`);
  if (suggestion.elevatorShaftTrips > 0)
    parts.push(`${suggestion.elevatorShaftTrips} elevator shaft`);
  if (suggestion.enclosureTrips > 0)
    parts.push(`${suggestion.enclosureTrips} enclosure`);
  if (parts.length > 1) {
    out.combined = `Combined masonry: ${parts.join(" + ")} = ${suggestion.total} trips`;
  } else if (suggestion.total > 0) {
    out.combined = `Total suggested masonry trips: ${suggestion.total}`;
  }

  return out;
}

export function masonryTripRuleLabel(
  takeoff: ProjectTakeoff | null | undefined
): string {
  const labels = masonryTripRuleLabels(takeoff);
  return [
    labels.loadBearingCmu,
    labels.elevatorShaft,
    labels.enclosure,
    labels.combined,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function applyMasonryTakeoffToDrivers(
  drivers: Drivers,
  takeoff: ProjectTakeoff | null | undefined
): Drivers {
  const suggestion = suggestMasonryTrips(takeoff);
  if (suggestion.total <= 0) return { ...drivers };

  const trips = suggestion.total;
  const hours = trips * MASONRY_HOURS_PER_TRIP;
  const otHours = Math.round(hours * 0.15 * 10) / 10;

  const loadBearingSf = n(takeoff?.masonryLoadBearingCmuSf, 0);
  const loadBearingDivisor =
    n(takeoff?.masonrySfPerTripLoadBearingCmu, 0) > 0
      ? n(takeoff?.masonrySfPerTripLoadBearingCmu)
      : DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING;
  const buildingCount = Math.max(
    0,
    Math.floor(n(takeoff?.masonryElevatorBuildingCount, 0))
  );
  const shaftHeightFt = n(takeoff?.masonryElevatorShaftHeightFt, 0);
  const shaftDivisor =
    n(takeoff?.masonryFtPerTripElevatorShaft, 0) > 0
      ? n(takeoff?.masonryFtPerTripElevatorShaft)
      : DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT;
  const enclosureCount = Math.max(
    0,
    Math.floor(n(takeoff?.masonryCmuEnclosureCount, 0))
  );

  const noteParts: string[] = [];
  if (suggestion.loadBearingCmuTrips > 0) {
    noteParts.push(
      `load-bearing CMU ceil(${loadBearingSf} / ${loadBearingDivisor}) = ${suggestion.loadBearingCmuTrips}`
    );
  }
  if (suggestion.elevatorShaftTrips > 0) {
    noteParts.push(
      `elevator shaft ${buildingCount} × ceil(${shaftHeightFt} / ${shaftDivisor}) = ${suggestion.elevatorShaftTrips}`
    );
  }
  if (suggestion.enclosureTrips > 0) {
    noteParts.push(`enclosures ${enclosureCount} = ${suggestion.enclosureTrips}`);
  }
  const notesDefault =
    noteParts.length > 1
      ? `From takeoff: ${noteParts.join(" + ")} = ${trips} trips`
      : `From takeoff: ${noteParts.join("; ")} trips`;

  return {
    ...drivers,
    trips,
    hours,
    otHours,
    days: trips,
    vehicleTrips: trips,
    notes:
      typeof drivers.notes === "string" && drivers.notes.trim()
        ? drivers.notes
        : notesDefault,
  };
}

export function isMasonryTestingParent(name: string): boolean {
  return name.toLowerCase().includes("masonry testing");
}

export const GROUT_HOURS_PER_TRIP = 4;

export const DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES = 17000;

export const HIGH_STRENGTH_GROUT_PARENT_NAME =
  "High-Strength Grout Testing & Observations";

/**
 * Effective building pad SF: dedicated buildingPadSf when set (>0), else buildingAreaSf.
 * Pad often equals building area.
 */
export function effectiveBuildingPadSf(
  takeoff: ProjectTakeoff | null | undefined
): number {
  const pad = n(takeoff?.buildingPadSf, 0);
  if (pad > 0) return pad;
  return n(takeoff?.buildingAreaSf, 0);
}

export type GroutTripSuggestion = {
  trips: number;
  padSf: number;
  ft2PerTrip: number;
  baseplatesInSpecialInspection: boolean;
  padSfSource: "buildingPadSf" | "buildingAreaSf" | "none";
};

/**
 * High-Strength Grout Testing & Observations — trip rule:
 *
 * Only if grout baseplates are present in special inspection requirements:
 *   trips = ceil(padSf / ft2PerTripGroutBaseplates) — default 17,000
 *   padSf = buildingPadSf if set (>0), else buildingAreaSf
 *
 * Example: 100,000 SF pad + baseplates flag → ceil(100000/17000) = 6 trips.
 */
export function suggestGroutTrips(
  takeoff: ProjectTakeoff | null | undefined
): GroutTripSuggestion {
  const baseplatesInSpecialInspection =
    !!takeoff?.groutBaseplatesInSpecialInspection;
  const dedicatedPad = n(takeoff?.buildingPadSf, 0);
  const padSfSource: GroutTripSuggestion["padSfSource"] =
    dedicatedPad > 0
      ? "buildingPadSf"
      : n(takeoff?.buildingAreaSf, 0) > 0
        ? "buildingAreaSf"
        : "none";
  const padSf = effectiveBuildingPadSf(takeoff);
  const ft2PerTrip =
    n(takeoff?.ft2PerTripGroutBaseplates, 0) > 0
      ? n(takeoff?.ft2PerTripGroutBaseplates)
      : DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES;

  const trips =
    baseplatesInSpecialInspection && padSf > 0
      ? ceilTrips(padSf, ft2PerTrip)
      : 0;

  return {
    trips,
    padSf,
    ft2PerTrip,
    baseplatesInSpecialInspection,
    padSfSource,
  };
}

export function hasGroutTakeoff(
  takeoff: ProjectTakeoff | null | undefined
): boolean {
  return suggestGroutTrips(takeoff).trips > 0;
}

export function groutTripRuleLabel(
  takeoff: ProjectTakeoff | null | undefined
): string {
  const suggestion = suggestGroutTrips(takeoff);
  const sourceNote =
    suggestion.padSfSource === "buildingPadSf"
      ? "building pad SF"
      : suggestion.padSfSource === "buildingAreaSf"
        ? "building area SF (pad not set)"
        : "pad/building SF";

  if (!suggestion.baseplatesInSpecialInspection) {
    return `High-Strength Grout: 1 trip / ${suggestion.ft2PerTrip.toLocaleString()} ft² of building pad — only when grout baseplates are in special inspection. Turn on the baseplates flag and enter pad SF (or building area) to suggest trips.`;
  }
  if (suggestion.padSf <= 0) {
    return `High-Strength Grout: baseplates in special inspection (on). Enter building pad SF (or building area) — 1 trip / ${suggestion.ft2PerTrip.toLocaleString()} ft².`;
  }
  return `High-Strength Grout (baseplates in SI): 1 trip / ${suggestion.ft2PerTrip.toLocaleString()} ft² → ${suggestion.trips} trips from ${suggestion.padSf.toLocaleString()} ${sourceNote}.`;
}

export function applyGroutTakeoffToDrivers(
  drivers: Drivers,
  takeoff: ProjectTakeoff | null | undefined
): Drivers {
  const suggestion = suggestGroutTrips(takeoff);
  if (suggestion.trips <= 0) return { ...drivers };

  const trips = suggestion.trips;
  const hours = trips * GROUT_HOURS_PER_TRIP;
  const otHours = Math.round(hours * 0.15 * 10) / 10;
  const source =
    suggestion.padSfSource === "buildingPadSf"
      ? "buildingPadSf"
      : "buildingAreaSf";
  const notesDefault = `From takeoff: grout baseplates in SI; ceil(${suggestion.padSf} / ${suggestion.ft2PerTrip}) ${source} = ${trips} trips`;

  return {
    ...drivers,
    trips,
    hours,
    otHours,
    days: trips,
    vehicleTrips: trips,
    notes:
      typeof drivers.notes === "string" && drivers.notes.trim()
        ? drivers.notes
        : notesDefault,
  };
}

export function isHighStrengthGroutParent(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes("high-strength grout") ||
    (lower.includes("grout") && lower.includes("testing"))
  );
}


export const STRUCTURAL_STEEL_HOURS_PER_TRIP = 4;

export const DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP = 20000;
export const DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS = 1;
export const DEFAULT_STRUCTURE_LEVEL_COUNT = 1;

/**
 * Effective structural steel building SF: dedicated structuralSteelBuildingSf when set (>0),
 * else buildingAreaSf.
 */
export function effectiveStructuralSteelSf(
  takeoff: ProjectTakeoff | null | undefined
): number {
  const dedicated = n(takeoff?.structuralSteelBuildingSf, 0);
  if (dedicated > 0) return dedicated;
  return n(takeoff?.buildingAreaSf, 0);
}

export type StructuralSteelTripSuggestion = {
  trips: number;
  perLevelTrips: number;
  areaTripsPerLevel: number;
  finalTripsPerLevel: number;
  structureLevelCount: number;
  sf: number;
  sfPerTrip: number;
  finalInspectionTrips: number;
  sfSource: "structuralSteelBuildingSf" | "buildingAreaSf" | "none";
};

/**
 * Structural Steel Inspections — trip rule:
 *
 * Per structure level: one (1) trip for every 20,000 ft² plus final inspection trips (default 1).
 * Multiply by structureLevelCount when multiple levels are present.
 *
 *   sf = structuralSteelBuildingSf > 0 ? structuralSteelBuildingSf : buildingAreaSf
 *   perLevelTrips = sf > 0 ? ceil(sf / structuralSteelSfPerTrip) + finalInspectionTrips : 0
 *   trips = structureLevelCount * perLevelTrips
 *
 * structureLevelCount default 1, min 1.
 * When sf is 0: trips = 0 (no final alone).
 * Wired ONLY to parent "Structural Steel Inspections".
 *
 * Example: 100,000 SF, 1 level → 6; same SF, 3 levels → 18.
 */
export function suggestStructuralSteelTrips(
  takeoff: ProjectTakeoff | null | undefined
): StructuralSteelTripSuggestion {
  const dedicated = n(takeoff?.structuralSteelBuildingSf, 0);
  const sfSource: StructuralSteelTripSuggestion["sfSource"] =
    dedicated > 0
      ? "structuralSteelBuildingSf"
      : n(takeoff?.buildingAreaSf, 0) > 0
        ? "buildingAreaSf"
        : "none";
  const sf = effectiveStructuralSteelSf(takeoff);
  const sfPerTrip =
    n(takeoff?.structuralSteelSfPerTrip, 0) > 0
      ? n(takeoff?.structuralSteelSfPerTrip)
      : DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP;
  const finalRaw = takeoff?.structuralSteelFinalInspectionTrips;
  const finalInspectionTrips =
    finalRaw != null && Number.isFinite(Number(finalRaw)) && Number(finalRaw) >= 0
      ? Math.max(0, Math.floor(n(finalRaw)))
      : DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS;
  const levelsRaw = takeoff?.structureLevelCount;
  const structureLevelCount = Math.max(
    1,
    levelsRaw != null && Number.isFinite(Number(levelsRaw)) && Number(levelsRaw) >= 1
      ? Math.floor(n(levelsRaw))
      : DEFAULT_STRUCTURE_LEVEL_COUNT
  );

  const areaTripsPerLevel = sf > 0 ? ceilTrips(sf, sfPerTrip) : 0;
  const finalTripsPerLevel = sf > 0 ? finalInspectionTrips : 0;
  const perLevelTrips = areaTripsPerLevel + finalTripsPerLevel;
  const trips = perLevelTrips > 0 ? structureLevelCount * perLevelTrips : 0;

  return {
    trips,
    perLevelTrips,
    areaTripsPerLevel,
    finalTripsPerLevel,
    structureLevelCount,
    sf,
    sfPerTrip,
    finalInspectionTrips,
    sfSource,
  };
}

export function hasStructuralSteelTakeoff(
  takeoff: ProjectTakeoff | null | undefined
): boolean {
  return suggestStructuralSteelTrips(takeoff).trips > 0;
}

export function structuralSteelTripRuleLabel(
  takeoff: ProjectTakeoff | null | undefined
): string {
  const suggestion = suggestStructuralSteelTrips(takeoff);
  const sourceNote =
    suggestion.sfSource === "structuralSteelBuildingSf"
      ? "structural steel building SF"
      : suggestion.sfSource === "buildingAreaSf"
        ? "building area SF (steel SF not set)"
        : "building SF";

  if (suggestion.sf <= 0) {
    return `Structural Steel Inspections: per level ceil(SF / ${suggestion.sfPerTrip.toLocaleString()}) + ${suggestion.finalInspectionTrips} final, × structure levels (default 1). Enter steel building SF (or building area) to suggest trips.`;
  }
  return `Structural Steel Inspections: ${suggestion.structureLevelCount} level(s) × (ceil(${suggestion.sf.toLocaleString()} / ${suggestion.sfPerTrip.toLocaleString()}) + ${suggestion.finalTripsPerLevel} final) = ${suggestion.structureLevelCount} × ${suggestion.perLevelTrips} = ${suggestion.trips} trips from ${sourceNote}.`;
}

export function applyStructuralSteelTakeoffToDrivers(
  drivers: Drivers,
  takeoff: ProjectTakeoff | null | undefined
): Drivers {
  const suggestion = suggestStructuralSteelTrips(takeoff);
  if (suggestion.trips <= 0) return { ...drivers };

  const trips = suggestion.trips;
  const hours = trips * STRUCTURAL_STEEL_HOURS_PER_TRIP;
  const otHours = Math.round(hours * 0.15 * 10) / 10;
  const source =
    suggestion.sfSource === "structuralSteelBuildingSf"
      ? "structuralSteelBuildingSf"
      : "buildingAreaSf";
  const notesDefault = `From takeoff: ${suggestion.structureLevelCount} levels × (ceil(${suggestion.sf} / ${suggestion.sfPerTrip}) + ${suggestion.finalTripsPerLevel} final) (${source}) = ${trips} trips`;

  return {
    ...drivers,
    trips,
    hours,
    otHours,
    days: trips,
    vehicleTrips: trips,
    notes:
      typeof drivers.notes === "string" && drivers.notes.trim()
        ? drivers.notes
        : notesDefault,
  };
}

export const STRUCTURAL_STEEL_INSPECTIONS_PARENT_NAME =
  "Structural Steel Inspections";

/** Primary steel parent only — not Bolting/Welding/NDT breakouts. */
export function isStructuralSteelParent(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return (
    lower === "structural steel inspections" ||
    (lower.includes("structural steel") && lower.includes("inspection") &&
      !lower.includes("bolting") &&
      !lower.includes("welding") &&
      !lower.includes("ndt"))
  );
}

export const FLOOR_FLATNESS_HOURS_PER_TRIP = 4;

export const DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS = 30000;

/**
 * Effective floor flatness SF: dedicated floorFlatnessSf when set (>0),
 * else buildingAreaSf (building slab SF proxy).
 */
export function effectiveFloorFlatnessSf(
  takeoff: ProjectTakeoff | null | undefined
): number {
  const dedicated = n(takeoff?.floorFlatnessSf, 0);
  if (dedicated > 0) return dedicated;
  return n(takeoff?.buildingAreaSf, 0);
}

export type FloorFlatnessTripSuggestion = {
  trips: number;
  pourTrips: number;
  sfTrips: number;
  pourCount: number;
  sf: number;
  ft2PerTrip: number;
  sfSource: "floorFlatnessSf" | "buildingAreaSf" | "none";
};

/**
 * Floor Flatness Testing & Observations — trip rule (only when parent in scope):
 *
 * One (1) trip per building slab-on-grade pour OR one (1) trip per 30,000 ft².
 * Suggested trips = max(pourTrips, sfTrips) so both bases are honored.
 *
 *   pourTrips = slabOnGradePourCount when > 0, else 0
 *   sf = floorFlatnessSf > 0 ? floorFlatnessSf : buildingAreaSf
 *   sfTrips = sf > 0 ? ceil(sf / ft2PerTripFloorFlatness) : 0
 *   trips = max(pourTrips, sfTrips)
 *
 * If only one input is present, that one is used (max with 0).
 * Wired ONLY to parent Floor-Flatness Testing / Floor Flatness Testing & Observations.
 *
 * Examples: 2 pours + 50k SF → 2; 2 pours + 100k SF → 4; 0 pours + 25k SF → 1.
 */
export function suggestFloorFlatnessTrips(
  takeoff: ProjectTakeoff | null | undefined
): FloorFlatnessTripSuggestion {
  const pourRaw = takeoff?.slabOnGradePourCount;
  const pourCount =
    pourRaw != null && Number.isFinite(Number(pourRaw)) && Number(pourRaw) > 0
      ? Math.floor(n(pourRaw))
      : 0;
  const pourTrips = pourCount > 0 ? pourCount : 0;

  const dedicated = n(takeoff?.floorFlatnessSf, 0);
  const sfSource: FloorFlatnessTripSuggestion["sfSource"] =
    dedicated > 0
      ? "floorFlatnessSf"
      : n(takeoff?.buildingAreaSf, 0) > 0
        ? "buildingAreaSf"
        : "none";
  const sf = effectiveFloorFlatnessSf(takeoff);
  const ft2PerTrip =
    n(takeoff?.ft2PerTripFloorFlatness, 0) > 0
      ? n(takeoff?.ft2PerTripFloorFlatness)
      : DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS;
  const sfTrips = sf > 0 ? ceilTrips(sf, ft2PerTrip) : 0;
  const trips = Math.max(pourTrips, sfTrips);

  return {
    trips,
    pourTrips,
    sfTrips,
    pourCount,
    sf,
    ft2PerTrip,
    sfSource,
  };
}

export function hasFloorFlatnessTakeoff(
  takeoff: ProjectTakeoff | null | undefined
): boolean {
  return suggestFloorFlatnessTrips(takeoff).trips > 0;
}

export function floorFlatnessTripRuleLabel(
  takeoff: ProjectTakeoff | null | undefined
): string {
  const suggestion = suggestFloorFlatnessTrips(takeoff);
  const sourceNote =
    suggestion.sfSource === "floorFlatnessSf"
      ? "floor flatness SF"
      : suggestion.sfSource === "buildingAreaSf"
        ? "building area SF (floor flatness SF not set)"
        : "building SF";

  if (suggestion.trips <= 0) {
    return `Floor Flatness: 1 trip per slab-on-grade pour or 1 trip / ${suggestion.ft2PerTrip.toLocaleString()} ft² — suggested = max(pours, SF rule). Enter pour count and/or SF (falls back to building area).`;
  }
  return `Floor Flatness: pours: ${suggestion.pourTrips} | SF rule: ${suggestion.sfTrips} → using max ${suggestion.trips} (from ${sourceNote}${suggestion.sf > 0 ? `, ${suggestion.sf.toLocaleString()} ft² / ${suggestion.ft2PerTrip.toLocaleString()}` : ""}).`;
}

export function applyFloorFlatnessTakeoffToDrivers(
  drivers: Drivers,
  takeoff: ProjectTakeoff | null | undefined
): Drivers {
  const suggestion = suggestFloorFlatnessTrips(takeoff);
  if (suggestion.trips <= 0) return { ...drivers };

  const trips = suggestion.trips;
  const hours = trips * FLOOR_FLATNESS_HOURS_PER_TRIP;
  const otHours = Math.round(hours * 0.15 * 10) / 10;
  const source =
    suggestion.sfSource === "floorFlatnessSf"
      ? "floorFlatnessSf"
      : "buildingAreaSf";
  const notesDefault = `From takeoff: max(pours ${suggestion.pourTrips}, SF ceil(${suggestion.sf} / ${suggestion.ft2PerTrip})=${suggestion.sfTrips}) (${source}) = ${trips} trips`;

  return {
    ...drivers,
    trips,
    hours,
    otHours,
    days: trips,
    vehicleTrips: trips,
    notes:
      typeof drivers.notes === "string" && drivers.notes.trim()
        ? drivers.notes
        : notesDefault,
  };
}

export const FLOOR_FLATNESS_PARENT_NAME =
  "Floor Flatness Testing & Observations";

/** Floor-Flatness Testing (seed legacy) or Floor Flatness Testing & Observations. */
export function isFloorFlatnessParent(name: string): boolean {
  const lower = name.toLowerCase().trim();
  return (
    lower === "floor flatness testing & observations" ||
    lower === "floor-flatness testing" ||
    lower === "floor flatness testing" ||
    ((lower.includes("floor-flatness") || lower.includes("floor flatness")) &&
      (lower.includes("testing") || lower.includes("observation")))
  );
}


export const POST_TENSION_HOURS_PER_TRIP = 4;

export const POST_TENSION_PARENT_NAME =
  "Post-Tension Testing & Observations";

/**
 * Effective post-tension pour count: dedicated postTensionSlabPourCount when set (>0),
 * else slabOnGradePourCount (often the same as slab pours).
 */
export function effectivePostTensionPourCount(
  takeoff: ProjectTakeoff | null | undefined
): {
  pourCount: number;
  source: "postTensionSlabPourCount" | "slabOnGradePourCount" | "none";
} {
  const dedicated = takeoff?.postTensionSlabPourCount;
  if (
    dedicated != null &&
    Number.isFinite(Number(dedicated)) &&
    Number(dedicated) > 0
  ) {
    return {
      pourCount: Math.floor(Number(dedicated)),
      source: "postTensionSlabPourCount",
    };
  }
  const fallback = takeoff?.slabOnGradePourCount;
  if (
    fallback != null &&
    Number.isFinite(Number(fallback)) &&
    Number(fallback) > 0
  ) {
    return {
      pourCount: Math.floor(Number(fallback)),
      source: "slabOnGradePourCount",
    };
  }
  return { pourCount: 0, source: "none" };
}

export type PostTensionTripSuggestion = {
  trips: number;
  pourCount: number;
  pourSource: "postTensionSlabPourCount" | "slabOnGradePourCount" | "none";
};

/**
 * Post-Tension Testing & Observations — trip rules (only when parent in scope):
 *
 * Total trips = 2 × pourCount when pourCount > 0
 * (A+B: one pre-pour visit + one tendon stressing visit per pour — used only
 * to size trips; Apply suggestions keeps a single parent hours line + Vehicle,
 * not separate Pre-pour / Tendon Stressing rows.)
 *
 * pourCount = postTensionSlabPourCount (fallback: slabOnGradePourCount)
 * Example: 3 pours → 6 trips.
 */
export function suggestPostTensionTrips(
  takeoff: ProjectTakeoff | null | undefined
): PostTensionTripSuggestion {
  const { pourCount, source } = effectivePostTensionPourCount(takeoff);
  const trips = pourCount > 0 ? 2 * pourCount : 0;
  return {
    trips,
    pourCount,
    pourSource: source,
  };
}

export function hasPostTensionTakeoff(
  takeoff: ProjectTakeoff | null | undefined
): boolean {
  return suggestPostTensionTrips(takeoff).trips > 0;
}

export function postTensionTripRuleLabel(
  takeoff: ProjectTakeoff | null | undefined
): string {
  const suggestion = suggestPostTensionTrips(takeoff);
  const sourceNote =
    suggestion.pourSource === "postTensionSlabPourCount"
      ? "post-tension pour count"
      : suggestion.pourSource === "slabOnGradePourCount"
        ? "slab-on-grade pour count (post-tension pours not set; often the same)"
        : "pour count";

  if (suggestion.trips <= 0) {
    return `Post-Tension: trips = 2 × pours (pre-pour + tendon stressing visits). Enter post-tension slab pour count (falls back to slab-on-grade pours).`;
  }
  return `Post-Tension: ${suggestion.trips} trips (2 × ${suggestion.pourCount} pours from ${sourceNote}).`;
}

export function applyPostTensionTakeoffToDrivers(
  drivers: Drivers,
  takeoff: ProjectTakeoff | null | undefined
): Drivers {
  const suggestion = suggestPostTensionTrips(takeoff);
  if (suggestion.trips <= 0) return { ...drivers };

  const trips = suggestion.trips;
  const hours = trips * POST_TENSION_HOURS_PER_TRIP;
  const otHours = Math.round(hours * 0.15 * 10) / 10;
  const source =
    suggestion.pourSource === "postTensionSlabPourCount"
      ? "postTensionSlabPourCount"
      : "slabOnGradePourCount";
  const notesDefault = `From takeoff: 2 × ${suggestion.pourCount} pours = ${trips} trips (${source})`;

  return {
    ...drivers,
    trips,
    hours,
    otHours,
    days: trips,
    vehicleTrips: trips,
    notes:
      typeof drivers.notes === "string" && drivers.notes.trim()
        ? drivers.notes
        : notesDefault,
  };
}

/** Post-Tension Testing & Observations (not Post-Installed Anchor). */
export function isPostTensionParent(name: string): boolean {
  const lower = name.toLowerCase().trim();
  if (lower.includes("post-installed") || lower.includes("post installed")) {
    return false;
  }
  return (
    lower === "post-tension testing & observations" ||
    lower === "post tension testing & observations" ||
    ((lower.includes("post-tension") || lower.includes("post tension")) &&
      (lower.includes("testing") || lower.includes("observation")))
  );
}

export function suggestFieldLines(
  parentName: string,
  drivers: Drivers,
  takeoff?: ProjectTakeoff | null
): SuggestedLine[] {
  let d = drivers;
  if (isEarthworkTestingParent(parentName) && hasEarthworkTakeoff(takeoff)) {
    d = applyEarthworkTakeoffToDrivers(drivers, takeoff);
  } else if (
    isCipDeepFoundationsParent(parentName) &&
    hasFoundationTakeoff(takeoff)
  ) {
    d = applyFoundationTakeoffToDrivers(drivers, takeoff);
  } else if (
    isConcreteTestingReinforcingParent(parentName) &&
    hasConcreteTakeoff(takeoff)
  ) {
    d = applyConcreteTakeoffToDrivers(drivers, takeoff);
  } else if (
    isMasonryTestingParent(parentName) &&
    hasMasonryTakeoff(takeoff)
  ) {
    d = applyMasonryTakeoffToDrivers(drivers, takeoff);
  } else if (
    isHighStrengthGroutParent(parentName) &&
    hasGroutTakeoff(takeoff)
  ) {
    d = applyGroutTakeoffToDrivers(drivers, takeoff);
  } else if (
    isStructuralSteelParent(parentName) &&
    hasStructuralSteelTakeoff(takeoff)
  ) {
    d = applyStructuralSteelTakeoffToDrivers(drivers, takeoff);
  } else if (
    isFloorFlatnessParent(parentName) &&
    hasFloorFlatnessTakeoff(takeoff)
  ) {
    d = applyFloorFlatnessTakeoffToDrivers(drivers, takeoff);
  } else if (
    isPostTensionParent(parentName) &&
    hasPostTensionTakeoff(takeoff)
  ) {
    d = applyPostTensionTakeoffToDrivers(drivers, takeoff);
  }

  const trips = n(d.trips, 0);
  const hours = n(d.hours, 0);
  const otHours = n(d.otHours, Math.round(hours * 0.15 * 10) / 10);
  const vehicleTrips = n(d.vehicleTrips, trips);
  const gaugeDays = n(d.gaugeDays, n(d.days, trips > 0 ? trips : 0));
  const lines: SuggestedLine[] = [];
  const name = parentName.toLowerCase();

  if (name.includes("earthwork testing")) {
    if (hours > 0)
      lines.push({ description: "Soils Testing", quantity: hours, units: "hours", trips, isLab: false });
    if (otHours > 0)
      lines.push({ description: "Soils Testing (OT)", quantity: otHours, units: "hours", trips: null, isLab: false });
    if (gaugeDays > 0)
      lines.push({ description: "Nuclear Density Gauge", quantity: gaugeDays, units: "day", trips: null, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("earthwork sample")) {
    if (trips > 0)
      lines.push({ description: "Sample Pickup", quantity: trips, units: "each", trips, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("cip deep") || name.includes("foundation")) {
    if (hours > 0)
      lines.push({ description: "Foundation Inspection", quantity: hours, units: "hours", trips, isLab: false });
    if (otHours > 0)
      lines.push({ description: "Foundation Inspection (OT)", quantity: otHours, units: "hours", trips: null, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("concrete testing")) {
    if (hours > 0)
      lines.push({ description: "Concrete Testing", quantity: hours, units: "hours", trips, isLab: false });
    if (otHours > 0)
      lines.push({ description: "Concrete Testing (OT)", quantity: otHours, units: "hours", trips: null, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("concrete sample")) {
    if (trips > 0)
      lines.push({ description: "Sample Pickup", quantity: trips, units: "each", trips, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("asphalt")) {
    if (hours > 0)
      lines.push({ description: "Asphalt Testing", quantity: hours, units: "hours", trips, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("masonry testing")) {
    if (hours > 0)
      lines.push({ description: "Masonry Testing & Observations", quantity: hours, units: "hours", trips, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("masonry sample")) {
    if (trips > 0)
      lines.push({ description: "Sample Pickup", quantity: trips, units: "each", trips, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("grout")) {
    if (hours > 0)
      lines.push({ description: "High-Strength Grout Testing", quantity: hours, units: "hours", trips, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (
    name.includes("structural steel") &&
    name.includes("inspection") &&
    !name.includes("bolting") &&
    !name.includes("welding") &&
    !name.includes("ndt")
  ) {
    if (hours > 0)
      lines.push({ description: "Structural Steel Inspections", quantity: hours, units: "hours", trips, isLab: false });
    if (otHours > 0)
      lines.push({ description: "Structural Steel Inspections (OT)", quantity: otHours, units: "hours", trips: null, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("bolting")) {
    if (hours > 0)
      lines.push({ description: "Structural Steel Bolting Observation", quantity: hours, units: "hours", trips, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("welding")) {
    if (hours > 0)
      lines.push({ description: "Structural Steel Welding Observation", quantity: hours, units: "hours", trips, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("ndt")) {
    if (hours > 0)
      lines.push({ description: "Structural Steel NDT", quantity: hours, units: "hours", trips, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("floor-flatness") || name.includes("floor flatness")) {
    const days = n(d.days, 0);
    if (hours > 0 || days > 0) {
      const qty = hours > 0 ? hours : n(d.days, 1);
      lines.push({ description: FLOOR_FLATNESS_PARENT_NAME, quantity: qty, units: hours > 0 ? "hours" : "day", trips, isLab: false });
    }
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (
    (name.includes("post-tension") || name.includes("post tension")) &&
    !name.includes("post-installed") &&
    !name.includes("post installed")
  ) {
    // Single parent hours × trips line + Vehicle (no Pre-pour / Tendon breakout)
    if (hours > 0)
      lines.push({
        description: POST_TENSION_PARENT_NAME,
        quantity: hours,
        units: "hours",
        trips,
        isLab: false,
      });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  } else if (name.includes("project administration") || name.includes("admin support")) {
    lines.push({
      description: parentName.includes("8%") ? "Admin Support (8% note)" : "Project Administration",
      quantity: hours > 0 ? hours : 1,
      units: hours > 0 ? "hours" : "each",
      trips: null,
      isLab: false,
      notes: name.includes("8%") ? "Typically ~8% of technical fees — re-key manually in Pricing Tool" : "",
    });
  } else if (name.includes("laboratory")) {
    // lab handled separately
  } else {
    if (hours > 0)
      lines.push({ description: parentName, quantity: hours, units: "hours", trips, isLab: false });
    if (otHours > 0 && hours > 0)
      lines.push({ description: `${parentName} (OT)`, quantity: otHours, units: "hours", trips: null, isLab: false });
    if (vehicleTrips > 0)
      lines.push({ description: "Vehicle Charge", quantity: vehicleTrips, units: "each", trips: vehicleTrips, isLab: false });
  }

  return lines;
}

export function suggestLabLines(
  parents: { name: string; drivers: Drivers }[]
): SuggestedLine[] {
  const lines: SuggestedLine[] = [];
  let concreteSamples = 0;
  let earthworkTrips = 0;
  let asphaltTrips = 0;
  let masonrySamples = 0;
  let groutSamples = 0;

  for (const p of parents) {
    const name = p.name.toLowerCase();
    const d = p.drivers;
    const samples = n(d.samples, 0);
    const trips = n(d.trips, 0);
    const cyl = n(d.cylindersPerSample, 4);

    if (name.includes("concrete testing") || name.includes("concrete sample")) {
      concreteSamples += samples > 0 ? samples : trips;
      if (samples === 0 && trips === 0 && n(d.hours, 0) > 0) {
        concreteSamples += Math.max(1, Math.round(n(d.hours) / 4));
      }
      void cyl;
    }
    if (name.includes("earthwork")) {
      earthworkTrips += trips > 0 ? trips : n(d.days, 0);
    }
    if (name.includes("asphalt")) {
      asphaltTrips += trips > 0 ? trips : Math.max(1, Math.round(n(d.hours) / 8));
    }
    if (name.includes("masonry")) {
      masonrySamples += samples > 0 ? samples : trips;
    }
    if (name.includes("grout")) {
      groutSamples += samples > 0 ? samples : trips;
    }
  }

  if (concreteSamples > 0) {
    const tests = concreteSamples * n(
      parents.find((p) => p.name.toLowerCase().includes("concrete"))?.drivers.cylindersPerSample,
      4
    );
    lines.push({
      description: "Compressive Strength (Concrete)",
      quantity: tests,
      units: "tests",
      trips: null,
      isLab: true,
      notes: `Suggested from ~${concreteSamples} sample sets × cylinders/set`,
    });
  }
  if (groutSamples > 0) {
    lines.push({
      description: "Compressive Strength (Grout)",
      quantity: groutSamples * 3,
      units: "tests",
      trips: null,
      isLab: true,
    });
  }
  if (masonrySamples > 0) {
    lines.push({
      description: "Compressive Strength (Mortar)",
      quantity: masonrySamples * 3,
      units: "tests",
      trips: null,
      isLab: true,
    });
  }
  if (earthworkTrips > 0) {
    const sets = Math.max(1, Math.ceil(earthworkTrips / 3));
    lines.push({ description: "Atterberg Limits", quantity: sets, units: "tests", trips: null, isLab: true });
    lines.push({ description: "Proctor / Lab Compaction", quantity: sets, units: "tests", trips: null, isLab: true });
    lines.push({ description: "Sieve Analysis", quantity: sets, units: "tests", trips: null, isLab: true });
    lines.push({ description: "Wash #200", quantity: sets, units: "tests", trips: null, isLab: true });
  }
  if (asphaltTrips > 0) {
    lines.push({
      description: "Asphalt Bulk Density",
      quantity: Math.max(1, asphaltTrips),
      units: "tests",
      trips: null,
      isLab: true,
    });
  }

  return lines;
}

export function missCheckPrompts(
  selectedNames: string[],
  catalog: { name: string; relatedHints: string[] }[],
  takeoff?: ProjectTakeoff | null
): { parent: string; missing: string; message: string }[] {
  const selected = new Set(selectedNames);
  const prompts: { parent: string; missing: string; message: string }[] = [];

  for (const c of catalog) {
    if (!selected.has(c.name)) continue;
    for (const related of c.relatedHints) {
      if (!selected.has(related)) {
        prompts.push({
          parent: c.name,
          missing: related,
          message: `You selected "${c.name}" but not "${related}". Consider adding related scope.`,
        });
      }
    }
  }

  // Takeoff flag on but High-Strength Grout parent not in scope
  if (
    takeoff?.groutBaseplatesInSpecialInspection &&
    !selected.has(HIGH_STRENGTH_GROUT_PARENT_NAME) &&
    ![...selected].some((n) => isHighStrengthGroutParent(n))
  ) {
    prompts.push({
      parent: HIGH_STRENGTH_GROUT_PARENT_NAME,
      missing: HIGH_STRENGTH_GROUT_PARENT_NAME,
      message: `Grout baseplates are marked present in special inspection, but "${HIGH_STRENGTH_GROUT_PARENT_NAME}" is not in scope. Consider adding it.`,
    });
  }

  return prompts;
}

export function parseDrivers(json: string): Drivers {
  try {
    return JSON.parse(json || "{}") as Drivers;
  } catch {
    return {};
  }
}

export function parseHints(json: string): string[] {
  try {
    const v = JSON.parse(json || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function takeoffFromProject(project: {
  buildingAreaSf?: number | null;
  moistureConditionedSubgrade?: boolean;
  flexibleBaseCap?: boolean;
  earthworkSfPerTrip?: number | null;
  pavementAreaSf?: number | null;
  limeTreatedPavementSubgrade?: boolean;
  pavementSfPerTrip?: number | null;
  pavementSubgradeLf?: number | null;
  pavementLfPerTrip?: number | null;
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
}): ProjectTakeoff {
  return {
    buildingAreaSf: project.buildingAreaSf ?? null,
    moistureConditionedSubgrade: project.moistureConditionedSubgrade ?? false,
    flexibleBaseCap: project.flexibleBaseCap ?? false,
    earthworkSfPerTrip: project.earthworkSfPerTrip ?? DEFAULT_EARTHWORK_SF_PER_TRIP,
    pavementAreaSf: project.pavementAreaSf ?? null,
    limeTreatedPavementSubgrade: project.limeTreatedPavementSubgrade ?? false,
    pavementSfPerTrip: project.pavementSfPerTrip ?? DEFAULT_PAVEMENT_SF_PER_TRIP,
    pavementSubgradeLf: project.pavementSubgradeLf ?? null,
    pavementLfPerTrip: project.pavementLfPerTrip ?? DEFAULT_PAVEMENT_LF_PER_TRIP,
    sidewalkLf: project.sidewalkLf ?? null,
    sidewalksBunchedTogether: project.sidewalksBunchedTogether ?? false,
    sidewalkSpreadLfPerTrip:
      project.sidewalkSpreadLfPerTrip ?? DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP,
    sidewalkBunchedLfPerTrip:
      project.sidewalkBunchedLfPerTrip ?? DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP,
    utilityTrenchLf: project.utilityTrenchLf ?? null,
    utilityTrenchLfPerTrip:
      project.utilityTrenchLfPerTrip ?? DEFAULT_UTILITY_TRENCH_LF_PER_TRIP,
    foundationScheduleTrips: project.foundationScheduleTrips ?? null,
    pierCount: project.pierCount ?? null,
    pierType: normalizePierType(project.pierType),
    piersPerTripStraight:
      project.piersPerTripStraight ?? DEFAULT_PIERS_PER_TRIP_STRAIGHT,
    piersPerTripCased: project.piersPerTripCased ?? DEFAULT_PIERS_PER_TRIP_CASED,
    piersPerTripBelled:
      project.piersPerTripBelled ?? DEFAULT_PIERS_PER_TRIP_BELLED,
    concreteYd3GradeBeamsPierCaps:
      project.concreteYd3GradeBeamsPierCaps ?? null,
    yd3PerTripGradeBeams:
      project.yd3PerTripGradeBeams ?? DEFAULT_YD3_PER_TRIP_GRADE_BEAMS,
    concreteYd3BuildingSlab: project.concreteYd3BuildingSlab ?? null,
    yd3PerTripBuildingSlab:
      project.yd3PerTripBuildingSlab ?? DEFAULT_YD3_PER_TRIP_BUILDING_SLAB,
    concreteYd3PrivatePavement: project.concreteYd3PrivatePavement ?? null,
    yd3PerTripPrivatePavement:
      project.yd3PerTripPrivatePavement ?? DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT,
    concreteYd3PublicPavement: project.concreteYd3PublicPavement ?? null,
    yd3PerTripPublicPavement:
      project.yd3PerTripPublicPavement ?? DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT,
    masonryLoadBearingCmuSf: project.masonryLoadBearingCmuSf ?? null,
    masonrySfPerTripLoadBearingCmu:
      project.masonrySfPerTripLoadBearingCmu ??
      DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING,
    masonryElevatorBuildingCount: project.masonryElevatorBuildingCount ?? null,
    masonryElevatorShaftHeightFt: project.masonryElevatorShaftHeightFt ?? null,
    masonryFtPerTripElevatorShaft:
      project.masonryFtPerTripElevatorShaft ??
      DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT,
    masonryCmuEnclosureCount: project.masonryCmuEnclosureCount ?? null,
    groutBaseplatesInSpecialInspection:
      project.groutBaseplatesInSpecialInspection ?? false,
    buildingPadSf: project.buildingPadSf ?? null,
    ft2PerTripGroutBaseplates:
      project.ft2PerTripGroutBaseplates ??
      DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES,
    structuralSteelBuildingSf: project.structuralSteelBuildingSf ?? null,
    structuralSteelSfPerTrip:
      project.structuralSteelSfPerTrip ??
      DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP,
    structuralSteelFinalInspectionTrips:
      project.structuralSteelFinalInspectionTrips ??
      DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS,
    structureLevelCount:
      project.structureLevelCount != null && project.structureLevelCount >= 1
        ? Math.floor(project.structureLevelCount)
        : DEFAULT_STRUCTURE_LEVEL_COUNT,
    slabOnGradePourCount: project.slabOnGradePourCount ?? null,
    floorFlatnessSf: project.floorFlatnessSf ?? null,
    ft2PerTripFloorFlatness:
      project.ft2PerTripFloorFlatness ??
      DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS,
    postTensionSlabPourCount: project.postTensionSlabPourCount ?? null,
  };
}
