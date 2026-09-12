import type { Drivers } from "./types";

export type SuggestedLine = {
  description: string;
  quantity: number;
  units: string;
  trips?: number | null;
  isLab: boolean;
  notes?: string;
};

/** Project takeoff facts used by earthwork trip rule. */
export type ProjectTakeoff = {
  buildingAreaSf?: number | null;
  moistureConditionedSubgrade?: boolean;
  flexibleBaseCap?: boolean;
  earthworkSfPerTrip?: number | null;
};

/** Typical hours per earthwork testing trip (seed default: 12 trips → 48 hours). */
export const EARTHWORK_HOURS_PER_TRIP = 4;

/** Default SF per trip (middle of 2700–3000 range). */
export const DEFAULT_EARTHWORK_SF_PER_TRIP = 2850;

export const EARTHWORK_SF_PER_TRIP_RANGE = { min: 2700, max: 3000 } as const;

function n(v: unknown, fallback = 0): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : fallback;
}

/**
 * Earthwork Testing & Observations trip rule for moisture-conditioned subgrade
 * with flexible base cap:
 *   suggestedTrips = ceil(buildingSF / divisor)
 * Divisor typical range 2700–3000 SF/trip; default 2850.
 * Example: 100,000 SF / 2850 → 36 trips (~34–37 across the range).
 */
export function suggestEarthworkTrips(
  buildingAreaSf: number,
  earthworkSfPerTrip: number = DEFAULT_EARTHWORK_SF_PER_TRIP
): number {
  const sf = n(buildingAreaSf, 0);
  const divisor = n(earthworkSfPerTrip, DEFAULT_EARTHWORK_SF_PER_TRIP);
  if (sf <= 0 || divisor <= 0) return 0;
  return Math.ceil(sf / divisor);
}

export function earthworkTripRuleLabel(
  buildingAreaSf: number,
  earthworkSfPerTrip: number = DEFAULT_EARTHWORK_SF_PER_TRIP
): string {
  const sf = n(buildingAreaSf, 0);
  const divisor = n(earthworkSfPerTrip, DEFAULT_EARTHWORK_SF_PER_TRIP) || DEFAULT_EARTHWORK_SF_PER_TRIP;
  const trips = suggestEarthworkTrips(sf, divisor);
  if (sf <= 0) {
    return `Rule: 1 trip / ${divisor} SF building (typical 2700–3000). Enter building area to suggest trips.`;
  }
  return `Rule: 1 trip / ${divisor} SF building → ${trips} trips from ${sf.toLocaleString()} SF`;
}

/**
 * Merge takeoff-based earthwork trips into drivers and cascade hours /
 * gauge / vehicle when trips are suggested from building area.
 */
export function applyEarthworkTakeoffToDrivers(
  drivers: Drivers,
  takeoff: ProjectTakeoff | null | undefined
): Drivers {
  const sf = n(takeoff?.buildingAreaSf, 0);
  if (sf <= 0) return { ...drivers };

  const divisor =
    n(takeoff?.earthworkSfPerTrip, 0) > 0
      ? n(takeoff?.earthworkSfPerTrip)
      : DEFAULT_EARTHWORK_SF_PER_TRIP;
  const trips = suggestEarthworkTrips(sf, divisor);
  if (trips <= 0) return { ...drivers };

  const hours = trips * EARTHWORK_HOURS_PER_TRIP;
  const otHours = Math.round(hours * 0.15 * 10) / 10;

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
        : `From takeoff: ceil(${sf} / ${divisor}) = ${trips} trips (typical 2700–3000 SF/trip)`,
  };
}

export function isEarthworkTestingParent(name: string): boolean {
  return name.toLowerCase().includes("earthwork testing");
}

/** Rule-based field line suggestions from drivers. Always editable afterwards. */
export function suggestFieldLines(
  parentName: string,
  drivers: Drivers,
  takeoff?: ProjectTakeoff | null
): SuggestedLine[] {
  let d = drivers;
  if (isEarthworkTestingParent(parentName) && n(takeoff?.buildingAreaSf, 0) > 0) {
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

/** Lab suggestions derived from project parents + drivers. */
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

/** Miss-check prompts when related parents are missing. */
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
}): ProjectTakeoff {
  return {
    buildingAreaSf: project.buildingAreaSf ?? null,
    moistureConditionedSubgrade: project.moistureConditionedSubgrade ?? false,
    flexibleBaseCap: project.flexibleBaseCap ?? false,
    earthworkSfPerTrip: project.earthworkSfPerTrip ?? DEFAULT_EARTHWORK_SF_PER_TRIP,
  };
}
