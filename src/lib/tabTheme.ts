import type { TabId, TopTabId } from "../types";

export const TOP_TABS: { id: TopTabId; label: string }[] = [
  { id: "home", label: "home" },
  { id: "about", label: "about" },
  { id: "projects", label: "projects" },
  { id: "contact", label: "contact" },
];

/** Every sub-page (case studies, mini-apps) belongs to one of the four
 *  folder tabs above, for nav highlighting and panel colouring. */
export const TAB_GROUP: Record<TabId, TopTabId> = {
  home: "home",
  about: "about",
  projects: "projects",
  persevere: "projects",
  kitchen: "projects",
  "kitchen-case-study": "projects",
  dnd: "projects",
  "dnd-case-study": "projects",
  contact: "contact",
};

interface TabColors {
  /** Light fill - active tab background + the content panel behind it. */
  fill: string;
  /** Dark ink - inactive tab background + text on the fill colour, and
   *  (via App.tsx) this page's own heading/body text + accent-button
   *  background, so accent buttons read as "this page's dark colour"
   *  instead of always strawberry pink. */
  ink: string;
  /** Same colour as `ink`, as an "r, g, b" triplet - feeds --accent-rgb
   *  for the accent button's soft/glow rgba() effects. */
  inkRgb: string;
}

export const TAB_THEME: Record<TopTabId, TabColors> = {
  home: {
    fill: "var(--tab-home-fill)",
    ink: "var(--tab-home-ink)",
    inkRgb: "var(--tab-home-ink-rgb)",
  },
  about: {
    fill: "var(--tab-about-fill)",
    ink: "var(--tab-about-ink)",
    inkRgb: "var(--tab-about-ink-rgb)",
  },
  projects: {
    fill: "var(--tab-projects-fill)",
    ink: "var(--tab-projects-ink)",
    inkRgb: "var(--tab-projects-ink-rgb)",
  },
  contact: {
    fill: "var(--tab-contact-fill)",
    ink: "var(--tab-contact-ink)",
    inkRgb: "var(--tab-contact-ink-rgb)",
  },
};
