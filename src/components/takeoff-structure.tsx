import type { TakeoffScopeFlags } from "@/lib/catalog";
import {
  DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS,
  DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES,
  DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT,
  DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING,
  DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP,
  DEFAULT_YD3_PER_TRIP_BUILDING_SLAB,
  DEFAULT_YD3_PER_TRIP_GRADE_BEAMS,
  DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT,
  DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT,
  type ProjectTakeoff,
} from "@/lib/heuristics";
import { Num, Section, Toggle } from "./takeoff-fields";

export function TakeoffStructure({
  scope,
  takeoff,
  onChange,
  trips,
}: {
  scope: TakeoffScopeFlags;
  takeoff: ProjectTakeoff;
  onChange: (patch: Partial<ProjectTakeoff>) => void;
  trips: {
    concrete: number;
    masonry: number;
    grout: number;
    steel: number;
    floorFlatness: number;
    postTension: number;
  };
}) {
  return (
    <>
      {scope.concrete ? (
        <Section title="Concrete" trips={trips.concrete}>
          <Num
            label="Grade beams / pier caps"
            suffix="yd\u00b3"
            value={takeoff.concreteYd3GradeBeamsPierCaps}
            onChange={(concreteYd3GradeBeamsPierCaps) =>
              onChange({ concreteYd3GradeBeamsPierCaps })
            }
            hint={`Rule A: max(2, ceil(yd\u00b3 / ${takeoff.yd3PerTripGradeBeams ?? DEFAULT_YD3_PER_TRIP_GRADE_BEAMS})).`}
          />
          <Num
            label="Building slab"
            suffix="yd\u00b3"
            value={takeoff.concreteYd3BuildingSlab}
            onChange={(concreteYd3BuildingSlab) => onChange({ concreteYd3BuildingSlab })}
            hint={`Rule B: max(2, ceil(yd\u00b3 / ${takeoff.yd3PerTripBuildingSlab ?? DEFAULT_YD3_PER_TRIP_BUILDING_SLAB})).`}
          />
          <Num
            label="Private pavement"
            suffix="yd\u00b3"
            value={takeoff.concreteYd3PrivatePavement}
            onChange={(concreteYd3PrivatePavement) =>
              onChange({ concreteYd3PrivatePavement })
            }
            hint={`Rule C: ceil(yd\u00b3 / ${takeoff.yd3PerTripPrivatePavement ?? DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT}). No min-2.`}
          />
          <Num
            label="Public pavement"
            suffix="yd\u00b3"
            value={takeoff.concreteYd3PublicPavement}
            onChange={(concreteYd3PublicPavement) =>
              onChange({ concreteYd3PublicPavement })
            }
            hint={`Public: ceil(yd\u00b3 / ${takeoff.yd3PerTripPublicPavement ?? DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT}).`}
          />
        </Section>
      ) : null}

      {scope.masonry ? (
        <Section title="Masonry" trips={trips.masonry}>
          <Num
            label="Load-bearing CMU"
            suffix="SF"
            value={takeoff.masonryLoadBearingCmuSf}
            onChange={(masonryLoadBearingCmuSf) => onChange({ masonryLoadBearingCmuSf })}
            hint={`1 trip / ${takeoff.masonrySfPerTripLoadBearingCmu ?? DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING} SF.`}
          />
          <Num
            label="Buildings with elevator"
            value={takeoff.masonryElevatorBuildingCount}
            onChange={(masonryElevatorBuildingCount) =>
              onChange({ masonryElevatorBuildingCount })
            }
          />
          <Num
            label="Elevator shaft height"
            suffix="ft"
            value={takeoff.masonryElevatorShaftHeightFt}
            onChange={(masonryElevatorShaftHeightFt) =>
              onChange({ masonryElevatorShaftHeightFt })
            }
            hint={`${takeoff.masonryFtPerTripElevatorShaft ?? DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT} ft per trip, \u00d7 buildings.`}
          />
          <Num
            label="CMU enclosures"
            value={takeoff.masonryCmuEnclosureCount}
            onChange={(masonryCmuEnclosureCount) =>
              onChange({ masonryCmuEnclosureCount })
            }
            hint="Dumpster / equipment \u2014 1 trip each."
          />
        </Section>
      ) : null}

      {scope.grout ? (
        <Section title="High-strength grout" trips={trips.grout}>
          <div className="sm:col-span-2">
            <Toggle
              label="Grout baseplates in special inspection"
              checked={!!takeoff.groutBaseplatesInSpecialInspection}
              onChange={(groutBaseplatesInSpecialInspection) =>
                onChange({ groutBaseplatesInSpecialInspection })
              }
              hint={`Trips only when this is on: 1 / ${takeoff.ft2PerTripGroutBaseplates ?? DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES} ft\u00b2 pad.`}
            />
          </div>
        </Section>
      ) : null}

      {scope.steel ? (
        <Section title="Structural steel" trips={trips.steel}>
          <Num
            label="Steel building area (if different)"
            suffix="SF"
            value={takeoff.structuralSteelBuildingSf}
            onChange={(structuralSteelBuildingSf) =>
              onChange({ structuralSteelBuildingSf })
            }
            hint="Falls back to building area."
          />
          <Num
            label="Structure levels"
            value={takeoff.structureLevelCount ?? 1}
            onChange={(structureLevelCount) => onChange({ structureLevelCount })}
          />
          <Num
            label="SF per steel trip"
            value={takeoff.structuralSteelSfPerTrip ?? DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP}
            onChange={(structuralSteelSfPerTrip) =>
              onChange({ structuralSteelSfPerTrip })
            }
            hint="Per level: ceil(SF / this) + 1 final."
          />
          <Num
            label="Final inspection trips / level"
            value={takeoff.structuralSteelFinalInspectionTrips ?? 1}
            onChange={(structuralSteelFinalInspectionTrips) =>
              onChange({ structuralSteelFinalInspectionTrips })
            }
          />
        </Section>
      ) : null}

      {scope.floorFlatness ? (
        <Section title="Floor flatness" trips={trips.floorFlatness}>
          <Num
            label="Slab-on-grade pours"
            value={takeoff.slabOnGradePourCount}
            onChange={(slabOnGradePourCount) => onChange({ slabOnGradePourCount })}
            hint="Suggested = max(pours, SF / 30,000)."
          />
          <Num
            label="Floor flatness area (if different)"
            suffix="SF"
            value={takeoff.floorFlatnessSf}
            onChange={(floorFlatnessSf) => onChange({ floorFlatnessSf })}
            hint={`Falls back to building area. Default ${DEFAULT_FT2_PER_TRIP_FLOOR_FLATNESS.toLocaleString()} SF/trip.`}
          />
        </Section>
      ) : null}

      {scope.postTension ? (
        <Section title="Post-tension" trips={trips.postTension}>
          <Num
            label="PT slab pours"
            value={takeoff.postTensionSlabPourCount}
            onChange={(postTensionSlabPourCount) =>
              onChange({ postTensionSlabPourCount })
            }
            hint="Falls back to slab-on-grade pours. Trips = 2 \u00d7 pours."
          />
          {!scope.floorFlatness ? (
            <Num
              label="Slab-on-grade pours (fallback)"
              value={takeoff.slabOnGradePourCount}
              onChange={(slabOnGradePourCount) => onChange({ slabOnGradePourCount })}
            />
          ) : null}
        </Section>
      ) : null}
    </>
  );
}
