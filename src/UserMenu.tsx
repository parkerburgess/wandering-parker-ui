"use client";

import { useEffect, useRef, useState } from "react";
import { useSignOut } from "./useSignOut";

interface ExtraMenuItem {
  label: string;
  href: string;
}

interface UserMenuProps {
  userName: string;
  extraItems?: ExtraMenuItem[];
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export function UserMenu({
  userName,
  extraItems = [],
  theme,
  onToggleTheme,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const signOut = useSignOut();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showThemeToggle = theme !== undefined && onToggleTheme !== undefined;
  const isDark = theme === "dark";

  // #region Tailwind utility consts
  const wrapperCls = "relative";
  const triggerBtnCls =
    "text-sm border border-primary-600 rounded-lg px-3 py-1.5 " +
    "text-neutral-600 hover:bg-neutral-50 transition cursor-pointer";
  // Same two-layer treatment as Card: a tight 1px ring plus a wide diffuse
  // halo, both in one arbitrary value since Tailwind needs the complete
  // class name in source text to generate it.
  const dropdownGlowCls =
    "shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_20%,transparent),0_0_24px_4px_color-mix(in_oklch,var(--primary)_35%,transparent)]";
  const dropdownCls =
    `absolute right-0 top-full mt-1 bg-card border border-primary-600 ` +
    `rounded-lg z-20 min-w-max overflow-hidden ${dropdownGlowCls}`;
  const menuItemCls =
    "block w-full text-left px-4 py-2.5 text-sm text-neutral-600 " +
    "hover:bg-neutral-50 cursor-pointer";
  const themeBtnCls = `${menuItemCls} flex items-center gap-3`;
  // #endregion

  function handleTriggerClick(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen((prev) => !prev);
  }

  function handleThemeToggleClick(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleTheme?.();
  }

  return (
    <div id="wp-user-menu" ref={wrapperRef} className={wrapperCls}>
      <button type="button" onClick={handleTriggerClick} className={triggerBtnCls}>
        {userName}
      </button>
      {open && (
        <div className={dropdownCls}>
          {extraItems.map((item) => (
            <a key={item.href} href={item.href} className={menuItemCls}>
              {item.label}
            </a>
          ))}
          {showThemeToggle && (
            <button type="button" onClick={handleThemeToggleClick} className={themeBtnCls}>
              <ThemeIcon isDark={isDark} />
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          )}
          <button type="button" onClick={signOut} className={menuItemCls}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function ThemeIcon({ isDark }: { isDark: boolean }) {
  if (isDark) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
