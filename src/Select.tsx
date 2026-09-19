import { SelectHTMLAttributes } from "react";

export function Select({
  label,
  error,
  options,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: readonly string[];
}) {
  // #region Tailwind utility consts
  const wrapperCls = "space-y-1";
  const labelCls = "block text-sm font-medium text-neutral-700";
  const baseSelectCls =
    "w-full px-3 py-2 border border-primary-600 rounded-lg bg-card " +
    "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent " +
    "disabled:bg-neutral-200 disabled:text-neutral-500 disabled:cursor-not-allowed";
  const errorSelectCls = "border-danger-600";
  const errorTextCls = "text-sm text-danger-700";
  // #endregion

  return (
    <div id="wp-select" className={wrapperCls}>
      {label && (
        <label htmlFor={props.id} className={labelCls}>
          {label}
        </label>
      )}
      <select
        className={`${baseSelectCls} ${error ? errorSelectCls : ""} ${className}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className={errorTextCls}>{error}</p>}
    </div>
  );
}
