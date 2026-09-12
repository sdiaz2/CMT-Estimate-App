import { createProject } from "@/lib/actions";
import { TakeoffFactsFields } from "@/components/TakeoffFacts";
import Link from "next/link";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Projects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          New project
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Capture project setup details. Docs received notes help later
          reviewers know what was available when estimating.
        </p>
      </div>

      <form
        action={createProject}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Project name</span>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. Riverside Elementary Expansion"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Location</span>
          <input
            name="location"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="City, State"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Docs received
          </span>
          <textarea
            name="docsReceived"
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Plans dated…, specs sections…, geotech report…"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            name="notes"
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Schedule assumptions, exclusions, etc."
          />
        </label>

        <div className="border-t border-slate-200 pt-4">
          <TakeoffFactsFields />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/"
            className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Create & continue to scope
          </button>
        </div>
      </form>
    </div>
  );
}
