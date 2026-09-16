import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CATALOG, catalogByName, cloneDrivers } from "./catalog";
import {
  missCheckPrompts,
  suggestFieldLines,
  suggestLabLines,
  type ProjectTakeoff,
  type SuggestedLine,
} from "./heuristics";
import { applyTakeoffToDrivers } from "./heuristics-ui";
import type { Drivers, LineItem, ParentState } from "./types";
import { uid } from "./utils";

export type Project = {
  id: string;
  name: string;
  location: string;
  docsReceived: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
  scoped: string[];
  takeoff: ProjectTakeoff;
  parents: Record<string, ParentState>;
  labLines: LineItem[];
  labTouched: boolean;
};

type EstimateState = {
  projects: Record<string, Project>;
  order: string[];
  createProject: (input: {
    name: string;
    location?: string;
    docsReceived?: string;
    notes?: string;
  }) => string;
  importProject: (project: Project) => string;
  duplicateProject: (id: string) => string | null;
  deleteProject: (id: string) => void;
  patchProject: (
    id: string,
    patch: Partial<Pick<Project, "name" | "location" | "docsReceived" | "notes">>
  ) => void;
  setScoped: (id: string, names: string[]) => void;
  toggleScope: (id: string, name: string) => void;
  applyPreset: (id: string, names: string[]) => void;
  patchTakeoff: (id: string, patch: Partial<ProjectTakeoff>) => void;
  setDrivers: (id: string, parentName: string, drivers: Drivers, lock?: boolean) => void;
  unlockAndApply: (id: string, parentName?: string) => void;
  setParentLines: (id: string, parentName: string, lines: LineItem[] | null) => void;
  setLabLines: (id: string, lines: LineItem[]) => void;
  resetLab: (id: string) => void;
};

export const emptyTakeoff = (): ProjectTakeoff => ({
  limeTreatedPavementSubgrade: false,
  sidewalksBunchedTogether: false,
  moistureConditionedSubgrade: false,
  flexibleBaseCap: false,
  groutBaseplatesInSpecialInspection: false,
  pierType: "straight_shaft",
  structureLevelCount: 1,
});

function touch(p: Project): Project {
  return { ...p, updatedAt: Date.now() };
}

function makeParent(name: string, takeoff: ProjectTakeoff): ParentState {
  const item = catalogByName(name);
  const base = cloneDrivers(item?.defaultDrivers ?? {});
  return {
    name,
    drivers: applyTakeoffToDrivers(name, base, takeoff),
    tripsLocked: false,
    lines: null,
  };
}

function reapplyUnlocked(p: Project): Project {
  const parents = { ...p.parents };
  for (const name of p.scoped) {
    const cur = parents[name];
    if (!cur || cur.tripsLocked) continue;
    const item = catalogByName(name);
    const base = cloneDrivers(item?.defaultDrivers ?? cur.drivers);
    parents[name] = {
      ...cur,
      drivers: applyTakeoffToDrivers(name, base, p.takeoff),
      lines: cur.lines,
    };
  }
  return { ...p, parents };
}

function suggestedLab(p: Project): LineItem[] {
  const input = p.scoped
    .filter((n) => catalogByName(n)?.category !== "lab")
    .map((n) => ({
      name: n,
      drivers: p.parents[n]?.drivers ?? {},
    }));
  return suggestLabLines(input).map((s, i) => toLine(s, `lab:${s.description}:${i}`));
}

function toLine(s: SuggestedLine, key?: string): LineItem {
  return {
    id: key ?? uid(),
    description: s.description,
    quantity: s.quantity,
    units: s.units,
    trips: s.trips ?? null,
    isLab: s.isLab,
    notes: s.notes ?? "",
  };
}

export function fieldLinesFor(p: Project, parentName: string): LineItem[] {
  const parent = p.parents[parentName];
  if (!parent) return [];
  if (parent.lines) return parent.lines;
  return suggestFieldLines(parentName, parent.drivers, p.takeoff).map((s, i) =>
    toLine(s, `${parentName}:${s.description}:${i}`)
  );
}

export function labLinesFor(p: Project): LineItem[] {
  if (p.labTouched) return p.labLines;
  return suggestedLab(p);
}

export type WorksheetRow = LineItem & { parent: string };

export function worksheetRows(p: Project): WorksheetRow[] {
  const rows: WorksheetRow[] = [];
  for (const name of p.scoped) {
    const cat = catalogByName(name);
    if (cat?.category === "lab") continue;
    for (const line of fieldLinesFor(p, name)) {
      if (line.quantity <= 0 && !line.notes) continue;
      rows.push({ ...line, parent: name });
    }
  }
  const labScoped = p.scoped.includes("Laboratory Testing");
  const lab = labLinesFor(p);
  if (labScoped || lab.length > 0) {
    for (const line of lab) {
      if (line.quantity <= 0 && !line.notes) continue;
      rows.push({ ...line, parent: "Laboratory Testing" });
    }
  }
  return rows;
}

export function missChecks(p: Project) {
  return missCheckPrompts(
    p.scoped,
    CATALOG.map((c) => ({ name: c.name, relatedHints: c.relatedHints })),
    p.takeoff
  );
}

export type StepKey =
  | "setup"
  | "scope"
  | "takeoffs"
  | "trips"
  | "lab"
  | "worksheet";

export const STEPS: { key: StepKey; label: string; short: string; path: string }[] = [
  { key: "setup", label: "Setup", short: "Name the job", path: "" },
  { key: "scope", label: "Scope", short: "Pick the work", path: "/scope" },
  { key: "takeoffs", label: "Takeoffs", short: "Plan quantities", path: "/takeoffs" },
  { key: "trips", label: "Trips", short: "Trips and hours", path: "/trips" },
  { key: "lab", label: "Lab", short: "Lab tests", path: "/lab" },
  { key: "worksheet", label: "Worksheet", short: "Ready to re-key", path: "/worksheet" },
];

export function stepHref(id: string, key: StepKey): string {
  const step = STEPS.find((s) => s.key === key);
  return `/projects/${id}${step?.path ?? ""}`;
}

export function projectProgress(p: Project): { done: StepKey[]; percent: number } {
  const done: StepKey[] = [];
  if (p.name.trim()) done.push("setup");
  if (p.scoped.length > 0) done.push("scope");
  const takeoffFilled = Object.entries(p.takeoff).some(([, v]) => {
    if (typeof v === "number") return v > 0;
    return false;
  });
  if (takeoffFilled || p.scoped.length > 0) done.push("takeoffs");
  const hasTrips = p.scoped.some((n) => {
    const d = p.parents[n]?.drivers;
    return (d?.trips ?? 0) > 0 || (d?.hours ?? 0) > 0;
  });
  if (hasTrips) done.push("trips");
  if (labLinesFor(p).length > 0 || p.scoped.includes("Laboratory Testing")) done.push("lab");
  if (worksheetRows(p).length > 0) done.push("worksheet");
  const unique = STEPS.filter((s) => done.includes(s.key)).map((s) => s.key);
  return { done: unique, percent: Math.round((unique.length / STEPS.length) * 100) };
}

export const useEstimateStore = create<EstimateState>()(
  persist(
    (set, get) => ({
      projects: {},
      order: [],
      createProject: (input) => {
        const id = uid();
        const now = Date.now();
        const project: Project = {
          id,
          name: input.name.trim() || "Untitled estimate",
          location: input.location?.trim() ?? "",
          docsReceived: input.docsReceived?.trim() ?? "",
          notes: input.notes?.trim() ?? "",
          createdAt: now,
          updatedAt: now,
          scoped: [],
          takeoff: emptyTakeoff(),
          parents: {},
          labLines: [],
          labTouched: false,
        };
        set((s) => ({
          projects: { ...s.projects, [id]: project },
          order: [id, ...s.order],
        }));
        return id;
      },
      importProject: (project) => {
        const id = project.id || uid();
        const next: Project = { ...project, id, updatedAt: Date.now() };
        set((s) => ({
          projects: { ...s.projects, [id]: next },
          order: [id, ...s.order.filter((x) => x !== id)],
        }));
        return id;
      },
      duplicateProject: (id) => {
        const src = get().projects[id];
        if (!src) return null;
        const nid = uid();
        const copy: Project = {
          ...structuredClone(src),
          id: nid,
          name: `${src.name} (copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({
          projects: { ...s.projects, [nid]: copy },
          order: [nid, ...s.order],
        }));
        return nid;
      },
      deleteProject: (id) => {
        set((s) => {
          const projects = { ...s.projects };
          delete projects[id];
          return { projects, order: s.order.filter((x) => x !== id) };
        });
      },
      patchProject: (id, patch) => {
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          return { projects: { ...s.projects, [id]: touch({ ...p, ...patch }) } };
        });
      },
      setScoped: (id, names) => {
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          const parents: Record<string, ParentState> = {};
          for (const name of names) {
            parents[name] = p.parents[name] ?? makeParent(name, p.takeoff);
          }
          let next: Project = touch({ ...p, scoped: names, parents });
          if (!next.labTouched) next = { ...next, labLines: suggestedLab(next) };
          return { projects: { ...s.projects, [id]: next } };
        });
      },
      toggleScope: (id, name) => {
        const p = get().projects[id];
        if (!p) return;
        const on = p.scoped.includes(name);
        const names = on ? p.scoped.filter((n) => n !== name) : [...p.scoped, name];
        get().setScoped(id, names);
      },
      applyPreset: (id, names) => {
        const p = get().projects[id];
        if (!p) return;
        const merged = Array.from(new Set([...p.scoped, ...names]));
        get().setScoped(id, merged);
      },
      patchTakeoff: (id, patch) => {
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          let next = reapplyUnlocked(
            touch({ ...p, takeoff: { ...p.takeoff, ...patch } })
          );
          if (!next.labTouched) next = { ...next, labLines: suggestedLab(next) };
          return { projects: { ...s.projects, [id]: next } };
        });
      },
      setDrivers: (id, parentName, drivers, lock = true) => {
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          const cur = p.parents[parentName] ?? makeParent(parentName, p.takeoff);
          let next: Project = touch({
            ...p,
            parents: {
              ...p.parents,
              [parentName]: { ...cur, drivers, tripsLocked: lock, lines: null },
            },
          });
          if (!next.labTouched) next = { ...next, labLines: suggestedLab(next) };
          return { projects: { ...s.projects, [id]: next } };
        });
      },
      unlockAndApply: (id, parentName) => {
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          const parents = { ...p.parents };
          const names = parentName ? [parentName] : p.scoped;
          for (const name of names) {
            const cur = parents[name];
            if (!cur) continue;
            const item = catalogByName(name);
            const base = cloneDrivers(item?.defaultDrivers ?? {});
            parents[name] = {
              ...cur,
              tripsLocked: false,
              lines: null,
              drivers: applyTakeoffToDrivers(name, base, p.takeoff),
            };
          }
          let next: Project = touch({ ...p, parents });
          if (!next.labTouched) next = { ...next, labLines: suggestedLab(next) };
          return { projects: { ...s.projects, [id]: next } };
        });
      },
      setParentLines: (id, parentName, lines) => {
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          const cur = p.parents[parentName];
          if (!cur) return s;
          return {
            projects: {
              ...s.projects,
              [id]: touch({
                ...p,
                parents: { ...p.parents, [parentName]: { ...cur, lines } },
              }),
            },
          };
        });
      },
      setLabLines: (id, lines) => {
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          return {
            projects: {
              ...s.projects,
              [id]: touch({ ...p, labLines: lines, labTouched: true }),
            },
          };
        });
      },
      resetLab: (id) => {
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          const next = { ...p, labTouched: false };
          return {
            projects: {
              ...s.projects,
              [id]: touch({ ...next, labLines: suggestedLab(next) }),
            },
          };
        });
      },
    }),
    {
      name: "cmt-estimate-v1",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (s) => ({ projects: s.projects, order: s.order }),
    }
  )
);

export function useProject(id: string | undefined): Project | undefined {
  return useEstimateStore((s) => (id ? s.projects[id] : undefined));
}
