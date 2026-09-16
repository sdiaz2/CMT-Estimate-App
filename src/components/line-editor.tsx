import { Plus, Trash2 } from "lucide-react";
import type { LineItem } from "@/lib/types";
import { UNIT_OPTIONS } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function LineEditor({
  lines,
  onChange,
  allowLab = false,
}: {
  lines: LineItem[];
  onChange: (lines: LineItem[]) => void;
  allowLab?: boolean;
}) {
  function patch(id: string, part: Partial<LineItem>) {
    onChange(lines.map((l) => (l.id === id ? { ...l, ...part } : l)));
  }

  return (
    <div className="space-y-2">
      <div className="hidden gap-2 px-1 text-[0.7rem] font-semibold uppercase tracking-wider text-subtle sm:grid sm:grid-cols-[1fr_5.5rem_6.5rem_5.5rem_auto]">
        <span>Description</span>
        <span>Qty</span>
        <span>Units</span>
        <span>Trips</span>
        <span />
      </div>
      {lines.map((line) => (
        <div
          key={line.id}
          className="grid grid-cols-1 gap-2 rounded-2xl bg-surface-2/70 p-3 sm:grid-cols-[1fr_5.5rem_6.5rem_5.5rem_auto] sm:items-center"
        >
          <Input
            value={line.description}
            onChange={(e) => patch(line.id, { description: e.target.value })}
            className="rounded-xl"
            aria-label="Description"
          />
          <Input
            type="number"
            inputMode="decimal"
            value={Number.isFinite(line.quantity) ? line.quantity : 0}
            onChange={(e) => patch(line.id, { quantity: Number(e.target.value) || 0 })}
            className="rounded-xl tabular-nums"
            aria-label="Quantity"
          />
          <select
            value={line.units}
            onChange={(e) => patch(line.id, { units: e.target.value })}
            className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-sm"
            aria-label="Units"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
            {!UNIT_OPTIONS.includes(line.units as (typeof UNIT_OPTIONS)[number]) ? (
              <option value={line.units}>{line.units}</option>
            ) : null}
          </select>
          <Input
            type="number"
            inputMode="numeric"
            value={line.trips ?? ""}
            placeholder="—"
            onChange={(e) => {
              const v = e.target.value;
              patch(line.id, { trips: v === "" ? null : Number(v) || 0 });
            }}
            className="rounded-xl tabular-nums"
            aria-label="Trips"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove line"
            onClick={() => onChange(lines.filter((l) => l.id !== line.id))}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          onChange([
            ...lines,
            {
              id: uid(),
              description: "",
              quantity: 0,
              units: allowLab ? "tests" : "hours",
              trips: null,
              isLab: allowLab,
              notes: "",
            },
          ])
        }
      >
        <Plus />
        Add line
      </Button>
    </div>
  );
}
