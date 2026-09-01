export type TabId =
  | "home"
  | "about"
  | "projects"
  | "contact"
  | "kitchen"
  | "kitchen-case-study"
  | "dnd"
  | "dnd-case-study"
  | "persevere";

/** The four folder tabs shown in the top nav. Every other `TabId` (case
 *  study/app sub-pages) belongs to one of these for nav-highlight/panel
 *  colour purposes - see `TAB_GROUP` in `lib/tabTheme.ts`. */
export type TopTabId = "home" | "about" | "projects" | "contact";

export type ProjectTag = "professional" | "fun";

export const PROJECT_TAG_LABELS: Record<ProjectTag, string> = {
  professional: "Professional",
  fun: "Fun",
};
