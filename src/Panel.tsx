/**
 * A titled column with its own scrolling body, for layouts where each column
 * scrolls independently rather than dragging the whole page.
 *
 * Expects a height-bounded parent — a grid track sized `minmax(0,1fr)` inside
 * a viewport-height page. Dropped into ordinary page flow it has nothing to
 * size against and the body will collapse.
 */
export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  // #region Tailwind utility consts
  const panelCls = "grid grid-rows-[auto_1fr] min-h-0 h-full gap-3";
  const titleCls =
    "text-sm font-semibold uppercase tracking-wide text-neutral-500";
  // A scrollbar eats into the content box on one side only, which leaves
  // children flush against the left edge but inset on the right. Reserving the
  // gutter on both edges keeps that inset symmetric whether or not the
  // scrollbar is actually showing, so content never shifts as the list grows.
  const bodyCls =
    "grid content-start gap-3 min-h-0 overflow-y-auto " +
    "[scrollbar-gutter:stable_both-edges] [scrollbar-width:thin]";
  // #endregion

  return (
    <section id="wp-panel" className={panelCls}>
      <h2 className={titleCls}>{title}</h2>
      <div className={bodyCls}>{children}</div>
    </section>
  );
}
