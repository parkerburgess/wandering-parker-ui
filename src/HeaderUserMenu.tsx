"use client";

import { UserMenu } from "./UserMenu";
import { useTheme } from "./ThemeProvider";

interface HeaderUserMenuProps {
  userName: string;
}

// Header stays a server component; the theme toggle and palette picker need
// useTheme, so the menu lives in this small client island.
export function HeaderUserMenu({ userName }: HeaderUserMenuProps) {
  const { resolvedTheme, setTheme, palette, setPalette } = useTheme();

  function handleToggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <UserMenu
      userName={userName}
      theme={resolvedTheme}
      onToggleTheme={handleToggleTheme}
      palette={palette}
      onSelectPalette={setPalette}
    />
  );
}
