import { showSharedBuildingSf, type TakeoffScopeFlags } from "@/lib/catalog";
import {
  DEFAULT_EARTHWORK_SF_PER_TRIP,
  DEFAULT_PAVEMENT_LF_PER_TRIP,
  DEFAULT_PAVEMENT_SF_PER_TRIP,
  DEFAULT_PIERS_PER_TRIP_BELLED,
  DEFAULT_PIERS_PER_TRIP_CASED,
  DEFAULT_PIERS_PER_TRIP_STRAIGHT,
  DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP,
  DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP,
  DEFAULT_UTILITY_TRENCH_LF_PER_TRIP,
  type ProjectTakeoff,
} from "@/lib/heuristics";
import { Num, Section, Toggle } from "./takeoff-fields";

export function TakeoffSite({
  scope,
  takeoff,
  onChange,
  earthTrips,
  foundTrips,
}: {
  scope: TakeoffScopeFlags;
  takeoff: ProjectTakeoff;
  onChange: (patch: Partial<ProjectTakeoff>) => void;
  earthTrips: number;
  foundTrips: number;
}) {
  return (
    <>
      {showSharedBuildingSf(scope) ? (
      <Section title="Building / pad (shared)">
        <Num
          label="Building area"
          suffix="SF"
          value={takeoff.buildingAreaSf}
          onChange={(buildingAreaSf) => onChange({ buildingAreaSf })}
          hint="Feeds earthwork, steel, grout, and floor-flatness fallback."
        />
        {scope.grout ? (
          <Num
            label="Building pad (if different)"
            suffix="SF"
            value={takeoff.buildingPadSf}
            onChange={(buildingPadSf) => onChange({ buildingPadSf })}
            hint="Grout uses pad SF, else building area."
          />
        ) : null}
      </Section>
      ) : null}

      {scope.earthwork ? (
        <Section title="Earthwork" trips={earthTrips}>
          <Num
            label="SF per earthwork trip"
            value={takeoff.earthworkSfPerTrip ?? DEFAULT_EARTHWORK_SF_PER_TRIP}
            onChange={(earthworkSfPerTrip) => onChange({ earthworkSfPerTrip })}
            hint="Typical 2,700–3,000. Default 2,850."
          />
          <Toggle
            label="Lime-treated pavement subgrade"
            checked={!!takeoff.limeTreatedPavementSubgrade}
            onChange={(limeTreatedPavementSubgrade) =>
              onChange({ limeTreatedPavementSubgrade })
            }
            hint="On = pavement SF rule. Off = subgrade LF rule."
          />
          {takeoff.limeTreatedPavementSubgrade ? (
            <>
              <Num
                label="Pavement area"
                suffix="SF"
                value={takeoff.pavementAreaSf}
                onChange={(pavementAreaSf) => onChange({ pavementAreaSf })}
              />
              <Num
                label="SF per pavement trip"
                value={takeoff.pavementSfPerTrip ?? DEFAULT_PAVEMENT_SF_PER_TRIP}
                onChange={(pavementSfPerTrip) => onChange({ pavementSfPerTrip })}
                hint="Typical 25,000–30,000."
              />
            </>
          ) : (
            <>
              <Num
                label="Pavement subgrade"
                suffix="LF"
                value={takeoff.pavementSubgradeLf}
                onChange={(pavementSubgradeLf) => onChange({ pavementSubgradeLf })}
              />
              <Num
                label="LF per pavement trip"
                value={takeoff.pavementLfPerTrip ?? DEFAULT_PAVEMENT_LF_PER_TRIP}
                onChange={(pavementLfPerTrip) => onChange({ pavementLfPerTrip })}
                hint="Typical 200–400."
              />
            </>
          )}
          <Num
            label="Sidewalks"
            suffix="LF"
            value={takeoff.sidewalkLf}
            onChange={(sidewalkLf) => onChange({ sidewalkLf })}
          />
          <Toggle
            label="Sidewalks bunched together"
            checked={!!takeoff.sidewalksBunchedTogether}
            onChange={(sidewalksBunchedTogether) =>
              onChange({ sidewalksBunchedTogether })
            }
            hint={`Spread ${DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP} LF/trip. Bunched ${DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP} LF/trip.`}
          />
          <Num
            label="Utility trench backfill"
            suffix="LF"
            value={takeoff.utilityTrenchLf}
            onChange={(utilityTrenchLf) => onChange({ utilityTrenchLf })}
            hint={`Default ${DEFAULT_UTILITY_TRENCH_LF_PER_TRIP} LF/trip (150–175).`}
          />
          <Num
            label="LF per trench trip"
            value={takeoff.utilityTrenchLfPerTrip ?? DEFAULT_UTILITY_TRENCH_LF_PER_TRIP}
            onChange={(utilityTrenchLfPerTrip) => onChange({ utilityTrenchLfPerTrip })}
          />
        </Section>
      ) : null}

      {scope.foundations ? (
        <Section title="Foundations" trips={foundTrips}>
          <Num
            label="Schedule trips (overrides piers)"
            value={takeoff.foundationScheduleTrips}
            onChange={(foundationScheduleTrips) => onChange({ foundationScheduleTrips })}
            hint="If the construction schedule lists pier days, use that."
          />
          <Num
            label="Pier count"
            value={takeoff.pierCount}
            onChange={(pierCount) => onChange({ pierCount })}
          />
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-muted">Pier type</span>
            <select
              className="mt-1.5 h-11 w-full rounded-full border border-border-strong bg-surface px-4 text-sm"
              value={takeoff.pierType ?? "straight_shaft"}
              onChange={(e) => onChange({ pierType: e.target.value })}
            >
              <option value="straight_shaft">Straight shaft (~9–12 / trip, default 10.5)</option>
              <option value="cased">Cased (~4–6 / trip, default 5)</option>
              <option value="belled">Belled / underreamed (~5–9 / trip, default 7)</option>
            </select>
          </label>
          <Num
            label="Straight piers / trip"
            value={takeoff.piersPerTripStraight ?? DEFAULT_PIERS_PER_TRIP_STRAIGHT}
            onChange={(piersPerTripStraight) => onChange({ piersPerTripStraight })}
          />
          <Num
            label="Cased piers / trip"
            value={takeoff.piersPerTripCased ?? DEFAULT_PIERS_PER_TRIP_CASED}
            onChange={(piersPerTripCased) => onChange({ piersPerTripCased })}
          />
          <Num
            label="Belled piers / trip"
            value={takeoff.piersPerTripBelled ?? DEFAULT_PIERS_PER_TRIP_BELLED}
            onChange={(piersPerTripBelled) => onChange({ piersPerTripBelled })}
          />
        </Section>
      ) : null}
    </>
  );
}
