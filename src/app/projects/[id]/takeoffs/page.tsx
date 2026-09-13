import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProjectTakeoff } from "@/lib/actions";
import { StepNav } from "@/components/StepNav";
import {
  TakeoffFactsFields,
  takeoffScopeFromParentNames,
  type TakeoffFactsValues,
} from "@/components/TakeoffFacts";

export const dynamic = "force-dynamic";

function takeoffValuesFromProject(project: {
  buildingAreaSf: number | null;
  moistureConditionedSubgrade: boolean;
  flexibleBaseCap: boolean;
  earthworkSfPerTrip: number | null;
  moistureDepthNote: string;
  flexibleBaseThicknessNote: string;
  pavementAreaSf: number | null;
  limeTreatedPavementSubgrade: boolean;
  pavementSfPerTrip: number | null;
  pavementSubgradeLf: number | null;
  pavementLfPerTrip: number | null;
  pavementNotes: string;
  sidewalkLf: number | null;
  sidewalksBunchedTogether: boolean;
  sidewalkSpreadLfPerTrip: number | null;
  sidewalkBunchedLfPerTrip: number | null;
  utilityTrenchLf: number | null;
  utilityTrenchLfPerTrip: number | null;
  foundationScheduleTrips: number | null;
  pierCount: number | null;
  pierType: string | null;
  piersPerTripStraight: number | null;
  piersPerTripCased: number | null;
  piersPerTripBelled: number | null;
  concreteYd3GradeBeamsPierCaps: number | null;
  yd3PerTripGradeBeams: number | null;
  concreteYd3BuildingSlab: number | null;
  yd3PerTripBuildingSlab: number | null;
  concreteYd3PrivatePavement: number | null;
  yd3PerTripPrivatePavement: number | null;
  concreteYd3PublicPavement: number | null;
  yd3PerTripPublicPavement: number | null;
  masonryLoadBearingCmuSf: number | null;
  masonrySfPerTripLoadBearingCmu: number | null;
  masonryElevatorBuildingCount: number | null;
  masonryElevatorShaftHeightFt: number | null;
  masonryFtPerTripElevatorShaft: number | null;
  masonryCmuEnclosureCount: number | null;
  groutBaseplatesInSpecialInspection: boolean;
  buildingPadSf: number | null;
  ft2PerTripGroutBaseplates: number | null;
  structuralSteelBuildingSf: number | null;
  structuralSteelSfPerTrip: number | null;
  structuralSteelFinalInspectionTrips: number | null;
  structureLevelCount: number | null;
  slabOnGradePourCount: number | null;
  floorFlatnessSf: number | null;
  ft2PerTripFloorFlatness: number | null;
  postTensionSlabPourCount: number | null;
}): TakeoffFactsValues {
  return {
    buildingAreaSf: project.buildingAreaSf,
    moistureConditionedSubgrade: project.moistureConditionedSubgrade,
    flexibleBaseCap: project.flexibleBaseCap,
    earthworkSfPerTrip: project.earthworkSfPerTrip,
    moistureDepthNote: project.moistureDepthNote,
    flexibleBaseThicknessNote: project.flexibleBaseThicknessNote,
    pavementAreaSf: project.pavementAreaSf,
    limeTreatedPavementSubgrade: project.limeTreatedPavementSubgrade,
    pavementSfPerTrip: project.pavementSfPerTrip,
    pavementSubgradeLf: project.pavementSubgradeLf,
    pavementLfPerTrip: project.pavementLfPerTrip,
    pavementNotes: project.pavementNotes,
    sidewalkLf: project.sidewalkLf,
    sidewalksBunchedTogether: project.sidewalksBunchedTogether,
    sidewalkSpreadLfPerTrip: project.sidewalkSpreadLfPerTrip,
    sidewalkBunchedLfPerTrip: project.sidewalkBunchedLfPerTrip,
    utilityTrenchLf: project.utilityTrenchLf,
    utilityTrenchLfPerTrip: project.utilityTrenchLfPerTrip,
    foundationScheduleTrips: project.foundationScheduleTrips,
    pierCount: project.pierCount,
    pierType: project.pierType,
    piersPerTripStraight: project.piersPerTripStraight,
    piersPerTripCased: project.piersPerTripCased,
    piersPerTripBelled: project.piersPerTripBelled,
    concreteYd3GradeBeamsPierCaps: project.concreteYd3GradeBeamsPierCaps,
    yd3PerTripGradeBeams: project.yd3PerTripGradeBeams,
    concreteYd3BuildingSlab: project.concreteYd3BuildingSlab,
    yd3PerTripBuildingSlab: project.yd3PerTripBuildingSlab,
    concreteYd3PrivatePavement: project.concreteYd3PrivatePavement,
    yd3PerTripPrivatePavement: project.yd3PerTripPrivatePavement,
    concreteYd3PublicPavement: project.concreteYd3PublicPavement,
    yd3PerTripPublicPavement: project.yd3PerTripPublicPavement,
    masonryLoadBearingCmuSf: project.masonryLoadBearingCmuSf,
    masonrySfPerTripLoadBearingCmu: project.masonrySfPerTripLoadBearingCmu,
    masonryElevatorBuildingCount: project.masonryElevatorBuildingCount,
    masonryElevatorShaftHeightFt: project.masonryElevatorShaftHeightFt,
    masonryFtPerTripElevatorShaft: project.masonryFtPerTripElevatorShaft,
    masonryCmuEnclosureCount: project.masonryCmuEnclosureCount,
    groutBaseplatesInSpecialInspection:
      project.groutBaseplatesInSpecialInspection,
    buildingPadSf: project.buildingPadSf,
    ft2PerTripGroutBaseplates: project.ft2PerTripGroutBaseplates,
    structuralSteelBuildingSf: project.structuralSteelBuildingSf,
    structuralSteelSfPerTrip: project.structuralSteelSfPerTrip,
    structuralSteelFinalInspectionTrips:
      project.structuralSteelFinalInspectionTrips,
    structureLevelCount: project.structureLevelCount,
    slabOnGradePourCount: project.slabOnGradePourCount,
    floorFlatnessSf: project.floorFlatnessSf,
    ft2PerTripFloorFlatness: project.ft2PerTripFloorFlatness,
    postTensionSlabPourCount: project.postTensionSlabPourCount,
  };
}

export default async function TakeoffsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      parents: { include: { catalog: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!project) notFound();

  const parentNames = project.parents.map((p) => p.catalog.name);
  const scope = takeoffScopeFromParentNames(parentNames);
  const fieldParents = project.parents.filter(
    (p) => p.catalog.category !== "lab"
  );

  return (
    <div>
      <StepNav projectId={id} current="takeoffs" />
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-umber">
          {project.name}
        </h1>
        <p className="page-lead mt-2">
          Enter plan quantities for the work you scoped. Fields that do not
          match selected parents stay hidden when possible — shared building/pad
          SF still shows when earthwork, steel, grout, or floor flatness is in
          scope.
        </p>
      </div>

      {fieldParents.length === 0 ? (
        <div className="empty-state">
          <p className="text-lg font-medium text-umber">No work selected yet</p>
          <p className="mt-2 text-umber-muted">
            Pick testing parents on Scope first, then come back to enter
            quantities.
          </p>
          <Link
            href={`/projects/${id}/scope`}
            className="btn-primary mt-6 text-sm"
          >
            Go to scope
          </Link>
        </div>
      ) : (
        <form
          action={updateProjectTakeoff.bind(null, id)}
          className="card-soft mx-auto max-w-3xl space-y-5 p-8"
        >
          {parentNames.length > 0 && (
            <p className="text-xs text-umber-faint">
              Scoped: {parentNames.join(" · ")}
            </p>
          )}
          <TakeoffFactsFields
            values={takeoffValuesFromProject(project)}
            scope={scope}
          />
          <div className="flex flex-wrap justify-between gap-2.5 pt-2">
            <Link
              href={`/projects/${id}/scope`}
              className="btn-secondary text-sm"
            >
              ← Back to scope
            </Link>
            <button type="submit" className="btn-primary text-sm">
              Save takeoffs and continue →
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
