/**
 * Aditi's Kitchen — brand profile (applied output of brand-strategist).
 *
 * This file is the single source of truth for everything visible on
 * the marketing site. Edit here, not in the components.
 *
 * Fields marked TODO must be filled with real values before launch.
 */

import type { AccentKind } from "@/lib/cultural-accents";

export type Hours = {
  mon: string | null;
  tue: string | null;
  wed: string | null;
  thu: string | null;
  fri: string | null;
  sat: string | null;
  sun: string | null;
};

export type Location = {
  label: string;
  address: string;
  phone: string;
  hours: Hours;
  mapsUrl: string | null;
};

export type MenuItem = {
  name: string;
  price: string;
  note?: string;
};

export type MenuCategory = {
  title: string;
  items: MenuItem[];
};

export const brand = {
  slug: "aditis-kitchen",
  name: "Aditi's Kitchen",
  parallelLabel: "അദിതിയുടെ അടുക്കള", // Malayalam: "Aditi's Kitchen"
  category: "South Indian vegetarian",
  primaryCommunity: "south-indian-kerala",
  tagline: "Real South Indian. Fresh dosas. Open Tuesday through Sunday.",
  shortIntro:
    "A family-run kitchen in Ashburn — dosas on a hot tava, idli steamed in the morning, filter coffee poured strong. Recipes from Aditi's amma, kept the same way for twenty years.",
  toneKeywords: ["warm", "family-run", "specific", "Kerala-rooted"],
  signatureItems: [
    {
      name: "Mysore Masala Dosa",
      price: "$11.99",
      note: "16-hour fermented batter, fresh-ground red masala, ghee-roasted",
    },
    {
      name: "Ghee Roast",
      price: "$10.99",
      note: "Crisp, golden, served with three chutneys and sambar",
    },
    {
      name: "Parippuvada",
      price: "$4.99",
      note: "Kerala lentil fritters, fried every two hours — runs out by 7pm",
    },
  ],
  menu: [
    {
      title: "Dosas",
      items: [
        { name: "Plain Dosa", price: "$7.99" },
        { name: "Masala Dosa", price: "$9.99" },
        { name: "Mysore Masala Dosa", price: "$11.99", note: "16-hour fermented batter" },
        { name: "Ghee Roast Dosa", price: "$10.99" },
        { name: "Onion Rava Dosa", price: "$10.99", note: "Crispy semolina, no fermentation" },
      ],
    },
    {
      title: "Idli, vada & tiffin",
      items: [
        { name: "Idli (3 pcs)", price: "$6.99" },
        { name: "Medu Vada (2 pcs)", price: "$5.99" },
        { name: "Parippuvada (4 pcs)", price: "$4.99", note: "Kerala lentil fritters" },
        { name: "Poori Masala", price: "$9.99" },
        { name: "Ven Pongal", price: "$8.99", note: "Black pepper, cumin, ghee" },
        { name: "Upma", price: "$7.99" },
      ],
    },
    {
      title: "Rice & curries",
      items: [
        { name: "Sambar Rice", price: "$9.99" },
        { name: "Lemon Rice", price: "$8.99" },
        { name: "Curd Rice", price: "$8.99" },
        { name: "Avial", price: "$8.99", note: "Kerala-style mixed vegetable in coconut" },
      ],
    },
    {
      title: "Beverages",
      items: [
        { name: "Filter Coffee", price: "$3.50", note: "Pulled strong, served in a tumbler" },
        { name: "Masala Chai", price: "$3.00" },
        { name: "Sweet Lassi", price: "$4.50" },
        { name: "Salted Lassi", price: "$4.50" },
        { name: "Tender Coconut", price: "$4.00" },
      ],
    },
  ] as MenuCategory[],
  locations: [
    {
      label: "Ashburn",
      // TODO: confirm street address with owner
      address: "43880 Russell Branch Pkwy, Ashburn, VA 20147",
      // TODO: replace with real phone
      phone: "(703) 555-0142",
      hours: {
        mon: null,
        tue: "11:00 AM – 9:00 PM",
        wed: "11:00 AM – 9:00 PM",
        thu: "11:00 AM – 9:00 PM",
        fri: "11:00 AM – 9:00 PM",
        sat: "11:00 AM – 9:00 PM",
        sun: "11:00 AM – 9:00 PM",
      },
      mapsUrl: null, // TODO: paste Google Maps share URL
    },
  ] as Location[],
  palette: {
    primary: "#2F5D3A", // Kerala green
    accent: "#C97B3A", // saffron — festival pushes only
    neutral: "#F5EFE6", // warm offwhite
    ink: "#1F2421",
  },
  culturalAccent: "banana-leaf" as AccentKind,
  culturalHooks: ["Onam", "Vishu", "Diwali"],
  doNotSay: [
    "delicious authentic cuisine",
    "best in town",
    "you'll love it",
    "come check us out",
    "experience the flavor",
    "a culinary journey",
    "true taste of India",
  ],
  links: {
    instagram: null, // TODO
    facebook: null,
    googleMaps: null,
  },
} as const;

export type Brand = typeof brand;
