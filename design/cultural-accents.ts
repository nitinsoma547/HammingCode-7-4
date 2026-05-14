/**
 * SVG path data for cultural accent motifs.
 *
 * Each entry is a single-color line motif designed to be rendered at
 * 15-25% opacity in a corner or as a section divider. Never full-bleed.
 *
 * viewBox is "0 0 200 200" for all. Use `currentColor` in the path so
 * the accent inherits the brand primary color.
 */

export type AccentKind = "rangoli" | "banana-leaf" | "mehendi" | "diya";

export const accentPaths: Record<AccentKind, string> = {
  // Simplified rangoli — radial petal motif
  rangoli: `
    M100,20 L110,90 L180,100 L110,110 L100,180 L90,110 L20,100 L90,90 Z
    M100,40 L106,94 L160,100 L106,106 L100,160 L94,106 L40,100 L94,94 Z
  `.trim(),
  // Banana leaf silhouette
  "banana-leaf": `
    M40,100 C40,40 100,20 160,40 C170,60 170,140 160,160 C100,180 40,160 40,100 Z
    M50,100 L150,100 M60,80 L140,80 M70,120 L130,120
  `.trim(),
  // Mehendi paisley
  mehendi: `
    M100,40 C140,40 160,80 140,120 C130,140 110,150 100,140 C90,150 70,140 60,120 C40,80 60,40 100,40 Z
    M100,60 C120,60 130,80 120,100 M100,80 C110,80 115,90 110,100
  `.trim(),
  // Diya (oil lamp)
  diya: `
    M50,120 C50,140 70,150 100,150 C130,150 150,140 150,120 L140,110 L60,110 Z
    M95,90 C95,100 105,100 105,90 C105,85 100,75 100,75 C100,75 95,85 95,90 Z
  `.trim(),
};

export const accentMeta: Record<AccentKind, { label: string; defaultFor: string[] }> = {
  rangoli: { label: "Rangoli", defaultFor: ["spice-shop", "grocery", "festival-diwali"] },
  "banana-leaf": { label: "Banana leaf", defaultFor: ["south-indian-veg", "restaurant-kerala"] },
  mehendi: { label: "Mehendi paisley", defaultFor: ["salon", "mehendi-artist"] },
  diya: { label: "Diya", defaultFor: ["festival-diwali", "festival-karva-chauth"] },
};
