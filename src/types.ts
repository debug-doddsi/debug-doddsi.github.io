export type TabId =
  | "home"
  | "about"
  | "work"
  | "projects"
  | "contact"
  | "kitchen"
  | "kitchen-case-study"
  | "dnd"
  | "dnd-case-study"
  | "persevere";

export type ProjectTag = "professional" | "fun";

export const PROJECT_TAG_LABELS: Record<ProjectTag, string> = {
  professional: "Professional",
  fun: "Fun",
};
