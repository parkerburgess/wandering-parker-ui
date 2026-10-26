import { PALETTES } from "./palettes.generated";

/**
 * Palettes are defined in theme.css: every [data-palette="x"] block is one,
 * labelled by its --palette-label. scripts/gen-palettes.mjs turns those
 * blocks into PALETTES, which these types are derived from.
 */
export { PALETTES };

export type PaletteOption = (typeof PALETTES)[number];
export type Palette = PaletteOption["id"];

function findDefaultPalette(): Palette {
  // The generator guarantees exactly one default exists.
  const defaultOption = PALETTES.find((option) => option.isDefault);
  return (defaultOption ?? PALETTES[0]).id;
}

/** The palette whose rule also targets :root in theme.css. */
export const DEFAULT_PALETTE: Palette = findDefaultPalette();

export const PALETTE_IDS: readonly Palette[] = PALETTES.map(
  (option) => option.id
);

export function isPalette(value: string | null): value is Palette {
  return PALETTE_IDS.some((id) => id === value);
}
