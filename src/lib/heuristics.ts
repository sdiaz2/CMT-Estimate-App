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
  // Future pour types (walls, etc.) get their own yd³ + divisor fields here.
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
 * Building: ceil(buildingSF / earthworkSfPerTrip) — default 2850 (2700–3000).
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
    out.building = `Building: 1 trip / ${buildingDivisor.toLocaleString()} SF → ${suggestion.buildingTrips} trips from ${buildingSf.toLocaleString()} SF (typical 2,700–3,000)`;
  } else {
    out.building = `Building: 1 trip / ${buildingDivisor.toLocaleString()} SF (typical 2,700–3,000). Enter building area to suggest trips.`;
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

/** Shared pour trip helper: when yd³ > 0, max(minTrips, ceil(yd³ / divisor)). */
function concretePourTrips(yd3: number, divisor: number, minTrips: number): number {
  if (yd3 <= 0 || divisor <= 0) return 0;
  return Math.max(minTrips, Math.ceil(yd3 / divisor));
}

/**
 * Suggested concrete trips breakdown.
 * Rule A (grade beams / pier caps) + Rule B (building slab); structure ready for C (walls, …).
 * total = gradeBeamsPierCapsTrips + buildingSlabTrips (+ future pour-type trips)
 */
export type ConcreteTripSuggestion = {
  gradeBeamsPierCapsTrips: number;
  buildingSlabTrips: number;
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
 * total = gradeBeamsPierCapsTrips + buildingSlabTrips
 *
 * Example A: 50 yd³ @ 137.5 → ceil(0.36)=1 → min 2 → 2 trips
 * Example A: 400 yd³ @ 137.5 → ceil(2.91)=3 trips
 * Example B: 200 yd³ @ 300 → ceil(0.67)=1 → min 2 → 2 trips
 * Example B: 900 yd³ @ 300 → ceil(3)=3 trips
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

  return {
    gradeBeamsPierCapsTrips,
    buildingSlabTrips,
    total: gradeBeamsPierCapsTrips + buildingSlabTrips,
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
  const suggestion = suggestConcreteTrips(takeoff);
  const out: {
    gradeBeamsPierCaps?: string;
    buildingSlab?: string;
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

  const parts: string[] = [];
  if (suggestion.gradeBeamsPierCapsTrips > 0)
    parts.push(`${suggestion.gradeBeamsPierCapsTrips} grade beams/pier caps`);
  if (suggestion.buildingSlabTrips > 0)
    parts.push(`${suggestion.buildingSlabTrips} building slab`);
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
  return [labels.gradeBeamsPierCaps, labels.buildingSlab, labels.combined]
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
      lines.push({ description: "Floor-Flatness Testing", quantity: qty, units: hours > 0 ? "hours" : "day", trips, isLab: false });
    }
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
  catalog: { name: string; relatedHints: string[] }[]
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
  };
}
