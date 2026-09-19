type Color = "primary" | "success" | "warning" | "danger" | "neutral";

const colorCls: Record<Color, string> = {
  primary: "bg-primary-100 text-primary-800",
  success: "bg-success-100 text-success-800",
  warning: "bg-warning-100 text-warning-800",
  danger: "bg-danger-100 text-danger-800",
  neutral: "bg-neutral-100 text-neutral-800",
};

export function Badge({
  children,
  color = "primary",
}: {
  children: React.ReactNode;
  color?: Color;
}) {
  // #region Tailwind utility consts
  const baseBadgeCls =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  // #endregion

  return (
    <span id="wp-badge" className={`${baseBadgeCls} ${colorCls[color]}`}>
      {children}
    </span>
  );
}
