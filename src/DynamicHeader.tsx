// Keyboard-tile wordmark: renders `text` as one key tile per character,
// themed with the palette tokens so it follows light/dark and the active
// palette. Each app passes its own text; the rendering rules are shared.
export type DynamicHeaderAccent = "word-initials" | "first" | "none";

export interface DynamicHeaderProps {
  text: string;
  accent?: DynamicHeaderAccent;
  className?: string;
}

const FONT_STYLE = { fontFamily: '"Arial Black", "Arial", sans-serif' };

// Which tile gets the primary accent, by the chosen rule.
function isAccentTile(
  accent: DynamicHeaderAccent,
  wordIndex: number,
  charIndex: number,
): boolean {
  if (accent === "none") return false;
  if (accent === "first") return wordIndex === 0 && charIndex === 0;
  return charIndex === 0;
}

export function DynamicHeader({ text, accent = "word-initials", className }: DynamicHeaderProps) {
  // #region Tailwind utility consts
  // Sized in `em` so the whole mark scales from one font-size set via
  // className; gaps are a constant typographic length, not width-relative.
  const rootCls = `inline-flex items-center gap-[0.9em] leading-none ${className ?? ""}`;
  const wordCls = "inline-flex items-center gap-[0.35em]";
  const tileBaseCls =
    "grid place-items-center w-[1.7em] h-[1.7em] rounded-[0.18em] border text-[0.95em]";
  // neutral-50/900 both flip under html.dark, so the tile stays legible in
  // both modes.
  const neutralTileCls = `${tileBaseCls} bg-neutral-50 text-neutral-900 border-neutral-300`;
  // primary-fill / primary-foreground are the mode-stable, AA-checked pair.
  const accentTileCls = `${tileBaseCls} bg-primary-fill text-primary-foreground border-primary-fill`;
  // #endregion

  const words = text.trim().split(/\s+/);

  return (
    <span
      id="wp-dynamic-header"
      className={rootCls}
      style={FONT_STYLE}
      role="img"
      aria-label={text}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className={wordCls} aria-hidden="true">
          {Array.from(word).map((char, charIndex) => (
            <span
              key={charIndex}
              className={
                isAccentTile(accent, wordIndex, charIndex) ? accentTileCls : neutralTileCls
              }
            >
              {char.toUpperCase()}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
