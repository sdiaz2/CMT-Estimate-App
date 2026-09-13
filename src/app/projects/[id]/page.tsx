import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProject } from "@/lib/actions";
import { StepNav } from "@/components/StepNav";
import { TakeoffFactsFields } from "@/components/TakeoffFacts";

export const dynamic = "force-dynamic";

export default async function ProjectSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  return (
    <div>
      <StepNav projectId={id} current="setup" />
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-umber">{project.name}</h1>
        <p className="page-lead mt-2">
          Confirm the job details and any plan quantities. Save when ready —
          then pick which testing parents are in scope.
        </p>
      </div>

      <form
        action={updateProject.bind(null, id)}
        className="card-soft mx-auto max-w-2xl space-y-5 p-8"
      >
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">Project name</span>
          <input
            name="name"
            required
            defaultValue={project.name}
            className="input-soft mt-1.5 w-full text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">Location</span>
          <input
            name="location"
            defaultValue={project.location}
            className="input-soft mt-1.5 w-full text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">Docs received</span>
          <textarea
            name="docsReceived"
            rows={3}
            defaultValue={project.docsReceived}
            className="input-soft rounded-block mt-1.5 w-full text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">Notes</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={project.notes}
            className="input-soft rounded-block mt-1.5 w-full text-sm"
          />
        </label>

        <div className="divider-soft pt-2">
          <TakeoffFactsFields
            values={{
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
              concreteYd3GradeBeamsPierCaps:
                project.concreteYd3GradeBeamsPierCaps,
              yd3PerTripGradeBeams: project.yd3PerTripGradeBeams,
              concreteYd3BuildingSlab: project.concreteYd3BuildingSlab,
              yd3PerTripBuildingSlab: project.yd3PerTripBuildingSlab,
              concreteYd3PrivatePavement: project.concreteYd3PrivatePavement,
              yd3PerTripPrivatePavement: project.yd3PerTripPrivatePavement,
              concreteYd3PublicPavement: project.concreteYd3PublicPavement,
              yd3PerTripPublicPavement: project.yd3PerTripPublicPavement,
              masonryLoadBearingCmuSf: project.masonryLoadBearingCmuSf,
              masonrySfPerTripLoadBearingCmu:
                project.masonrySfPerTripLoadBearingCmu,
              masonryElevatorBuildingCount:
                project.masonryElevatorBuildingCount,
              masonryElevatorShaftHeightFt:
                project.masonryElevatorShaftHeightFt,
              masonryFtPerTripElevatorShaft:
                project.masonryFtPerTripElevatorShaft,
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
            }}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Save project details
          </button>
        </div>
      </form>
    </div>
  );
}
