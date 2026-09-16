"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js");
  }, []);
  return null;
}

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [hidden, setHidden] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || hidden) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  return (
    <div className="mb-6 rounded-2xl border border-primary/25 bg-primary-soft px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-fg">
          <Smartphone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-fg">
            Install this rebuild on your phone
          </p>
          <p className="mt-1 text-sm text-muted">
            This is the new estimator — live trip chips, sample warehouse,
            worksheets on this device. Not the older “Your projects” app.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {deferred ? (
              <Button type="button" size="sm" onClick={() => void install()}>
                <Download />
                Add to home screen
              </Button>
            ) : (
              <p className="text-sm text-muted">
                Chrome: tap <span className="font-semibold text-fg">⋮</span>{" "}
                then <span className="font-semibold text-fg">Install app</span>{" "}
                or Add to Home screen.
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          className="rounded-full p-2 text-muted hover:bg-surface hover:text-fg"
          aria-label="Dismiss install hint"
          onClick={() => setHidden(true)}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
