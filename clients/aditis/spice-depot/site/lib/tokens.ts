/**
 * Shared design tokens for client marketing sites.
 *
 * Per-client palette overrides come from `brand_profile.visual_palette`
 * and are applied as CSS custom properties on <html> in each site's
 * app/layout.tsx.
 */

export const tokens = {
  // Default palette (warm offwhite + graphite). Each client overrides
  // primary + accent in their brand profile.
  palette: {
    neutral: "#F5EFE6",
    ink: "#1F2421",
    inkSoft: "#3A413D",
    line: "#E3DCD0",
    primary: "#2F5D3A",
    accent: "#C97B3A",
    danger: "#B33A3A",
  },
  type: {
    serif: "var(--font-serif), Georgia, 'Times New Roman', serif",
    sans: "var(--font-sans), system-ui, -apple-system, sans-serif",
    scale: {
      xs: "0.8125rem",
      sm: "0.9375rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.375rem",
      "2xl": "1.75rem",
      "3xl": "2.25rem",
      "4xl": "3rem",
      "5xl": "4rem",
      "6xl": "5.5rem",
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    leading: {
      tight: 1.05,
      snug: 1.2,
      normal: 1.5,
      relaxed: 1.65,
    },
    tracking: {
      tight: "-0.02em",
      normal: "0",
      wide: "0.04em",
      wider: "0.08em",
    },
  },
  space: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    32: "8rem",
  },
  radius: {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    pill: "9999px",
  },
  shadow: {
    // Subtle. Never use for headline text.
    sm: "0 1px 2px rgba(31, 36, 33, 0.06)",
    md: "0 4px 12px rgba(31, 36, 33, 0.08)",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
} as const;

export type Palette = typeof tokens.palette;
export type BrandPaletteOverride = Partial<Pick<Palette, "primary" | "accent" | "neutral" | "ink">>;
