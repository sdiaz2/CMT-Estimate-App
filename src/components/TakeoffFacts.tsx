import { DEFAULT_EARTHWORK_SF_PER_TRIP } from "@/lib/heuristics";

export type TakeoffFactsValues = {
  buildingAreaSf?: number | null;
  moistureConditionedSubgrade?: boolean;
  flexibleBaseCap?: boolean;
  earthworkSfPerTrip?: number | null;
  moistureDepthNote?: string;
  flexibleBaseThicknessNote?: string;
};

/** Shared Takeoff / Project facts fields (used inside a parent <form>). */
export function TakeoffFactsFields({
  values,
  compact = false,
}: {
  values?: TakeoffFactsValues;
  compact?: boolean;
}) {
  const divisor =
    values?.earthworkSfPerTrip && values.earthworkSfPerTrip > 0
      ? values.earthworkSfPerTrip
      : DEFAULT_EARTHWORK_SF_PER_TRIP;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Takeoff / Project facts
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Used for earthwork trip suggestions when estimating moisture-conditioned
          subgrade with a flexible base cap. Typical range{" "}
          <strong>2,700–3,000 SF/trip</strong>; default mid{" "}
          <strong>{DEFAULT_EARTHWORK_SF_PER_TRIP.toLocaleString()}</strong>.
          Suggestions never lock — edit freely after Apply.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Building area (SF)
          </span>
          <input
            name="buildingAreaSf"
            type="number"
            step="any"
            min="0"
            defaultValue={
              values?.buildingAreaSf != null ? String(values.buildingAreaSf) : ""
            }
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. 100000"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Earthwork SF per trip
          </span>
          <input
            name="earthworkSfPerTrip"
            type="number"
            step="any"
            min="1"
            defaultValue={String(divisor)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <span className="mt-0.5 block text-xs text-slate-500">
            typical 2700–3000 (editable — use 2700 or 3000 if preferred)
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="moistureConditionedSubgrade"
            value="true"
            defaultChecked={!!values?.moistureConditionedSubgrade}
            className="rounded border-slate-300"
          />
          Moisture-conditioned subgrade
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="flexibleBaseCap"
            value="true"
            defaultChecked={!!values?.flexibleBaseCap}
            className="rounded border-slate-300"
          />
          Flexible base cap
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Moisture depth note (optional)
          </span>
          <input
            name="moistureDepthNote"
            type="text"
            defaultValue={values?.moistureDepthNote ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. 8 in moisture conditioning"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Flexible base thickness note (optional)
          </span>
          <input
            name="flexibleBaseThicknessNote"
            type="text"
            defaultValue={values?.flexibleBaseThicknessNote ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="e.g. 6 in flexible base"
          />
        </label>
      </div>
    </div>
  );
}
