import {
  hasAnyTakeoffScope,
  showSharedBuildingSf,
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
import { TakeoffSite } from "./takeoff-site";
import { TakeoffStructure } from "./takeoff-structure";

export function TakeoffForm({
  scoped,
  takeoff,
  onChange,
}: {
  scoped: string[];
  takeoff: ProjectTakeoff;
  onChange: (patch: Partial<ProjectTakeoff>) => void;
}) {
  const scope = takeoffScopeFromParentNames(scoped);
  const earth = suggestEarthworkTrips(takeoff);
  const found = suggestFoundationTrips(takeoff);
  const conc = suggestConcreteTrips(takeoff);
  const mas = suggestMasonryTrips(takeoff);
  const grout = suggestGroutTrips(takeoff);
  const steel = suggestStructuralSteelTrips(takeoff);
  const ff = suggestFloorFlatnessTrips(takeoff);
  const pt = suggestPostTensionTrips(takeoff);

  if (!hasAnyTakeoffScope(scope)) {
    return (
      <p className="text-sm text-muted">
        No scoped items use plan quantities. Add earthwork, foundations, concrete,
        masonry, grout, steel, floor flatness, or post-tension on Scope to unlock
        takeoff fields.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {showSharedBuildingSf(scope) || scope.earthwork || scope.foundations ? (
        <TakeoffSite
          scope={scope}
          takeoff={takeoff}
          onChange={onChange}
          earthTrips={earth.total}
          foundTrips={found.trips}
        />
      ) : null}
      <TakeoffStructure
        scope={scope}
        takeoff={takeoff}
        onChange={onChange}
        trips={{
          concrete: conc.total,
          masonry: mas.total,
          grout: grout.trips,
          steel: steel.trips,
          floorFlatness: ff.trips,
          postTension: pt.trips,
        }}
      />
    </div>
  );
}
