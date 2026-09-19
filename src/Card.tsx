import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  // #region Tailwind utility consts
  // The glow is two stacked layers: a tight 1px ring that tightens the edge
  // against the border, then a wide diffuse halo. Both are written as one
  // literal arbitrary value because Tailwind scans source text for complete
  // class names — a composed template string would never emit any CSS.
  const cardGlowCls =
    "shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_20%,transparent),0_0_24px_4px_color-mix(in_oklch,var(--primary)_35%,transparent)]";
  const baseCardCls = `bg-card rounded-xl border border-primary-600 p-6 text-neutral-800 ${cardGlowCls}`;
  // #endregion

  return (
    <div id="wp-card" className={`${baseCardCls} ${className}`} {...props} />
  );
}
