"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useServerInsertedHTML } from "next/navigation";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Applies the stored theme before React hydrates, so the first paint is
 * already correct. This is injected as raw HTML through
 * useServerInsertedHTML rather than rendered as a <script> element: React
 * 19.2 dev-errors on script tags found inside a component tree, and a
 * client-rendered script would never execute anyway.
 */
const NO_FLASH_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var isDark =
      stored === "dark" ||
      ((!stored || stored === "system") &&
        window.matchMedia(${JSON.stringify(DARK_QUERY)}).matches);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
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

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

function readStoredTheme(): Theme {
  if (inMemoryTheme !== undefined) {
    return inMemoryTheme;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // No readable storage just means there is no saved preference.
  }
  return "system";
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

function handleExternalChange(): void {
  // Another tab may have written a new preference, so the cached selection
  // is no longer authoritative.
  inMemoryTheme = undefined;
  syncDocumentToStoredTheme();
  notifyListeners();
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.push(onStoreChange);
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", handleExternalChange);
  // Fires only in OTHER tabs, which is exactly the cross-tab sync we want.
  window.addEventListener("storage", handleExternalChange);

  return function unsubscribe() {
    listeners = listeners.filter((listener) => listener !== onStoreChange);
    media.removeEventListener("change", handleExternalChange);
    window.removeEventListener("storage", handleExternalChange);
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
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Unpersisted, but the page still changes for this session.
    }
    syncDocumentToStoredTheme();
    notifyListeners();
  }, []);

  const value = useMemo(
    function buildContextValue(): ThemeContextValue {
      return {
        theme: resolvedTheme === undefined ? undefined : readStoredTheme(),
        resolvedTheme,
        setTheme,
      };
    },
    [resolvedTheme, setTheme]
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
