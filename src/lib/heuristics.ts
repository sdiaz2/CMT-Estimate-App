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
};

/**
 * Suggested earthwork trips breakdown.
 * pavementTrips is either lime SF or non-lime LF — never both.
 * sidewalkTrips uses spread (125) or bunched (150) divisor.
 * total = buildingTrips + pavementTrips + sidewalkTrips
 */
export type EarthworkTripSuggestion = {
  buildingTrips: number;
  pavementTrips: number;
  pavementSfTrips: number;
  pavementLfTrips: number;
  sidewalkTrips: number;
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
 * total = building + pavement + sidewalk
 *
 * Example (lime): 100k SF building @ 2850 → 36; 150k SF pavement @ 27500 → 6; combined 42 (+ sidewalk if any).
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

  return {
    buildingTrips,
    pavementTrips,
    pavementSfTrips,
    pavementLfTrips,
    sidewalkTrips,
    limeTreated,
    sidewalksBunched,
    total: buildingTrips + pavementTrips + sidewalkTrips,
  };
}

export function hasEarthworkTakeoff(
  takeoff: ProjectTakeoff | null | undefined
): boolean {
  if (n(takeoff?.buildingAreaSf, 0) > 0) return true;
  if (n(takeoff?.sidewalkLf, 0) > 0) return true;
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

  const suggestion = suggestEarthworkTrips(takeoff);
  const out: {
    building?: string;
    pavement?: string;
    sidewalk?: string;
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

  const parts: string[] = [];
  if (suggestion.buildingTrips > 0) parts.push(`${suggestion.buildingTrips} building`);
  if (suggestion.pavementTrips > 0) {
    parts.push(
      `${suggestion.pavementTrips} pavement ${limeTreated ? "SF" : "LF"}`
    );
  }
  if (suggestion.sidewalkTrips > 0) parts.push(`${suggestion.sidewalkTrips} sidewalk`);
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
  return [labels.building, labels.pavement, labels.sidewalk, labels.combined]
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

export function suggestFieldLines(
  parentName: string,
  drivers: Drivers,
  takeoff?: ProjectTakeoff | null
): SuggestedLine[] {
  let d = drivers;
  if (isEarthworkTestingParent(parentName) && hasEarthworkTakeoff(takeoff)) {
    d = applyEarthworkTakeoffToDrivers(drivers, takeoff);
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
  };
}
