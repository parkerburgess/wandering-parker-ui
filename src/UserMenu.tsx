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
    "text-sm border border-neutral-300 rounded-lg px-3 py-1.5 " +
    "text-neutral-600 hover:bg-neutral-50 transition cursor-pointer";
  const dropdownCls =
    "absolute right-0 top-full mt-1 bg-card border border-neutral-200 " +
    "rounded-lg shadow-md z-20 min-w-max overflow-hidden";
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
    <div ref={wrapperRef} className={wrapperCls}>
      <button onClick={handleTriggerClick} className={triggerBtnCls}>
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
            <button onClick={handleThemeToggleClick} className={themeBtnCls}>
              <ThemeIcon isDark={isDark} />
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          )}
          <button onClick={signOut} className={menuItemCls}>
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
