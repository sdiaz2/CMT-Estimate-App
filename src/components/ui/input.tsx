import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-full border border-border-strong bg-surface px-4 text-sm text-fg shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-subtle",
        "focus-visible:outline-none focus-visible:border-clay focus-visible:ring-4 focus-visible:ring-primary/20",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm text-fg transition-[border-color,box-shadow] duration-150 placeholder:text-subtle",
        "focus-visible:outline-none focus-visible:border-clay focus-visible:ring-4 focus-visible:ring-primary/20",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-muted", className)}
      {...props}
    />
  );
}
