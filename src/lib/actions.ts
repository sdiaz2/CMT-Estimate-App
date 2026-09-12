"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import {
  applyConcreteTakeoffToDrivers,
  applyEarthworkTakeoffToDrivers,
  applyFoundationTakeoffToDrivers,
  applyGroutTakeoffToDrivers,
  applyMasonryTakeoffToDrivers,
  applyStructuralSteelTakeoffToDrivers,
  DEFAULT_EARTHWORK_SF_PER_TRIP,
  DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES,
  DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS,
  DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP,
  DEFAULT_STRUCTURE_LEVEL_COUNT,
  DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT,
  DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING,
  DEFAULT_PAVEMENT_LF_PER_TRIP,
  DEFAULT_PAVEMENT_SF_PER_TRIP,
  DEFAULT_PIERS_PER_TRIP_BELLED,
  DEFAULT_PIERS_PER_TRIP_CASED,
  DEFAULT_PIERS_PER_TRIP_STRAIGHT,
  DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP,
  DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP,
  DEFAULT_UTILITY_TRENCH_LF_PER_TRIP,
  DEFAULT_YD3_PER_TRIP_GRADE_BEAMS,
  DEFAULT_YD3_PER_TRIP_BUILDING_SLAB,
  DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT,
  DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT,
  hasConcreteTakeoff,
  hasEarthworkTakeoff,
  hasFoundationTakeoff,
  hasGroutTakeoff,
  hasMasonryTakeoff,
  hasStructuralSteelTakeoff,
  isCipDeepFoundationsParent,
  isConcreteTestingReinforcingParent,
  isEarthworkTestingParent,
  isHighStrengthGroutParent,
  isMasonryTestingParent,
  isStructuralSteelParent,
  missCheckPrompts,
  normalizePierType,
  parseDrivers,
  parseHints,
  suggestFieldLines,
  suggestLabLines,
  takeoffFromProject,
} from "./heuristics";

function parseOptionalFloat(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === "") return null;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
}

function parseCheckbox(formData: FormData, key: string): boolean {
  const v = formData.get(key);
  return v === "true" || v === "on" || v === "1";
}

function takeoffDataFromForm(formData: FormData) {
  const buildingAreaSf = parseOptionalFloat(formData, "buildingAreaSf");
  const earthworkSfPerTripRaw = parseOptionalFloat(formData, "earthworkSfPerTrip");
  const pavementAreaSf = parseOptionalFloat(formData, "pavementAreaSf");
  const pavementSfPerTripRaw = parseOptionalFloat(formData, "pavementSfPerTrip");
  const pavementSubgradeLf = parseOptionalFloat(formData, "pavementSubgradeLf");
  const pavementLfPerTripRaw = parseOptionalFloat(formData, "pavementLfPerTrip");
  const sidewalkLf = parseOptionalFloat(formData, "sidewalkLf");
  const sidewalkSpreadRaw = parseOptionalFloat(formData, "sidewalkSpreadLfPerTrip");
  const sidewalkBunchedRaw = parseOptionalFloat(formData, "sidewalkBunchedLfPerTrip");
  const utilityTrenchLf = parseOptionalFloat(formData, "utilityTrenchLf");
  const utilityTrenchLfPerTripRaw = parseOptionalFloat(
    formData,
    "utilityTrenchLfPerTrip"
  );
  const foundationScheduleTripsRaw = parseOptionalFloat(
    formData,
    "foundationScheduleTrips"
  );
  const pierCountRaw = parseOptionalFloat(formData, "pierCount");
  const piersStraightRaw = parseOptionalFloat(formData, "piersPerTripStraight");
  const piersCasedRaw = parseOptionalFloat(formData, "piersPerTripCased");
  const piersBelledRaw = parseOptionalFloat(formData, "piersPerTripBelled");
  const concreteYd3GradeBeamsPierCaps = parseOptionalFloat(
    formData,
    "concreteYd3GradeBeamsPierCaps"
  );
  const yd3PerTripGradeBeamsRaw = parseOptionalFloat(
    formData,
    "yd3PerTripGradeBeams"
  );
  const concreteYd3BuildingSlab = parseOptionalFloat(
    formData,
    "concreteYd3BuildingSlab"
  );
  const yd3PerTripBuildingSlabRaw = parseOptionalFloat(
    formData,
    "yd3PerTripBuildingSlab"
  );
  const concreteYd3PrivatePavement = parseOptionalFloat(
    formData,
    "concreteYd3PrivatePavement"
  );
  const yd3PerTripPrivatePavementRaw = parseOptionalFloat(
    formData,
    "yd3PerTripPrivatePavement"
  );
  const concreteYd3PublicPavement = parseOptionalFloat(
    formData,
    "concreteYd3PublicPavement"
  );
  const yd3PerTripPublicPavementRaw = parseOptionalFloat(
    formData,
    "yd3PerTripPublicPavement"
  );
  const masonryLoadBearingCmuSf = parseOptionalFloat(
    formData,
    "masonryLoadBearingCmuSf"
  );
  const masonrySfPerTripLoadBearingCmuRaw = parseOptionalFloat(
    formData,
    "masonrySfPerTripLoadBearingCmu"
  );
  const masonryElevatorBuildingCountRaw = parseOptionalFloat(
    formData,
    "masonryElevatorBuildingCount"
  );
  const masonryElevatorShaftHeightFt = parseOptionalFloat(
    formData,
    "masonryElevatorShaftHeightFt"
  );
  const masonryFtPerTripElevatorShaftRaw = parseOptionalFloat(
    formData,
    "masonryFtPerTripElevatorShaft"
  );
  const masonryCmuEnclosureCountRaw = parseOptionalFloat(
    formData,
    "masonryCmuEnclosureCount"
  );
  const buildingPadSf = parseOptionalFloat(formData, "buildingPadSf");
  const ft2PerTripGroutBaseplatesRaw = parseOptionalFloat(
    formData,
    "ft2PerTripGroutBaseplates"
  );
  const structuralSteelBuildingSf = parseOptionalFloat(
    formData,
    "structuralSteelBuildingSf"
  );
  const structuralSteelSfPerTripRaw = parseOptionalFloat(
    formData,
    "structuralSteelSfPerTrip"
  );
  const structuralSteelFinalInspectionTripsRaw = parseOptionalFloat(
    formData,
    "structuralSteelFinalInspectionTrips"
  );
  const structureLevelCountRaw = parseOptionalFloat(
    formData,
    "structureLevelCount"
  );
  return {
    buildingAreaSf,
    moistureConditionedSubgrade: parseCheckbox(formData, "moistureConditionedSubgrade"),
    flexibleBaseCap: parseCheckbox(formData, "flexibleBaseCap"),
    earthworkSfPerTrip:
      earthworkSfPerTripRaw !== null && earthworkSfPerTripRaw > 0
        ? earthworkSfPerTripRaw
        : DEFAULT_EARTHWORK_SF_PER_TRIP,
    moistureDepthNote: String(formData.get("moistureDepthNote") || "").trim(),
    flexibleBaseThicknessNote: String(
      formData.get("flexibleBaseThicknessNote") || ""
    ).trim(),
    pavementAreaSf,
    limeTreatedPavementSubgrade: parseCheckbox(
      formData,
      "limeTreatedPavementSubgrade"
    ),
    pavementSfPerTrip:
      pavementSfPerTripRaw !== null && pavementSfPerTripRaw > 0
        ? pavementSfPerTripRaw
        : DEFAULT_PAVEMENT_SF_PER_TRIP,
    pavementSubgradeLf,
    pavementLfPerTrip:
      pavementLfPerTripRaw !== null && pavementLfPerTripRaw > 0
        ? pavementLfPerTripRaw
        : DEFAULT_PAVEMENT_LF_PER_TRIP,
    pavementNotes: String(formData.get("pavementNotes") || "").trim(),
    sidewalkLf,
    sidewalksBunchedTogether: parseCheckbox(formData, "sidewalksBunchedTogether"),
    sidewalkSpreadLfPerTrip:
      sidewalkSpreadRaw !== null && sidewalkSpreadRaw > 0
        ? sidewalkSpreadRaw
        : DEFAULT_SIDEWALK_SPREAD_LF_PER_TRIP,
    sidewalkBunchedLfPerTrip:
      sidewalkBunchedRaw !== null && sidewalkBunchedRaw > 0
        ? sidewalkBunchedRaw
        : DEFAULT_SIDEWALK_BUNCHED_LF_PER_TRIP,
    utilityTrenchLf,
    utilityTrenchLfPerTrip:
      utilityTrenchLfPerTripRaw !== null && utilityTrenchLfPerTripRaw > 0
        ? utilityTrenchLfPerTripRaw
        : DEFAULT_UTILITY_TRENCH_LF_PER_TRIP,
    foundationScheduleTrips:
      foundationScheduleTripsRaw !== null && foundationScheduleTripsRaw > 0
        ? Math.floor(foundationScheduleTripsRaw)
        : null,
    pierCount:
      pierCountRaw !== null && pierCountRaw > 0
        ? Math.floor(pierCountRaw)
        : null,
    pierType: normalizePierType(formData.get("pierType")),
    piersPerTripStraight:
      piersStraightRaw !== null && piersStraightRaw > 0
        ? piersStraightRaw
        : DEFAULT_PIERS_PER_TRIP_STRAIGHT,
    piersPerTripCased:
      piersCasedRaw !== null && piersCasedRaw > 0
        ? piersCasedRaw
        : DEFAULT_PIERS_PER_TRIP_CASED,
    piersPerTripBelled:
      piersBelledRaw !== null && piersBelledRaw > 0
        ? piersBelledRaw
        : DEFAULT_PIERS_PER_TRIP_BELLED,
    concreteYd3GradeBeamsPierCaps,
    yd3PerTripGradeBeams:
      yd3PerTripGradeBeamsRaw !== null && yd3PerTripGradeBeamsRaw > 0
        ? yd3PerTripGradeBeamsRaw
        : DEFAULT_YD3_PER_TRIP_GRADE_BEAMS,
    concreteYd3BuildingSlab,
    yd3PerTripBuildingSlab:
      yd3PerTripBuildingSlabRaw !== null && yd3PerTripBuildingSlabRaw > 0
        ? yd3PerTripBuildingSlabRaw
        : DEFAULT_YD3_PER_TRIP_BUILDING_SLAB,
    concreteYd3PrivatePavement,
    yd3PerTripPrivatePavement:
      yd3PerTripPrivatePavementRaw !== null && yd3PerTripPrivatePavementRaw > 0
        ? yd3PerTripPrivatePavementRaw
        : DEFAULT_YD3_PER_TRIP_PRIVATE_PAVEMENT,
    concreteYd3PublicPavement,
    yd3PerTripPublicPavement:
      yd3PerTripPublicPavementRaw !== null && yd3PerTripPublicPavementRaw > 0
        ? yd3PerTripPublicPavementRaw
        : DEFAULT_YD3_PER_TRIP_PUBLIC_PAVEMENT,
    masonryLoadBearingCmuSf,
    masonrySfPerTripLoadBearingCmu:
      masonrySfPerTripLoadBearingCmuRaw !== null &&
      masonrySfPerTripLoadBearingCmuRaw > 0
        ? masonrySfPerTripLoadBearingCmuRaw
        : DEFAULT_MASONRY_SF_PER_TRIP_LOAD_BEARING,
    masonryElevatorBuildingCount:
      masonryElevatorBuildingCountRaw !== null &&
      masonryElevatorBuildingCountRaw > 0
        ? Math.floor(masonryElevatorBuildingCountRaw)
        : null,
    masonryElevatorShaftHeightFt,
    masonryFtPerTripElevatorShaft:
      masonryFtPerTripElevatorShaftRaw !== null &&
      masonryFtPerTripElevatorShaftRaw > 0
        ? masonryFtPerTripElevatorShaftRaw
        : DEFAULT_MASONRY_FT_PER_TRIP_ELEVATOR_SHAFT,
    masonryCmuEnclosureCount:
      masonryCmuEnclosureCountRaw !== null && masonryCmuEnclosureCountRaw > 0
        ? Math.floor(masonryCmuEnclosureCountRaw)
        : null,
    groutBaseplatesInSpecialInspection: parseCheckbox(
      formData,
      "groutBaseplatesInSpecialInspection"
    ),
    buildingPadSf,
    ft2PerTripGroutBaseplates:
      ft2PerTripGroutBaseplatesRaw !== null &&
      ft2PerTripGroutBaseplatesRaw > 0
        ? ft2PerTripGroutBaseplatesRaw
        : DEFAULT_FT2_PER_TRIP_GROUT_BASEPLATES,
    structuralSteelBuildingSf,
    structuralSteelSfPerTrip:
      structuralSteelSfPerTripRaw !== null &&
      structuralSteelSfPerTripRaw > 0
        ? structuralSteelSfPerTripRaw
        : DEFAULT_STRUCTURAL_STEEL_SF_PER_TRIP,
    structuralSteelFinalInspectionTrips:
      structuralSteelFinalInspectionTripsRaw !== null &&
      structuralSteelFinalInspectionTripsRaw >= 0
        ? structuralSteelFinalInspectionTripsRaw
        : DEFAULT_STRUCTURAL_STEEL_FINAL_INSPECTION_TRIPS,
    structureLevelCount:
      structureLevelCountRaw !== null && structureLevelCountRaw >= 1
        ? Math.floor(structureLevelCountRaw)
        : DEFAULT_STRUCTURE_LEVEL_COUNT,
  };
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Project name is required");
  const location = String(formData.get("location") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const docsReceived = String(formData.get("docsReceived") || "").trim();
  const takeoff = takeoffDataFromForm(formData);

  const project = await prisma.project.create({
    data: { name, location, notes, docsReceived, ...takeoff },
  });

  redirect(`/projects/${project.id}/scope`);
}

export async function updateProject(projectId: string, formData: FormData) {
  const takeoff = takeoffDataFromForm(formData);
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: String(formData.get("name") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
      docsReceived: String(formData.get("docsReceived") || "").trim(),
      ...takeoff,
    },
  });
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/scope`);
}

/** Save takeoff / project facts without leaving the current page. */
export async function updateProjectTakeoff(projectId: string, formData: FormData) {
  const takeoff = takeoffDataFromForm(formData);
  await prisma.project.update({
    where: { id: projectId },
    data: takeoff,
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/field`);
}

export async function deleteProject(projectId: string) {
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/");
  redirect("/");
}

export async function setProjectScope(projectId: string, formData: FormData) {
  const selected = formData.getAll("catalogId").map(String);
  const existing = await prisma.projectParent.findMany({
    where: { projectId },
    include: { lineItems: true, catalog: true },
  });
  const existingByCatalog = new Map(existing.map((p) => [p.catalogId, p]));

  const catalog = await prisma.parentTaskCatalog.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const catalogById = new Map(catalog.map((c) => [c.id, c]));

  // Remove deselected
  for (const p of existing) {
    if (!selected.includes(p.catalogId)) {
      await prisma.projectParent.delete({ where: { id: p.id } });
    }
  }

  // Add newly selected
  let sort = 0;
  for (const catalogId of selected) {
    sort += 1;
    const cat = catalogById.get(catalogId);
    if (!cat) continue;
    const prev = existingByCatalog.get(catalogId);
    if (prev) {
      await prisma.projectParent.update({
        where: { id: prev.id },
        data: { sortOrder: sort },
      });
    } else {
      await prisma.projectParent.create({
        data: {
          projectId,
          catalogId,
          sortOrder: sort,
          drivers: cat.defaultDrivers,
        },
      });
    }
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/field`);
}

export async function updateParentDrivers(
  projectId: string,
  parentId: string,
  formData: FormData
) {
  const keys = [
    "trips",
    "hours",
    "otHours",
    "days",
    "samples",
    "cylindersPerSample",
    "vehicleTrips",
    "gaugeDays",
  ];
  const drivers: Record<string, number | string> = {};
  for (const k of keys) {
    const raw = formData.get(k);
    if (raw === null || raw === "") continue;
    const num = Number(raw);
    drivers[k] = Number.isFinite(num) ? num : String(raw);
  }
  const notes = String(formData.get("notes") || "");
  if (notes) drivers.notes = notes;

  await prisma.projectParent.update({
    where: { id: parentId },
    data: { drivers: JSON.stringify(drivers) },
  });
  revalidatePath(`/projects/${projectId}/field`);
}

export async function applyFieldSuggestions(projectId: string, parentId: string) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const parent = await prisma.projectParent.findUniqueOrThrow({
    where: { id: parentId },
    include: { catalog: true, lineItems: true },
  });
  const takeoff = takeoffFromProject(project);
  let drivers = parseDrivers(parent.drivers);

  if (
    isEarthworkTestingParent(parent.catalog.name) &&
    hasEarthworkTakeoff(takeoff)
  ) {
    drivers = applyEarthworkTakeoffToDrivers(drivers, takeoff);
    await prisma.projectParent.update({
      where: { id: parentId },
      data: { drivers: JSON.stringify(drivers) },
    });
  } else if (
    isCipDeepFoundationsParent(parent.catalog.name) &&
    hasFoundationTakeoff(takeoff)
  ) {
    drivers = applyFoundationTakeoffToDrivers(drivers, takeoff);
    await prisma.projectParent.update({
      where: { id: parentId },
      data: { drivers: JSON.stringify(drivers) },
    });
  } else if (
    isConcreteTestingReinforcingParent(parent.catalog.name) &&
    hasConcreteTakeoff(takeoff)
  ) {
    drivers = applyConcreteTakeoffToDrivers(drivers, takeoff);
    await prisma.projectParent.update({
      where: { id: parentId },
      data: { drivers: JSON.stringify(drivers) },
    });
  } else if (
    isMasonryTestingParent(parent.catalog.name) &&
    hasMasonryTakeoff(takeoff)
  ) {
    drivers = applyMasonryTakeoffToDrivers(drivers, takeoff);
    await prisma.projectParent.update({
      where: { id: parentId },
      data: { drivers: JSON.stringify(drivers) },
    });
  } else if (
    isHighStrengthGroutParent(parent.catalog.name) &&
    hasGroutTakeoff(takeoff)
  ) {
    drivers = applyGroutTakeoffToDrivers(drivers, takeoff);
    await prisma.projectParent.update({
      where: { id: parentId },
      data: { drivers: JSON.stringify(drivers) },
    });
  } else if (
    isStructuralSteelParent(parent.catalog.name) &&
    hasStructuralSteelTakeoff(takeoff)
  ) {
    drivers = applyStructuralSteelTakeoffToDrivers(drivers, takeoff);
    await prisma.projectParent.update({
      where: { id: parentId },
      data: { drivers: JSON.stringify(drivers) },
    });
  }

  const suggestions = suggestFieldLines(parent.catalog.name, drivers, takeoff);

  await prisma.lineItem.deleteMany({
    where: { projectParentId: parentId, isLab: false },
  });

  await prisma.lineItem.createMany({
    data: suggestions.map((s, i) => ({
      projectParentId: parentId,
      description: s.description,
      quantity: s.quantity,
      units: s.units,
      trips: s.trips ?? null,
      isLab: false,
      sortOrder: i + 1,
      notes: s.notes ?? "",
    })),
  });

  revalidatePath(`/projects/${projectId}/field`);
}

export async function applyAllFieldSuggestions(projectId: string) {
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const takeoff = takeoffFromProject(project);
  const parents = await prisma.projectParent.findMany({
    where: { projectId },
    include: { catalog: true },
    orderBy: { sortOrder: "asc" },
  });
  for (const parent of parents) {
    if (parent.catalog.category === "lab") continue;
    let drivers = parseDrivers(parent.drivers);
    if (
      isEarthworkTestingParent(parent.catalog.name) &&
      hasEarthworkTakeoff(takeoff)
    ) {
      drivers = applyEarthworkTakeoffToDrivers(drivers, takeoff);
      await prisma.projectParent.update({
        where: { id: parent.id },
        data: { drivers: JSON.stringify(drivers) },
      });
    } else if (
      isCipDeepFoundationsParent(parent.catalog.name) &&
      hasFoundationTakeoff(takeoff)
    ) {
      drivers = applyFoundationTakeoffToDrivers(drivers, takeoff);
      await prisma.projectParent.update({
        where: { id: parent.id },
        data: { drivers: JSON.stringify(drivers) },
      });
    } else if (
      isConcreteTestingReinforcingParent(parent.catalog.name) &&
      hasConcreteTakeoff(takeoff)
    ) {
      drivers = applyConcreteTakeoffToDrivers(drivers, takeoff);
      await prisma.projectParent.update({
        where: { id: parent.id },
        data: { drivers: JSON.stringify(drivers) },
      });
    } else if (
      isMasonryTestingParent(parent.catalog.name) &&
      hasMasonryTakeoff(takeoff)
    ) {
      drivers = applyMasonryTakeoffToDrivers(drivers, takeoff);
      await prisma.projectParent.update({
        where: { id: parent.id },
        data: { drivers: JSON.stringify(drivers) },
      });
    } else if (
      isHighStrengthGroutParent(parent.catalog.name) &&
      hasGroutTakeoff(takeoff)
    ) {
      drivers = applyGroutTakeoffToDrivers(drivers, takeoff);
      await prisma.projectParent.update({
        where: { id: parent.id },
        data: { drivers: JSON.stringify(drivers) },
      });
    } else if (
      isStructuralSteelParent(parent.catalog.name) &&
      hasStructuralSteelTakeoff(takeoff)
    ) {
      drivers = applyStructuralSteelTakeoffToDrivers(drivers, takeoff);
      await prisma.projectParent.update({
        where: { id: parent.id },
        data: { drivers: JSON.stringify(drivers) },
      });
    }
    const suggestions = suggestFieldLines(parent.catalog.name, drivers, takeoff);
    await prisma.lineItem.deleteMany({
      where: { projectParentId: parent.id, isLab: false },
    });
    await prisma.lineItem.createMany({
      data: suggestions.map((s, i) => ({
        projectParentId: parent.id,
        description: s.description,
        quantity: s.quantity,
        units: s.units,
        trips: s.trips ?? null,
        isLab: false,
        sortOrder: i + 1,
        notes: s.notes ?? "",
      })),
    });
  }
  revalidatePath(`/projects/${projectId}/field`);
}

export async function upsertLineItem(projectId: string, formData: FormData) {
  const id = String(formData.get("id") || "");
  const projectParentId = String(formData.get("projectParentId") || "");
  const description = String(formData.get("description") || "").trim();
  const quantity = Number(formData.get("quantity") || 0);
  const units = String(formData.get("units") || "each");
  const tripsRaw = formData.get("trips");
  const trips =
    tripsRaw === null || tripsRaw === "" ? null : Number(tripsRaw);
  const isLab = String(formData.get("isLab") || "false") === "true";
  const notes = String(formData.get("notes") || "");

  if (!description || !projectParentId) throw new Error("Missing fields");

  if (id) {
    await prisma.lineItem.update({
      where: { id },
      data: { description, quantity, units, trips, notes },
    });
  } else {
    const count = await prisma.lineItem.count({ where: { projectParentId } });
    await prisma.lineItem.create({
      data: {
        projectParentId,
        description,
        quantity,
        units,
        trips,
        isLab,
        notes,
        sortOrder: count + 1,
      },
    });
  }
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteLineItem(projectId: string, lineItemId: string) {
  await prisma.lineItem.delete({ where: { id: lineItemId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function applyLabSuggestions(projectId: string) {
  let labParent = await prisma.projectParent.findFirst({
    where: { projectId, catalog: { name: "Laboratory Testing" } },
    include: { catalog: true },
  });

  if (!labParent) {
    const labCat = await prisma.parentTaskCatalog.findUnique({
      where: { name: "Laboratory Testing" },
    });
    if (!labCat) throw new Error("Laboratory Testing catalog missing — run seed");
    const maxSort = await prisma.projectParent.aggregate({
      where: { projectId },
      _max: { sortOrder: true },
    });
    labParent = await prisma.projectParent.create({
      data: {
        projectId,
        catalogId: labCat.id,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        drivers: "{}",
      },
      include: { catalog: true },
    });
  }

  const parents = await prisma.projectParent.findMany({
    where: { projectId },
    include: { catalog: true },
  });

  const suggestions = suggestLabLines(
    parents.map((p) => ({
      name: p.catalog.name,
      drivers: parseDrivers(p.drivers),
    }))
  );

  await prisma.lineItem.deleteMany({
    where: { projectParentId: labParent.id, isLab: true },
  });

  await prisma.lineItem.createMany({
    data: suggestions.map((s, i) => ({
      projectParentId: labParent!.id,
      description: s.description,
      quantity: s.quantity,
      units: s.units,
      trips: null,
      isLab: true,
      sortOrder: i + 1,
      notes: s.notes ?? "",
    })),
  });

  revalidatePath(`/projects/${projectId}/lab`);
}

export async function getMissChecks(projectId: string) {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
  });
  const parents = await prisma.projectParent.findMany({
    where: { projectId },
    include: { catalog: true },
  });
  const catalog = await prisma.parentTaskCatalog.findMany();
  return missCheckPrompts(
    parents.map((p) => p.catalog.name),
    catalog.map((c) => ({
      name: c.name,
      relatedHints: parseHints(c.relatedHints),
    })),
    takeoffFromProject(project)
  );
}
