type Color = "brand" | "correct" | "caution" | "incorrect" | "neutral";

const colorCls: Record<Color, string> = {
  brand: "bg-brand-100 text-brand-800",
  correct: "bg-correct-100 text-correct-800",
  caution: "bg-caution-100 text-caution-800",
  incorrect: "bg-incorrect-100 text-incorrect-700",
  neutral: "bg-neutral-100 text-neutral-800",
};

export function Badge({
  children,
  color = "brand",
}: {
  children: React.ReactNode;
  color?: Color;
}) {
  // #region Tailwind utility consts
  const baseBadgeCls =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  // #endregion

  return <span className={`${baseBadgeCls} ${colorCls[color]}`}>{children}</span>;
}
