"use client";

import { useState, InputHTMLAttributes } from "react";

export function PasswordInput({
  label,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const [show, setShow] = useState(false);

  // #region Tailwind utility consts
  const wrapperCls = "space-y-1";
  const labelCls = "block text-sm font-medium text-neutral-700";
  const inputWrapperCls = "relative";
  const baseInputCls =
    "w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg placeholder-neutral-400 " +
    "focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent";
  const errorInputCls = "border-incorrect-500";
  const toggleBtnCls =
    "absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 " +
    "hover:text-neutral-700 text-sm px-1 cursor-pointer";
  const errorTextCls = "text-sm text-incorrect-600";
  // #endregion

  return (
    <div className={wrapperCls}>
      {label && (
        <label htmlFor={props.id} className={labelCls}>
          {label}
        </label>
      )}
      <div className={inputWrapperCls}>
        <input
          type={show ? "text" : "password"}
          className={`${baseInputCls} ${error ? errorInputCls : ""} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className={toggleBtnCls}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className={errorTextCls}>{error}</p>}
    </div>
  );
}
