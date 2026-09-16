import { AlertTriangle } from "lucide-react";
import { missChecks, useEstimateStore, type Project } from "@/lib/store";
import { Button } from "./ui/button";

export function MissCheckBanner({ project }: { project: Project }) {
  const prompts = missChecks(project);
  const toggleScope = useEstimateStore((s) => s.toggleScope);
  if (prompts.length === 0) return null;

  const unique = prompts.filter(
    (p, i, arr) => arr.findIndex((x) => x.missing === p.missing) === i
  );

  return (
    <div className="rounded-2xl bg-hint-bg px-4 py-3.5 text-hint shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--color-hint)_28%,transparent)]">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <AlertTriangle className="size-4" />
        Related scope
      </p>
      <ul className="mt-2 space-y-2">
        {unique.map((p) => (
          <li
            key={p.missing}
            className="flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <span>{p.message}</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => toggleScope(project.id, p.missing)}
            >
              Add {p.missing}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
