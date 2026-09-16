import Link from "next/link";
import type { ReactNode } from "react";

/** Path-string Link for generated worksheet / step URLs. */
export function NavLink({
  to,
  children,
  className,
  "aria-current": ariaCurrent,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  "aria-current"?: "step" | "page" | undefined;
}) {
  return (
    <Link href={to} className={className} aria-current={ariaCurrent}>
      {children}
    </Link>
  );
}
