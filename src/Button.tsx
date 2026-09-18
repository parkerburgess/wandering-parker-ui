import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantCls: Record<Variant, string> = {
  primary: "bg-primary-700 text-primary-foreground hover:bg-primary-800",
  secondary: "bg-neutral-200 text-neutral-800 hover:bg-neutral-300",
  danger: "bg-danger-700 text-danger-foreground hover:bg-danger-800",
  ghost: "text-neutral-600 hover:bg-neutral-100",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  // #region Tailwind utility consts
  const baseBtnCls =
    "px-4 py-2 rounded-lg font-medium transition-colors " +
    "disabled:opacity-50 disabled:cursor-not-allowed";
  // #endregion

  return (
    <button
      className={`${baseBtnCls} ${variantCls[variant]} ${className}`}
      {...props}
    />
  );
}
