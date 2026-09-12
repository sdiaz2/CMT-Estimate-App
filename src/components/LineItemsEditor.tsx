"use client";

import { useTransition } from "react";
import { deleteLineItem, upsertLineItem } from "@/lib/actions";

type Line = {
  id: string;
  description: string;
  quantity: number;
  units: string;
  trips: number | null;
  isLab: boolean;
  notes: string;
};

export function LineItemsEditor({
  projectId,
  projectParentId,
  lines,
  isLab = false,
}: {
  projectId: string;
  projectParentId: string;
  lines: Line[];
  isLab?: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Description</th>
            <th className="px-3 py-2">Quantity</th>
            <th className="px-3 py-2">Units</th>
            <th className="px-3 py-2">Trips</th>
            <th className="px-3 py-2">Notes</th>
            <th className="px-3 py-2 no-print"></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id} className="border-t border-slate-100">
              <td className="px-3 py-2" colSpan={6}>
                <form
                  className="grid grid-cols-12 items-center gap-2"
                  action={(fd) => start(() => upsertLineItem(projectId, fd))}
                >
                  <input type="hidden" name="id" value={line.id} />
                  <input type="hidden" name="projectParentId" value={projectParentId} />
                  <input type="hidden" name="isLab" value={String(isLab)} />
                  <input
                    name="description"
                    defaultValue={line.description}
                    className="col-span-4 rounded border border-slate-200 px-2 py-1"
                  />
                  <input
                    name="quantity"
                    type="number"
                    step="any"
                    defaultValue={line.quantity}
                    className="col-span-1 rounded border border-slate-200 px-2 py-1"
                  />
                  <select
                    name="units"
                    defaultValue={line.units}
                    className="col-span-1 rounded border border-slate-200 px-2 py-1"
                  >
                    {["hours", "each", "day", "tests"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <input
                    name="trips"
                    type="number"
                    step="any"
                    defaultValue={line.trips ?? ""}
                    placeholder="—"
                    className="col-span-1 rounded border border-slate-200 px-2 py-1"
                  />
                  <input
                    name="notes"
                    defaultValue={line.notes}
                    className="col-span-3 rounded border border-slate-200 px-2 py-1"
                  />
                  <div className="col-span-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={pending}
                      className="rounded bg-slate-800 px-2 py-1 text-xs text-white hover:bg-slate-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 ring-1 ring-red-200"
                      onClick={() =>
                        start(() => deleteLineItem(projectId, line.id))
                      }
                    >
                      Delete
                    </button>
                  </div>
                </form>
              </td>
            </tr>
          ))}
          <tr className="border-t border-slate-100 bg-slate-50/50">
            <td className="px-3 py-2" colSpan={6}>
              <form
                className="grid grid-cols-12 items-center gap-2"
                action={(fd) => start(() => upsertLineItem(projectId, fd))}
              >
                <input type="hidden" name="projectParentId" value={projectParentId} />
                <input type="hidden" name="isLab" value={String(isLab)} />
                <input
                  name="description"
                  placeholder="Add line description"
                  required
                  className="col-span-4 rounded border border-slate-200 px-2 py-1"
                />
                <input
                  name="quantity"
                  type="number"
                  step="any"
                  defaultValue={0}
                  className="col-span-1 rounded border border-slate-200 px-2 py-1"
                />
                <select
                  name="units"
                  defaultValue={isLab ? "tests" : "hours"}
                  className="col-span-1 rounded border border-slate-200 px-2 py-1"
                >
                  {["hours", "each", "day", "tests"].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <input
                  name="trips"
                  type="number"
                  step="any"
                  placeholder="—"
                  className="col-span-1 rounded border border-slate-200 px-2 py-1"
                />
                <input
                  name="notes"
                  placeholder="Notes"
                  className="col-span-3 rounded border border-slate-200 px-2 py-1"
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="col-span-2 rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500"
                >
                  Add line
                </button>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
