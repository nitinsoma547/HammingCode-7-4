/**
 * Shared font setup for client sites.
 *
 * Source Serif 4 — display + headings (OFL)
 * Inter — body (OFL)
 *
 * Devanagari / Tamil / Malayalam sub-labels render via system fonts —
 * no @font-face declarations. Modern Android + iOS have native support
 * and bundling adds significant weight for a 4-character accent.
 */

import { Source_Serif_4, Inter } from "next/font/google";

export const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-serif",
});

export const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-sans",
});

export const fontVars = `${serif.variable} ${sans.variable}`;
