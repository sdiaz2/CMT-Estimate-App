import { CATALOG } from "./catalog";
import { type ProjectTakeoff } from "./heuristics";
import { applyTakeoffToDrivers } from "./heuristics-ui";
import type { Project } from "./store";
import { emptyTakeoff } from "./store";
import type { ParentState } from "./types";
import { uid } from "./utils";

const SAMPLE_SCOPE = [
  "Project Administration",
  "Earthwork Sample Pickups",
  "Earthwork Testing & Observations",
  "CIP Deep Foundations (Drilled Straight Shaft Piers)",
  "Concrete Testing & Reinforcing Steel Observations",
  "Concrete Sample Pickups",
  "High-Strength Grout Testing & Observations",
  "Structural Steel Inspections",
  "Floor Flatness Testing & Observations",
  "Laboratory Testing",
  "Admin support note (8%)",
];

export const SAMPLE_TAKEOFF: ProjectTakeoff = {
  ...emptyTakeoff(),
  buildingAreaSf: 100000,
  buildingPadSf: 100000,
  limeTreatedPavementSubgrade: true,
  pavementAreaSf: 150000,
  utilityTrenchLf: 800,
  sidewalkLf: 420,
  sidewalksBunchedTogether: false,
  pierCount: 36,
  pierType: "straight_shaft",
  concreteYd3GradeBeamsPierCaps: 400,
  concreteYd3BuildingSlab: 900,
  groutBaseplatesInSpecialInspection: true,
  structureLevelCount: 1,
  slabOnGradePourCount: 2,
};

export function buildSampleProject(): Project {
  const now = Date.now();
  const takeoff = SAMPLE_TAKEOFF;
  const parents: Record<string, ParentState> = {};
  for (const name of SAMPLE_SCOPE) {
    const item = CATALOG.find((c) => c.name === name);
    const base = { ...(item?.defaultDrivers ?? {}) };
    parents[name] = {
      name,
      drivers: applyTakeoffToDrivers(name, base, takeoff),
      tripsLocked: false,
      lines: null,
    };
  }
  return {
    id: uid(),
    name: "Riverside Warehouse",
    location: "Austin, TX",
    docsReceived: "Civil & structural plans dated 8/12/2026, specs Div 31–05, geotech report G-441.",
    notes: "Lime-treated pavement. Grout baseplates in special inspection. 1-story steel building.",
    createdAt: now,
    updatedAt: now,
    scoped: SAMPLE_SCOPE,
    takeoff,
    parents,
    labLines: [],
    labTouched: false,
  };
}
