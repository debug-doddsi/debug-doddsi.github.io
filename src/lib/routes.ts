import type { TabId } from "../types";

// The pretty URL shown in the address bar for each tab. Kitchen/dnd keep
// their pre-existing paths (also baked into the PWA manifest's start_url
// and public/sourdough, public/dndmapmaker redirect stubs) - everything
// else is new.
export const TAB_PATHS: Record<TabId, string> = {
  home: "/",
  about: "/about",
  work: "/work",
  projects: "/projects",
  persevere: "/projects/persevere",
  contact: "/contact",
  kitchen: "/sourdough",
  dnd: "/dndmapmaker",
};

const PATH_TO_TAB: Record<string, TabId> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab as TabId]),
);

// GitHub Pages has no server-side rewrites, so a direct/hard load of any of
// these paths is actually served by a static public/<path>/index.html stub
// (see public/about, public/sourdough, etc.) that does
// `location.replace('/?tab=<id>')`. This reads that query param back out and
// resolves it to a tab; the URL itself gets cleaned back up to the pretty
// path once the app mounts (see App.tsx).
export function getTabFromLocation(): TabId {
  const { pathname, search } = window.location;
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (normalized in PATH_TO_TAB) {
    return PATH_TO_TAB[normalized];
  }

  const queryTab = new URLSearchParams(search).get("tab");
  if (queryTab && queryTab in TAB_PATHS) {
    return queryTab as TabId;
  }

  // Legacy alt path kept alongside /dndmapmaker.
  if (normalized === "/mapgenerator") {
    return "dnd";
  }

  return "home";
}
