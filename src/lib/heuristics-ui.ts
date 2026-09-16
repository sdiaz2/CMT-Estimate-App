import type { Drivers } from "./types";
import {
  applyConcreteTakeoffToDrivers,
  applyEarthworkTakeoffToDrivers,
  applyFloorFlatnessTakeoffToDrivers,
  applyFoundationTakeoffToDrivers,
  applyGroutTakeoffToDrivers,
  applyMasonryTakeoffToDrivers,
  applyPostTensionTakeoffToDrivers,
  applyStructuralSteelTakeoffToDrivers,
  concreteTripRuleLabel,
  earthworkTripRuleLabel,
  floorFlatnessTripRuleLabel,
  foundationTripRuleLabel,
  groutTripRuleLabel,
  hasConcreteTakeoff,
  hasEarthworkTakeoff,
  hasFloorFlatnessTakeoff,
  hasFoundationTakeoff,
  hasGroutTakeoff,
  hasMasonryTakeoff,
  hasPostTensionTakeoff,
  hasStructuralSteelTakeoff,
  isCipDeepFoundationsParent,
  isConcreteTestingReinforcingParent,
  isEarthworkTestingParent,
  isFloorFlatnessParent,
  isHighStrengthGroutParent,
  isMasonryTestingParent,
  isPostTensionParent,
  isStructuralSteelParent,
  masonryTripRuleLabel,
  postTensionTripRuleLabel,
  structuralSteelTripRuleLabel,
  suggestConcreteTrips,
  suggestEarthworkTrips,
  suggestFloorFlatnessTrips,
  suggestFoundationTrips,
  suggestGroutTrips,
  suggestMasonryTrips,
  suggestPostTensionTrips,
  suggestStructuralSteelTrips,
  type ProjectTakeoff,
} from "./heuristics";

export function applyTakeoffToDrivers(
  parentName: string,
  drivers: Drivers,
  takeoff?: ProjectTakeoff | null
): Drivers {
  if (isEarthworkTestingParent(parentName) && hasEarthworkTakeoff(takeoff)) {
    return applyEarthworkTakeoffToDrivers(drivers, takeoff);
  }
  if (isCipDeepFoundationsParent(parentName) && hasFoundationTakeoff(takeoff)) {
    return applyFoundationTakeoffToDrivers(drivers, takeoff);
  }
  if (isConcreteTestingReinforcingParent(parentName) && hasConcreteTakeoff(takeoff)) {
    return applyConcreteTakeoffToDrivers(drivers, takeoff);
  }
  if (isMasonryTestingParent(parentName) && hasMasonryTakeoff(takeoff)) {
    return applyMasonryTakeoffToDrivers(drivers, takeoff);
  }
  if (isHighStrengthGroutParent(parentName) && hasGroutTakeoff(takeoff)) {
    return applyGroutTakeoffToDrivers(drivers, takeoff);
  }
  if (isStructuralSteelParent(parentName) && hasStructuralSteelTakeoff(takeoff)) {
    return applyStructuralSteelTakeoffToDrivers(drivers, takeoff);
  }
  if (isFloorFlatnessParent(parentName) && hasFloorFlatnessTakeoff(takeoff)) {
    return applyFloorFlatnessTakeoffToDrivers(drivers, takeoff);
  }
  if (isPostTensionParent(parentName) && hasPostTensionTakeoff(takeoff)) {
    return applyPostTensionTakeoffToDrivers(drivers, takeoff);
  }
  return { ...drivers };
}

export function ruleLabelForParent(
  parentName: string,
  takeoff?: ProjectTakeoff | null
): string {
  if (isEarthworkTestingParent(parentName)) return earthworkTripRuleLabel(takeoff);
  if (isCipDeepFoundationsParent(parentName)) return foundationTripRuleLabel(takeoff);
  if (isConcreteTestingReinforcingParent(parentName)) return concreteTripRuleLabel(takeoff);
  if (isMasonryTestingParent(parentName)) return masonryTripRuleLabel(takeoff);
  if (isHighStrengthGroutParent(parentName)) return groutTripRuleLabel(takeoff);
  if (isStructuralSteelParent(parentName)) return structuralSteelTripRuleLabel(takeoff);
  if (isFloorFlatnessParent(parentName)) return floorFlatnessTripRuleLabel(takeoff);
  if (isPostTensionParent(parentName)) return postTensionTripRuleLabel(takeoff);
  return "No automatic trip rule for this parent — edit trips and hours yourself.";
}

export function hasAutoTripRule(parentName: string): boolean {
  return (
    isEarthworkTestingParent(parentName) ||
    isCipDeepFoundationsParent(parentName) ||
    isConcreteTestingReinforcingParent(parentName) ||
    isMasonryTestingParent(parentName) ||
    isHighStrengthGroutParent(parentName) ||
    isStructuralSteelParent(parentName) ||
    isFloorFlatnessParent(parentName) ||
    isPostTensionParent(parentName)
  );
}

export function suggestedTripsForParent(
  parentName: string,
  takeoff?: ProjectTakeoff | null
): number {
  if (isEarthworkTestingParent(parentName)) return suggestEarthworkTrips(takeoff).total;
  if (isCipDeepFoundationsParent(parentName)) return suggestFoundationTrips(takeoff).trips;
  if (isConcreteTestingReinforcingParent(parentName)) return suggestConcreteTrips(takeoff).total;
  if (isMasonryTestingParent(parentName)) return suggestMasonryTrips(takeoff).total;
  if (isHighStrengthGroutParent(parentName)) return suggestGroutTrips(takeoff).trips;
  if (isStructuralSteelParent(parentName)) return suggestStructuralSteelTrips(takeoff).trips;
  if (isFloorFlatnessParent(parentName)) return suggestFloorFlatnessTrips(takeoff).trips;
  if (isPostTensionParent(parentName)) return suggestPostTensionTrips(takeoff).trips;
  return 0;
}

export const HOURS_PER_TRIP = 4;

export function driversFromTrips(trips: number, notes?: string): Drivers {
  const t = Math.max(0, trips);
  const hours = t * HOURS_PER_TRIP;
  return {
    trips: t,
    hours,
    otHours: Math.round(hours * 0.15 * 10) / 10,
    days: t,
    gaugeDays: t,
    vehicleTrips: t,
    notes: notes ?? "",
  };
}
