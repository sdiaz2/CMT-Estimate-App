import type { CatalogItem, Drivers } from "./types";
import {
  isCipDeepFoundationsParent,
  isConcreteTestingReinforcingParent,
  isEarthworkTestingParent,
  isFloorFlatnessParent,
  isHighStrengthGroutParent,
  isMasonryTestingParent,
  isPostTensionParent,
  isStructuralSteelParent,
} from "./heuristics";

export const CATALOG: CatalogItem[] = [
  {
    name: "Project Administration",
    sortOrder: 1,
    category: "admin",
    relatedHints: [],
    defaultDrivers: { hours: 8 },
    blurb: "PM time to run the job. Re-key hours in Pricing Tool.",
  },
  {
    name: "Earthwork Sample Pickups",
    sortOrder: 2,
    category: "field",
    relatedHints: ["Earthwork Testing & Observations", "Laboratory Testing"],
    defaultDrivers: { trips: 6, vehicleTrips: 6, samples: 6 },
    blurb: "Pickup trips for proctor and classification samples.",
  },
  {
    name: "Earthwork Testing & Observations",
    sortOrder: 3,
    category: "field",
    relatedHints: ["Earthwork Sample Pickups", "Laboratory Testing"],
    defaultDrivers: {
      trips: 12,
      hours: 48,
      otHours: 7,
      gaugeDays: 12,
      vehicleTrips: 12,
      days: 12,
    },
    blurb: "Density tests on building pad, pavement, sidewalks, and trench.",
  },
  {
    name: "CIP Deep Foundations (Drilled Straight Shaft Piers)",
    sortOrder: 4,
    category: "field",
    relatedHints: ["Laboratory Testing", "Concrete Sample Pickups"],
    defaultDrivers: { trips: 8, hours: 32, otHours: 4, vehicleTrips: 8, samples: 8 },
    blurb: "Pier observation. Schedule trips override pier-count math.",
  },
  {
    name: "Concrete Testing & Reinforcing Steel Observations",
    sortOrder: 5,
    category: "field",
    relatedHints: ["Concrete Sample Pickups", "Laboratory Testing"],
    defaultDrivers: {
      trips: 15,
      hours: 45,
      otHours: 6,
      vehicleTrips: 15,
      samples: 15,
      cylindersPerSample: 4,
    },
    blurb: "Grade beams, slabs, and pavement pours — A/B/C trip rules.",
  },
  {
    name: "Concrete Sample Pickups",
    sortOrder: 6,
    category: "field",
    relatedHints: ["Concrete Testing & Reinforcing Steel Observations", "Laboratory Testing"],
    defaultDrivers: { trips: 10, vehicleTrips: 10, samples: 10 },
    blurb: "Cylinder pickup after pours.",
  },
  {
    name: "Asphalt Testing",
    sortOrder: 7,
    category: "field",
    relatedHints: ["Laboratory Testing"],
    defaultDrivers: { trips: 5, hours: 20, vehicleTrips: 5 },
    blurb: "Field density on HMAC. No auto trip rule — edit hours.",
  },
  {
    name: "Post-Installed Anchor Observation",
    sortOrder: 8,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 3, hours: 12, vehicleTrips: 3 },
    blurb: "Epoxy / mechanical anchors. Not post-tension.",
  },
  {
    name: "Masonry Testing & Observations",
    sortOrder: 9,
    category: "field",
    relatedHints: ["Masonry Sample Pickups", "Laboratory Testing"],
    defaultDrivers: { trips: 6, hours: 24, vehicleTrips: 6, samples: 6 },
    blurb: "Load-bearing CMU, elevator shafts, enclosures.",
  },
  {
    name: "High-Strength Grout Testing & Observations",
    sortOrder: 10,
    category: "field",
    relatedHints: ["Laboratory Testing"],
    defaultDrivers: { trips: 4, hours: 12, vehicleTrips: 4, samples: 4 },
    blurb: "Only when grout baseplates are in special inspection.",
  },
  {
    name: "Masonry Sample Pickups",
    sortOrder: 11,
    category: "field",
    relatedHints: ["Masonry Testing & Observations", "Laboratory Testing"],
    defaultDrivers: { trips: 4, vehicleTrips: 4, samples: 4 },
    blurb: "Mortar and grout sample pickup.",
  },
  {
    name: "Floor Flatness Testing & Observations",
    sortOrder: 12,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 2, hours: 16, days: 2, vehicleTrips: 2 },
    blurb: "Max of pours vs 30,000 SF rule.",
  },
  {
    name: "Post-Tension Testing & Observations",
    sortOrder: 13,
    category: "field",
    relatedHints: ["Concrete Testing & Reinforcing Steel Observations", "Laboratory Testing"],
    defaultDrivers: { trips: 6, hours: 24, otHours: 3.6, vehicleTrips: 6 },
    blurb: "One parent. Trips = 2 × pours (pre-pour + stressing).",
  },
  {
    name: "Structural Steel Inspections",
    sortOrder: 14,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 6, hours: 24, vehicleTrips: 6 },
    blurb: "Primary steel parent. Per level: SF/20k + final.",
  },
  {
    name: "Structural Steel (Bolting)",
    sortOrder: 15,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 5, hours: 20, vehicleTrips: 5 },
    blurb: "Optional breakout — only if scoped separately.",
  },
  {
    name: "Structural Steel (Welding)",
    sortOrder: 16,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 5, hours: 20, vehicleTrips: 5 },
    blurb: "Optional breakout — only if scoped separately.",
  },
  {
    name: "Structural Steel (NDT)",
    sortOrder: 17,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 3, hours: 12, vehicleTrips: 3 },
    blurb: "Optional breakout — only if scoped separately.",
  },
  {
    name: "Fire-resistant (Penetrations & joints) Testing & Observations",
    sortOrder: 18,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 4, hours: 16, vehicleTrips: 4 },
    blurb: "Firestopping observation. Edit trips by hand.",
  },
  {
    name: "Vapor Emission Testing",
    sortOrder: 19,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 2, hours: 8, vehicleTrips: 2 },
    blurb: "Slab vapor emission. Edit trips by hand.",
  },
  {
    name: "EIFS Observations (Lumpsum)",
    sortOrder: 20,
    category: "field",
    relatedHints: [],
    defaultDrivers: { trips: 1, hours: 0 },
    blurb: "Typically a single lumpsum line.",
  },
  {
    name: "Laboratory Testing",
    sortOrder: 21,
    category: "lab",
    relatedHints: [],
    defaultDrivers: {},
    blurb: "Cylinders, grout, mortar, soils, asphalt — suggested from field.",
  },
  {
    name: "Admin support note (8%)",
    sortOrder: 22,
    category: "admin",
    relatedHints: ["Project Administration"],
    defaultDrivers: { hours: 0 },
    blurb: "Reminder to re-key ~8% of technical fees in Pricing Tool.",
  },
];

export const CATEGORY_LABEL: Record<CatalogItem["category"], string> = {
  admin: "Administration",
  field: "Field",
  lab: "Laboratory",
};

export const SCOPE_PRESETS: { id: string; label: string; hint: string; names: string[] }[] = [
  {
    id: "commercial",
    label: "Commercial building",
    hint: "Earthwork, piers, concrete, steel, lab, admin",
    names: [
      "Project Administration",
      "Earthwork Sample Pickups",
      "Earthwork Testing & Observations",
      "CIP Deep Foundations (Drilled Straight Shaft Piers)",
      "Concrete Testing & Reinforcing Steel Observations",
      "Concrete Sample Pickups",
      "Structural Steel Inspections",
      "Laboratory Testing",
      "Admin support note (8%)",
    ],
  },
  {
    id: "paving",
    label: "Site / paving",
    hint: "Earthwork, pavement concrete, asphalt, lab",
    names: [
      "Project Administration",
      "Earthwork Sample Pickups",
      "Earthwork Testing & Observations",
      "Concrete Testing & Reinforcing Steel Observations",
      "Concrete Sample Pickups",
      "Asphalt Testing",
      "Laboratory Testing",
    ],
  },
  {
    id: "multifamily",
    label: "Multifamily",
    hint: "Adds masonry, PT, floor flatness, grout",
    names: [
      "Project Administration",
      "Earthwork Testing & Observations",
      "Earthwork Sample Pickups",
      "CIP Deep Foundations (Drilled Straight Shaft Piers)",
      "Concrete Testing & Reinforcing Steel Observations",
      "Concrete Sample Pickups",
      "Masonry Testing & Observations",
      "Masonry Sample Pickups",
      "High-Strength Grout Testing & Observations",
      "Floor Flatness Testing & Observations",
      "Post-Tension Testing & Observations",
      "Structural Steel Inspections",
      "Laboratory Testing",
      "Admin support note (8%)",
    ],
  },
];

export function catalogByName(name: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.name === name);
}

export function cloneDrivers(d: Drivers): Drivers {
  return { ...d };
}

export type TakeoffScopeFlags = {
  earthwork: boolean;
  foundations: boolean;
  concrete: boolean;
  masonry: boolean;
  grout: boolean;
  steel: boolean;
  floorFlatness: boolean;
  postTension: boolean;
};

export function takeoffScopeFromParentNames(names: string[]): TakeoffScopeFlags {
  return {
    earthwork: names.some(isEarthworkTestingParent),
    foundations: names.some(isCipDeepFoundationsParent),
    concrete: names.some(isConcreteTestingReinforcingParent),
    masonry: names.some(isMasonryTestingParent),
    grout: names.some(isHighStrengthGroutParent),
    steel: names.some(isStructuralSteelParent),
    floorFlatness: names.some(isFloorFlatnessParent),
    postTension: names.some(isPostTensionParent),
  };
}

export function showSharedBuildingSf(scope: TakeoffScopeFlags): boolean {
  return scope.earthwork || scope.steel || scope.grout || scope.floorFlatness;
}

export function hasAnyTakeoffScope(scope: TakeoffScopeFlags): boolean {
  return Object.values(scope).some(Boolean);
}
