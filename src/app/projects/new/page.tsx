import { createProject } from "@/lib/actions";
import Link from "next/link";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-umber-faint hover:text-umber transition-colors"
        >
          ← All projects
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-umber">
          New estimate
        </h1>
        <p className="page-lead mt-2">
          Name the job and note what docs you have. Plan quantities come after
          you pick scope.
        </p>
      </div>

      <form action={createProject} className="card-soft space-y-5 p-8">
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">Project name</span>
          <input
            name="name"
            required
            className="input-soft mt-1.5 w-full text-sm"
            placeholder="e.g. Riverside Elementary Expansion"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">Location</span>
          <input
            name="location"
            className="input-soft mt-1.5 w-full text-sm"
            placeholder="City, State"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">
            Docs you received
          </span>
          <textarea
            name="docsReceived"
            rows={3}
            className="input-soft rounded-block mt-1.5 w-full text-sm"
            placeholder="Plans dated…, specs sections…, geotech report…"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-umber-soft">Notes</span>
          <textarea
            name="notes"
            rows={3}
            className="input-soft rounded-block mt-1.5 w-full text-sm"
            placeholder="Schedule assumptions, exclusions, etc."
          />
        </label>

        <p className="text-xs text-umber-faint">
          Tip: enter plan quantities on the <strong>Takeoffs</strong> step after
          you pick scope.
        </p>

        <div className="flex flex-wrap justify-end gap-2.5 pt-2">
          <Link href="/" className="btn-secondary text-sm">
            Cancel
          </Link>
          <button type="submit" className="btn-primary text-sm">
            Save and pick scope →
          </button>
        </div>
      </form>
    </div>
  );
}
