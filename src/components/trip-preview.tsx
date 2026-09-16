import {
  hasAnyTakeoffScope,
  takeoffScopeFromParentNames,
} from "@/lib/catalog";
import {
  suggestConcreteTrips,
  suggestEarthworkTrips,
  suggestFloorFlatnessTrips,
  suggestFoundationTrips,
  suggestGroutTrips,
  suggestMasonryTrips,
  suggestPostTensionTrips,
  suggestStructuralSteelTrips,
  type ProjectTakeoff,
} from "@/lib/heuristics";

export function TripPreview({
  scoped,
  takeoff,
}: {
  scoped: string[];
  takeoff: ProjectTakeoff;
}) {
  const scope = takeoffScopeFromParentNames(scoped);
  const rows: { label: string; trips: number }[] = [];
  if (scope.earthwork) rows.push({ label: "Earthwork", trips: suggestEarthworkTrips(takeoff).total });
  if (scope.foundations) rows.push({ label: "Foundations", trips: suggestFoundationTrips(takeoff).trips });
  if (scope.concrete) rows.push({ label: "Concrete", trips: suggestConcreteTrips(takeoff).total });
  if (scope.masonry) rows.push({ label: "Masonry", trips: suggestMasonryTrips(takeoff).total });
  if (scope.grout) rows.push({ label: "Grout", trips: suggestGroutTrips(takeoff).trips });
  if (scope.steel) rows.push({ label: "Steel", trips: suggestStructuralSteelTrips(takeoff).trips });
  if (scope.floorFlatness) rows.push({ label: "Floor flatness", trips: suggestFloorFlatnessTrips(takeoff).trips });
  if (scope.postTension) rows.push({ label: "Post-tension", trips: suggestPostTensionTrips(takeoff).trips });
  const total = rows.reduce((s, r) => s + r.trips, 0);
  if (!hasAnyTakeoffScope(scope) && rows.length === 0) return null;

  return (
    <aside className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
        Suggested trips
      </p>
      <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-fg">
        {total}
      </p>
      <p className="text-sm text-muted">from takeoff rules · 4 hours each</p>
      <p className="text-sm text-muted">from takeoff rules · 4 hours each</p>
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="flex justify-between text-sm">
            <span className="text-muted">{r.label}</span>
            <span className="font-medium tabular-nums text-fg">{r.trips}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-subtle">
        Applied on the Trips step. You can override any parent.
      </p>
    </aside>
  );
}
