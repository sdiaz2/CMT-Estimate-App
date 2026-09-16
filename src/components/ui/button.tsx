import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg shadow-soft hover:bg-primary-hover active:scale-[0.98]",
        secondary:
          "bg-surface text-fg shadow-[inset_0_0_0_1.5px_var(--color-border-strong)] hover:bg-surface-2",
        ink: "bg-ink text-ink-fg hover:bg-fg active:scale-[0.98]",
        ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-fg",
        danger: "bg-danger-soft text-danger hover:bg-danger hover:text-primary-fg",
      },
      size: {
        sm: "h-9 px-3.5 min-h-9",
        md: "h-11 px-5 min-h-11",
        lg: "h-12 px-6 min-h-12 text-base",
        icon: "size-11 min-h-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
