export function MissCheckBanner({
  prompts,
}: {
  prompts: { parent: string; missing: string; message: string }[];
}) {
  if (!prompts.length) return null;
  return (
    <div className="hint-banner mb-8 p-5">
      <h3 className="text-sm font-semibold text-hint">Possible missing scope</h3>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-hint">
        {prompts.map((p, i) => (
          <li key={`${p.parent}-${p.missing}-${i}`}>{p.message}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-umber-faint">
        Just a heads-up — add related items on Scope if they belong on this job.
      </p>
    </div>
  );
}
