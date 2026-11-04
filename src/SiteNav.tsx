"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SiteNavItem {
  label: string;
  href: string;
  /**
   * "exact" (default) marks the item current only on its own path.
   * "prefix" also marks it current on nested paths, so "/sessions" stays
   * highlighted on "/sessions/12".
   */
  match?: "exact" | "prefix";
}

interface SiteNavProps {
  items: SiteNavItem[];
}

// Client component only so usePathname can mark the current page.
export function SiteNav({ items }: SiteNavProps) {
  const pathname = usePathname();

  // #region Tailwind utility consts
  const navCls = "bg-neutral-100 border-b border-neutral-400";
  const innerCls =
    "max-w-6xl mx-auto px-4 grid grid-flow-col auto-cols-max gap-8";
  const linkBaseCls =
    "py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer";
  const activeLinkCls = `${linkBaseCls} border-primary-600 text-neutral-900`;
  const inactiveLinkCls =
    `${linkBaseCls} border-transparent text-neutral-600 ` +
    "hover:text-neutral-900";
  // #endregion

  return (
    <nav id="wp-site-nav" className={navCls}>
      <div className={innerCls}>
        {items.map((item) => {
          const isActive = isItemActive(item, pathname);
          const linkCls = isActive ? activeLinkCls : inactiveLinkCls;
          const ariaCurrent = isActive ? "page" : undefined;

          // Other apps live on their own subdomains (and Contact links are
          // mailto:), so next/link's client-side routing doesn't apply.
          if (isExternalHref(item.href)) {
            return (
              <a key={item.href} href={item.href} className={linkCls}>
                {item.label}
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={linkCls}
              aria-current={ariaCurrent}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * True for anything with a scheme ("https:", "mailto:") or a
 * protocol-relative "//host" — i.e. not a path inside this app.
 */
function isExternalHref(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
}

/**
 * External links are never current. "/" is always matched exactly, since
 * every path would otherwise count as nested under it.
 */
function isItemActive(item: SiteNavItem, pathname: string): boolean {
  if (isExternalHref(item.href)) {
    return false;
  }
  if (pathname === item.href) {
    return true;
  }
  if (item.match !== "prefix" || item.href === "/") {
    return false;
  }
  const prefix = item.href.endsWith("/") ? item.href : `${item.href}/`;
  return pathname.startsWith(prefix);
}
