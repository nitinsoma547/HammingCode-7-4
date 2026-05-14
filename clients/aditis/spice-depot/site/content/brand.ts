/**
 * Aditi's Spice Depot — brand profile (applied output of brand-strategist).
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

export type Product = {
  name: string;
  price: string;
  note?: string;
};

export type CatalogCategory = {
  title: string;
  items: Product[];
};

export type Promo = {
  label: string;
  message: string;
};

const everyday: Hours = {
  mon: "10:00 AM – 9:00 PM",
  tue: "10:00 AM – 9:00 PM",
  wed: "10:00 AM – 9:00 PM",
  thu: "10:00 AM – 9:00 PM",
  fri: "10:00 AM – 9:00 PM",
  sat: "10:00 AM – 9:00 PM",
  sun: "10:00 AM – 9:00 PM",
};

export const brand = {
  slug: "aditis-spice-depot",
  name: "Aditi's Spice Depot",
  parallelLabel: "अदिति का मसाला घर", // Hindi: "Aditi's Spice House"
  category: "spice-grocery",
  primaryCommunity: "pan-south-asian",
  tagline: "Whole spices, fresh ground. Two Loudoun locations.",
  shortIntro:
    "We grind cardamom, cumin, and coriander in the back of the shop — never more than two days old. Two stores: Ashburn and Herndon, open every day.",
  toneKeywords: ["warm", "specific", "owner-operated", "ingredient-led"],
  featuredProducts: [
    {
      name: "Idukki green cardamom (whole)",
      price: "$14.99 / 100g",
      note: "Bangalore market grade, not export",
    },
    {
      name: "Hand-ground sambar masala",
      price: "$8.99 / 100g",
      note: "Ground fresh every Tuesday, 18 spices",
    },
    {
      name: "Basmati rice (1121 long grain)",
      price: "$24.99 / 10 lb",
      note: "Aged 18 months, 8mm-plus grain",
    },
  ],
  catalog: [
    {
      title: "Whole spices",
      items: [
        { name: "Green cardamom", price: "TODO" },
        { name: "Black cardamom", price: "TODO" },
        { name: "Cinnamon sticks", price: "TODO" },
        { name: "Cloves", price: "TODO" },
        { name: "Star anise", price: "TODO" },
        { name: "Bay leaves", price: "TODO" },
        { name: "Fennel seeds", price: "TODO" },
        { name: "Fenugreek", price: "TODO" },
      ],
    },
    {
      title: "Ground spices",
      items: [
        { name: "Turmeric", price: "TODO" },
        { name: "Red chili", price: "TODO" },
        { name: "Coriander", price: "TODO" },
        { name: "Cumin", price: "TODO" },
        { name: "Garam masala", price: "TODO", note: "Aditi's blend, ground in store" },
        { name: "Sambar masala", price: "TODO", note: "Aditi's blend, 18 spices, fresh Tuesday" },
        { name: "Rasam powder", price: "TODO" },
        { name: "MDH brands", price: "TODO", note: "Full shelf of packaged classics" },
      ],
    },
    {
      title: "Rice & flour",
      items: [
        { name: "Basmati 1121", price: "TODO", note: "Aged 18 months" },
        { name: "Sona masuri", price: "TODO" },
        { name: "Idli rice", price: "TODO" },
        { name: "Atta (Aashirvaad / Pillsbury)", price: "TODO" },
        { name: "Besan (gram flour)", price: "TODO" },
        { name: "Rava (semolina)", price: "TODO" },
      ],
    },
    {
      title: "Lentils & beans",
      items: [
        { name: "Toor dal", price: "TODO" },
        { name: "Moong dal", price: "TODO" },
        { name: "Urad dal", price: "TODO" },
        { name: "Chana dal", price: "TODO" },
        { name: "Masoor dal", price: "TODO" },
        { name: "Chickpeas (kabuli & kala chana)", price: "TODO" },
        { name: "Kidney beans (rajma)", price: "TODO" },
      ],
    },
    {
      title: "Snacks & ready-to-eat",
      items: [
        { name: "Haldiram's", price: "TODO", note: "Full range — namkeen, bhujia, sweets" },
        { name: "Bikaji", price: "TODO" },
        { name: "MTR ready meals", price: "TODO", note: "Heat-and-eat pouches" },
        { name: "Maggi", price: "TODO", note: "Masala, atta, oats variants" },
      ],
    },
    {
      title: "Sweets",
      items: [
        { name: "Gulab jamun", price: "TODO" },
        { name: "Soan papdi", price: "TODO" },
        { name: "Rasgulla", price: "TODO" },
        { name: "Kaju katli", price: "TODO", note: "Festival season only — Diwali / Holi / Eid" },
      ],
    },
  ] as CatalogCategory[],
  locations: [
    {
      label: "Ashburn",
      // TODO: confirm street address with owner
      address: "43880 Russell Branch Pkwy, Ashburn, VA 20147",
      // TODO: replace with real phone
      phone: "(703) 555-0142",
      hours: everyday,
      mapsUrl: null, // TODO: paste Google Maps share URL
    },
    {
      label: "Herndon",
      // TODO: confirm street address with owner
      address: "2465 Centreville Rd, Herndon, VA 20171",
      // TODO: replace with real phone
      phone: "(703) 555-0287",
      hours: everyday,
      mapsUrl: null, // TODO: paste Google Maps share URL
    },
  ] as Location[],
  promo: {
    label: "Spring Sale",
    message: "10% off all whole spices through May 31.",
  } as Promo,
  palette: {
    primary: "#B85A2C", // earthy saffron / coral
    accent: "#5C7A3A", // deep olive green
    neutral: "#F5EFE6", // warm offwhite (shared with Kitchen)
    ink: "#1F2421",
  },
  culturalAccent: "rangoli" as AccentKind,
  culturalHooks: ["Diwali", "Holi", "Onam", "Eid", "Karva Chauth"],
  doNotSay: [
    "delicious authentic cuisine",
    "best in town",
    "you'll love it",
    "premium quality spices",
    "the finest ingredients",
    "experience the flavor",
  ],
  links: {
    instagram: null, // TODO
    facebook: null, // TODO
    googleMaps: null,
  },
} as const;

export type Brand = typeof brand;
