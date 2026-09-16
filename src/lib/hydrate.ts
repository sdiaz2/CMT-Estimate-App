import { useEffect, useMemo, useState } from "react";
import { useEstimateStore, type Project } from "./store";

export function useEnsureHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useEstimateStore.persist.onFinishHydration(finish);
    if (useEstimateStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);
  return hydrated;
}

export function useProjectList(): Project[] {
  const order = useEstimateStore((s) => s.order);
  const projects = useEstimateStore((s) => s.projects);
  return useMemo(
    () => order.map((id) => projects[id]).filter((p): p is Project => Boolean(p)),
    [order, projects]
  );
}
