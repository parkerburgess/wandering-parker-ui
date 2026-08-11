import { TextareaHTMLAttributes } from "react";

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  // #region Tailwind utility consts
  const wrapperCls = "space-y-1";
  const labelCls = "block text-sm font-medium text-neutral-700";
  const baseTextareaCls =
    "w-full px-3 py-2 border border-neutral-300 rounded-lg placeholder-neutral-400 " +
    "focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent";
  const errorTextareaCls = "border-incorrect-500";
  const errorTextCls = "text-sm text-incorrect-600";
  // #endregion

  return (
    <div className={wrapperCls}>
      {label && (
        <label htmlFor={props.id} className={labelCls}>
          {label}
        </label>
      )}
      <textarea
        className={`${baseTextareaCls} ${error ? errorTextareaCls : ""} ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className={errorTextCls}>{error}</p>}
    </div>
  );
}
