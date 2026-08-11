import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  // #region Tailwind utility consts
  const baseCardCls = "bg-card rounded-xl shadow-sm border border-neutral-200 p-6";
  // #endregion

  return <div className={`${baseCardCls} ${className}`} {...props} />;
}
