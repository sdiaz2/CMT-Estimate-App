import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProject } from "@/lib/actions";
import { StepNav } from "@/components/StepNav";

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
          Confirm the job details. Plan quantities are entered after scope on
          the Takeoffs step.
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

        <p className="text-xs text-umber-faint">
          Enter quantities after scope —{" "}
          <Link
            href={`/projects/${id}/takeoffs`}
            className="font-medium text-terracotta hover:text-terracotta-hover"
          >
            open Takeoffs
          </Link>
          .
        </p>

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
