import type { Drivers } from "./types";

export type SuggestedLine = {
  description: string;
  quantity: number;
  units: string;
  trips?: number | null;
  isLab: boolean;
  notes?: string;
};

function n(v: unknown, fallback = 0): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : fallback;
}

/** Rule-based field line suggestions from drivers. Always editable afterwards. */
export function suggestFieldLines(
  parentName: string,
  drivers: Drivers
): SuggestedLine[] {
  const trips = n(drivers.trips, 0);
  const hours = n(drivers.hours, 0);
  const otHours = n(drivers.otHours, Math.round(hours * 0.15 * 10) / 10);
  const vehicleTrips = n(drivers.vehicleTrips, trips);
  const gaugeDays = n(drivers.gaugeDays, n(drivers.days, trips > 0 ? trips : 0));
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
    const days = n(drivers.days, 0);
    if (hours > 0 || days > 0) {
      const qty = hours > 0 ? hours : n(drivers.days, 1);
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
