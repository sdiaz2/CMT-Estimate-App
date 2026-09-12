import Link from "next/link";
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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
          <p className="mt-1 text-sm text-slate-600">Project setup</p>
        </div>
        <Link
          href={`/projects/${id}/scope`}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Next: Scope →
        </Link>
      </div>

      <form
        action={updateProject.bind(null, id)}
        className="mx-auto max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Project name</span>
          <input
            name="name"
            required
            defaultValue={project.name}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Location</span>
          <input
            name="location"
            defaultValue={project.location}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Docs received</span>
          <textarea
            name="docsReceived"
            rows={3}
            defaultValue={project.docsReceived}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={project.notes}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="border-t border-slate-200 pt-4">
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
            }}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Save & continue
          </button>
        </div>
      </form>
    </div>
  );
}
