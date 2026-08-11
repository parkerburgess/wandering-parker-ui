import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantCls: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-neutral-200 text-neutral-800 hover:bg-neutral-300",
  danger: "bg-incorrect-600 text-white hover:bg-incorrect-700",
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
