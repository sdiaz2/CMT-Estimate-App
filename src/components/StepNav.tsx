import Link from "next/link";

const STEPS = [
  { key: "setup", label: "1. Setup", href: (id: string) => `/projects/${id}` },
  { key: "scope", label: "2. Scope", href: (id: string) => `/projects/${id}/scope` },
  { key: "field", label: "3. Trips / Hours", href: (id: string) => `/projects/${id}/field` },
  { key: "lab", label: "4. Lab", href: (id: string) => `/projects/${id}/lab` },
  { key: "worksheet", label: "5. Worksheet", href: (id: string) => `/projects/${id}/worksheet` },
] as const;

export function StepNav({
  projectId,
  current,
}: {
  projectId: string;
  current: (typeof STEPS)[number]["key"];
}) {
  return (
    <nav className="no-print mb-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
      {STEPS.map((s) => {
        const active = s.key === current;
        return (
          <Link
            key={s.key}
            href={s.href(projectId)}
            className={
              active
                ? "rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
