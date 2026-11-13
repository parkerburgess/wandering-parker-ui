import Link from "next/link";
import { SiteNav } from "./SiteNav";
import type { SiteNavItem } from "./SiteNav";
import { DynamicBanner } from "./DynamicBanner";
import { HeaderUserMenu } from "./HeaderUserMenu";

const DEFAULT_CONTACT_EMAIL = "parkerburgess@outlook.com";

export interface HeaderProps {
  userName?: string;
  brandText: string;
  brandHref?: string;
  navItems: SiteNavItem[];
  headerBgCls?: string;
  /** Address for the "Contact Me" item that ends every app's nav. */
  contactEmail?: string;
}

export function Header({
  userName,
  brandText,
  brandHref = "/",
  navItems,
  headerBgCls = "bg-[lightslategray]",
  contactEmail = DEFAULT_CONTACT_EMAIL,
}: HeaderProps) {
  const contactItem: SiteNavItem = {
    label: "Contact Me",
    href: `mailto:${contactEmail}`,
    align: "end",
  };
  const siteNavItems = [...navItems, contactItem];

  // #region Tailwind utility consts
  const headerCls = `${headerBgCls} sticky top-0 z-50`;
  // @container makes this the sizing reference for the banner's cqi units.
  const innerCls =
    "@container max-w-6xl mx-auto px-4 py-4 grid grid-cols-[1fr_auto_1fr] items-center";
  const brandCls = "col-start-2 block cursor-pointer";
  // Font-size scales with the header width (cqi) so the 15 tiles always fit
  // on one line, down to a floor on phones and capped so desktop is unchanged.
  const wordmarkCls = "text-[clamp(0.5rem,3.1cqi,2rem)]";
  const menuSlotCls = "justify-self-end";
  // #endregion

  return (
    <header className={headerCls}>
      <div className={innerCls}>
        <Link href={brandHref} className={brandCls}>
          <DynamicBanner text={brandText} className={wordmarkCls} />
        </Link>
        <div className={menuSlotCls}>
          {userName && <HeaderUserMenu userName={userName} />}
        </div>
      </div>
      {/* Signed-out visitors only see login/register, so nothing to navigate. */}
      {userName && <SiteNav items={siteNavItems} />}
    </header>
  );
}
