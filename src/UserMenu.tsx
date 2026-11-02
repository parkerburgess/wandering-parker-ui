"use client";

import { useEffect, useRef, useState } from "react";
import { useSignOut } from "./useSignOut";
import { PALETTES } from "./palettes";
import type { Palette } from "./palettes";

interface ExtraMenuItem {
  label: string;
  href: string;
}

interface UserMenuProps {
  userName: string;
  extraItems?: ExtraMenuItem[];
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  palette?: Palette;
  onSelectPalette?: (next: Palette) => void;
}

export function UserMenu({
  userName,
  extraItems = [],
  theme,
  onToggleTheme,
  palette,
  onSelectPalette,
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
  const showPalettePicker = palette !== undefined && onSelectPalette !== undefined;

  // #region Tailwind utility consts
  const wrapperCls = "relative";
  // Raw --neutral rather than a neutral-* stop: those flip between light
  // and dark mode, while the palette's second color should stay put. The
  // hover uses the same 80%-with-black mix as the 700 stops.
  const triggerBtnCls =
    "size-9 rounded-full grid place-items-center text-sm font-medium " +
    "text-white bg-[var(--neutral)] " +
    "hover:bg-[color-mix(in_oklch,var(--neutral)_80%,black)] " +
    "transition cursor-pointer";
  // Same two-layer treatment as Card: a tight 1px ring plus a wide diffuse
  // halo, both in one arbitrary value since Tailwind needs the complete
  // class name in source text to generate it.
  const dropdownGlowCls =
    "shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_20%,transparent),0_0_24px_4px_color-mix(in_oklch,var(--primary)_35%,transparent)]";
  // divide-y draws a rule between each direct child, and each child is one
  // section (links, Theme, Mode, Sign out), so rows inside a section stay
  // unseparated.
  const dropdownCls =
    `absolute right-0 top-full mt-1 bg-card border border-primary-600 ` +
    `rounded-lg z-20 min-w-max overflow-hidden divide-y divide-neutral-200 ` +
    dropdownGlowCls;
  const menuItemCls =
    "block w-full text-left px-4 py-2.5 text-sm text-neutral-600 " +
    "hover:bg-neutral-50 cursor-pointer";
  const sectionLabelCls =
    "px-4 pt-2.5 pb-1 text-xs uppercase tracking-wide text-neutral-500";
  // Indented past the section label so the options read as children of
  // that section. Spelled out rather than built on menuItemCls, since pl-8
  // and that const's px-4 would conflict. The 14px lead column fits both
  // the 12px swatches and the 14px mode icons, so labels line up across
  // sections.
  const subItemBtnCls =
    "w-full text-left pl-8 pr-4 py-2.5 text-sm text-neutral-600 " +
    "hover:bg-neutral-50 cursor-pointer " +
    "grid grid-cols-[14px_1fr_14px] items-center gap-3";
  // Each swatch carries its own data-palette, which rescopes --primary to
  // that palette's raw color (see theme.css).
  const swatchCls = "size-3 rounded-full bg-[var(--primary)]";
  // #endregion

  function handleTriggerClick(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen((prev) => !prev);
  }

  // The props only expose a toggle, so picking the mode that's already
  // active is a no-op rather than flipping it back.
  function handleModeClick(nextIsDark: boolean) {
    return function selectMode(e: React.MouseEvent) {
      e.stopPropagation();
      if (nextIsDark !== isDark) {
        onToggleTheme?.();
      }
    };
  }

  function handlePaletteClick(next: Palette) {
    return function selectPalette(e: React.MouseEvent) {
      e.stopPropagation();
      onSelectPalette?.(next);
    };
  }

  return (
    <div id="wp-user-menu" ref={wrapperRef} className={wrapperCls}>
      <button
        type="button"
        onClick={handleTriggerClick}
        aria-label={userName}
        title={userName}
        className={triggerBtnCls}
      >
        {getInitials(userName)}
      </button>
      {open && (
        <div className={dropdownCls}>
          {extraItems.length > 0 && (
            <div>
              {extraItems.map((item) => (
                <a key={item.href} href={item.href} className={menuItemCls}>
                  {item.label}
                </a>
              ))}
            </div>
          )}
          {showPalettePicker && (
            <div>
              <div className={sectionLabelCls}>Theme</div>
              {PALETTES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={option.id === palette}
                  onClick={handlePaletteClick(option.id)}
                  className={subItemBtnCls}
                >
                  <span data-palette={option.id} className={swatchCls} />
                  {option.label}
                  {option.id === palette && <CheckIcon />}
                </button>
              ))}
            </div>
          )}
          {showThemeToggle && (
            <div>
              <div className={sectionLabelCls}>Mode</div>
              <button
                type="button"
                aria-pressed={!isDark}
                onClick={handleModeClick(false)}
                className={subItemBtnCls}
              >
                <SunIcon />
                Light
                {!isDark && <CheckIcon />}
              </button>
              <button
                type="button"
                aria-pressed={isDark}
                onClick={handleModeClick(true)}
                className={subItemBtnCls}
              >
                <MoonIcon />
                Dark
                {isDark && <CheckIcon />}
              </button>
            </div>
          )}
          <button type="button" onClick={signOut} className={menuItemCls}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * First letter of each of the first two words, uppercased: "Parker Burgess"
 * gives "PB", "Parker" gives "P". Each word's first letter is used rather
 * than its first character, so "(Parker)" still contributes "P".
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const initials: string[] = [];
  for (const word of words) {
    const firstLetter = word.match(/\p{L}/u);
    if (firstLetter) {
      initials.push(firstLetter[0].toUpperCase());
    }
    if (initials.length === 2) {
      break;
    }
  }
  return initials.join("");
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SunIcon() {
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

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
