"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useServerInsertedHTML } from "next/navigation";
import { DEFAULT_PALETTE, PALETTE_IDS, isPalette } from "./palettes";
import type { Palette } from "./palettes";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const PALETTE_STORAGE_KEY = "palette";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const THEMES: readonly Theme[] = ["light", "dark", "system"];

/**
 * The selection is persisted in cookies as well as localStorage, because
 * localStorage is per-origin and each app lives on its own subdomain. On
 * wanderingparker.com the cookies are scoped to the parent domain so every
 * app sees them; anywhere else (localhost, previews) they stay host-only.
 * Browsers ignore the port for cookies, so localhost apps share them too.
 */
const THEME_COOKIE = "wp_theme";
const PALETTE_COOKIE = "wp_palette";
const SHARED_COOKIE_DOMAIN = "wanderingparker.com";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * Applies the stored theme before React hydrates, so the first paint is
 * already correct. This is injected as raw HTML through
 * useServerInsertedHTML rather than rendered as a <script> element: React
 * 19.2 dev-errors on script tags found inside a component tree, and a
 * client-rendered script would never execute anyway.
 */
/**
 * It mirrors readStoredValue and buildCookieAttributes below in ES5, because
 * it runs as a plain string before any bundle loads. A localStorage value
 * found without a cookie is copied into the cookie, so a choice made before
 * the cookie existed still reaches the other apps.
 */
const NO_FLASH_SCRIPT = `
(function () {
  try {
    var shared = ${JSON.stringify(SHARED_COOKIE_DOMAIN)};
    var host = location.hostname;
    var isShared =
      host === shared ||
      host.slice(-(shared.length + 1)) === "." + shared;
    var attributes =
      "; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax" +
      (isShared ? "; Domain=." + shared : "") +
      (location.protocol === "https:" ? "; Secure" : "");

    function readCookie(name) {
      var match = document.cookie.match(
        new RegExp("(?:^|; )" + name + "=([^;]*)")
      );
      return match ? decodeURIComponent(match[1]) : null;
    }

    function readStored(cookieName, storageKey, allowed) {
      var fromCookie = readCookie(cookieName);
      if (allowed.indexOf(fromCookie) !== -1) {
        return fromCookie;
      }
      var fromStorage = null;
      try {
        fromStorage = localStorage.getItem(storageKey);
      } catch (error) {}
      if (allowed.indexOf(fromStorage) !== -1) {
        document.cookie =
          cookieName + "=" + encodeURIComponent(fromStorage) + attributes;
        return fromStorage;
      }
      return null;
    }

    var theme = readStored(
      ${JSON.stringify(THEME_COOKIE)},
      ${JSON.stringify(STORAGE_KEY)},
      ${JSON.stringify(THEMES)}
    );
    var isDark =
      theme === "dark" ||
      (theme !== "light" &&
        window.matchMedia(${JSON.stringify(DARK_QUERY)}).matches);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";

    var palette = readStored(
      ${JSON.stringify(PALETTE_COOKIE)},
      ${JSON.stringify(PALETTE_STORAGE_KEY)},
      ${JSON.stringify(PALETTE_IDS)}
    );
    if (palette !== null) {
      document.documentElement.setAttribute("data-palette", palette);
    }
  } catch (error) {}
})();
`;

let listeners: Array<() => void> = [];

/**
 * Write-through cache of the selection. localStorage can be unavailable
 * (private mode, blocked cookies), and without this the toggle would appear
 * to do nothing there: the write would fail and every read would keep
 * returning the old value.
 */
let inMemoryTheme: Theme | undefined;
let inMemoryPalette: Palette | undefined;

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function readCookie(name: string): string | null {
  try {
    const prefix = `${name}=`;
    for (const pair of document.cookie.split("; ")) {
      if (pair.startsWith(prefix)) {
        return decodeURIComponent(pair.slice(prefix.length));
      }
    }
  } catch {
    // Cookies can be blocked (e.g. sandboxed frames); treat as unset.
  }
  return null;
}

function isSharedHost(hostname: string): boolean {
  return (
    hostname === SHARED_COOKIE_DOMAIN ||
    hostname.endsWith(`.${SHARED_COOKIE_DOMAIN}`)
  );
}

function buildCookieAttributes(): string {
  const domain = isSharedHost(location.hostname)
    ? `; Domain=.${SHARED_COOKIE_DOMAIN}`
    : "";
  const secure = location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${domain}${secure}`;
}

function writeCookie(name: string, value: string): void {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}${buildCookieAttributes()}`;
  } catch {
    // Unpersisted across apps, but localStorage and memory still hold it.
  }
}

function readLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    // No readable storage just means there is no saved preference.
    return null;
  }
}

/**
 * The shared cookie wins; localStorage is the fallback for preferences
 * saved before the cookie existed. An unrecognized value in either place
 * is skipped rather than trusted.
 */
function readStoredValue<T extends string>(
  cookieName: string,
  storageKey: string,
  isValid: (value: string | null) => value is T
): T | null {
  const fromCookie = readCookie(cookieName);
  if (isValid(fromCookie)) {
    return fromCookie;
  }
  const fromStorage = readLocalStorage(storageKey);
  if (isValid(fromStorage)) {
    return fromStorage;
  }
  return null;
}

function isTheme(value: string | null): value is Theme {
  return THEMES.includes(value as Theme);
}

function readStoredTheme(): Theme {
  if (inMemoryTheme !== undefined) {
    return inMemoryTheme;
  }
  return readStoredValue(THEME_COOKIE, STORAGE_KEY, isTheme) ?? "system";
}

function readSystemIsDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

function resolveTheme(theme: Theme, systemIsDark: boolean): ResolvedTheme {
  if (theme === "system") {
    return systemIsDark ? "dark" : "light";
  }
  return theme;
}

function applyToDocument(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

function syncDocumentToStoredTheme(): void {
  applyToDocument(resolveTheme(readStoredTheme(), readSystemIsDark()));
}

function readStoredPalette(): Palette {
  if (inMemoryPalette !== undefined) {
    return inMemoryPalette;
  }
  return (
    readStoredValue(PALETTE_COOKIE, PALETTE_STORAGE_KEY, isPalette) ??
    DEFAULT_PALETTE
  );
}

function syncDocumentToStoredPalette(): void {
  document.documentElement.setAttribute("data-palette", readStoredPalette());
}

function handleExternalChange(): void {
  // Another tab may have written a new preference, so the cached selection
  // is no longer authoritative.
  inMemoryTheme = undefined;
  inMemoryPalette = undefined;
  syncDocumentToStoredTheme();
  syncDocumentToStoredPalette();
  notifyListeners();
}

/**
 * A change made in another app's tab updates the shared cookie but fires no
 * event here (the storage event is per-origin, and there is no portable
 * cookie-change event), so the selection is re-read on returning to the tab.
 */
function handleVisibilityChange(): void {
  if (document.visibilityState === "visible") {
    handleExternalChange();
  }
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.push(onStoreChange);
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", handleExternalChange);
  // Fires only in OTHER tabs, which is exactly the cross-tab sync we want.
  window.addEventListener("storage", handleExternalChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return function unsubscribe() {
    listeners = listeners.filter((listener) => listener !== onStoreChange);
    media.removeEventListener("change", handleExternalChange);
    window.removeEventListener("storage", handleExternalChange);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

function getResolvedSnapshot(): ResolvedTheme {
  return resolveTheme(readStoredTheme(), readSystemIsDark());
}

/**
 * The server cannot know the theme, so it reports undefined and consumers
 * render their theme-dependent UI as inert. React also uses this during
 * hydration, which is what keeps the markup matching; the real value
 * arrives on the first post-hydration render.
 */
function getServerResolvedSnapshot(): undefined {
  return undefined;
}

type ThemeContextValue = {
  theme: Theme | undefined;
  resolvedTheme: ResolvedTheme | undefined;
  setTheme: (next: Theme) => void;
  palette: Palette | undefined;
  setPalette: (next: Palette) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(function insertNoFlashScript() {
    return (
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }}
      />
    );
  });

  const resolvedTheme = useSyncExternalStore(
    subscribe,
    getResolvedSnapshot,
    getServerResolvedSnapshot
  );

  const setTheme = useCallback(function applySelectedTheme(next: Theme) {
    inMemoryTheme = next;
    writeCookie(THEME_COOKIE, next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Unpersisted, but the page still changes for this session.
    }
    syncDocumentToStoredTheme();
    notifyListeners();
  }, []);

  const palette = useSyncExternalStore(
    subscribe,
    readStoredPalette,
    getServerResolvedSnapshot
  );

  const setPalette = useCallback(function applySelectedPalette(next: Palette) {
    inMemoryPalette = next;
    writeCookie(PALETTE_COOKIE, next);
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, next);
    } catch {
      // Unpersisted, but the page still changes for this session.
    }
    syncDocumentToStoredPalette();
    notifyListeners();
  }, []);

  const value = useMemo(
    function buildContextValue(): ThemeContextValue {
      return {
        theme: resolvedTheme === undefined ? undefined : readStoredTheme(),
        resolvedTheme,
        setTheme,
        palette,
        setPalette,
      };
    },
    [resolvedTheme, setTheme, palette, setPalette]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === undefined) {
    throw new Error("useTheme must be used inside a ThemeProvider");
  }
  return value;
}
