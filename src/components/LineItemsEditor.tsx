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

  const fieldClass =
    "w-full rounded-full border-[1.5px] border-clay-muted bg-paper px-3 py-1.5 text-sm text-umber focus:border-clay focus:outline-none focus:ring-2 focus:ring-terracotta/20";

  return (
    <div className="table-wrap-soft overflow-x-auto">
      <table className="table-soft min-w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-umber-muted">
          <tr>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Units</th>
            <th className="px-4 py-3">Trips</th>
            <th className="px-4 py-3">Notes</th>
            <th className="px-4 py-3 no-print"></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, idx) => (
            <tr
              key={line.id}
              className={idx % 2 === 1 ? "bg-sand/25" : undefined}
            >
              <td className="px-4 py-3" colSpan={6}>
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
                    className={`col-span-4 ${fieldClass}`}
                  />
                  <input
                    name="quantity"
                    type="number"
                    step="any"
                    defaultValue={line.quantity}
                    className={`col-span-1 ${fieldClass}`}
                  />
                  <select
                    name="units"
                    defaultValue={line.units}
                    className={`col-span-1 ${fieldClass}`}
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
                    className={`col-span-1 ${fieldClass}`}
                  />
                  <input
                    name="notes"
                    defaultValue={line.notes}
                    className={`col-span-3 ${fieldClass}`}
                  />
                  <div className="col-span-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={pending}
                      className="btn-dark px-3 py-1.5 text-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded-full bg-danger-soft px-3 py-1.5 text-xs font-medium text-danger"
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
          <tr className="bg-sand-soft/60">
            <td className="px-4 py-3" colSpan={6}>
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
                  className={`col-span-4 ${fieldClass}`}
                />
                <input
                  name="quantity"
                  type="number"
                  step="any"
                  defaultValue={0}
                  className={`col-span-1 ${fieldClass}`}
                />
                <select
                  name="units"
                  defaultValue={isLab ? "tests" : "hours"}
                  className={`col-span-1 ${fieldClass}`}
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
                  className={`col-span-1 ${fieldClass}`}
                />
                <input
                  name="notes"
                  placeholder="Notes"
                  className={`col-span-3 ${fieldClass}`}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="btn-primary col-span-2 px-3 py-1.5 text-xs"
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
