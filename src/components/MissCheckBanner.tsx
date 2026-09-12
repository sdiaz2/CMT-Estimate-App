export function MissCheckBanner({
  prompts,
}: {
  prompts: { parent: string; missing: string; message: string }[];
}) {
  if (!prompts.length) return null;
  return (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
      <h3 className="text-sm font-semibold text-amber-900">Scope miss-check</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
        {prompts.map((p, i) => (
          <li key={`${p.parent}-${p.missing}-${i}`}>{p.message}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-amber-700">
        Suggestions only — add related parents on the Scope step if needed.
      </p>
    </div>
  );
}
