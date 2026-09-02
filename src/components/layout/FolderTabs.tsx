import type { TabId, TopTabId } from "../../types";
import { TOP_TABS, TAB_THEME } from "../../lib/tabTheme";

interface FolderTabsProps {
  active: TopTabId;
  onNavigate: (id: TabId) => void;
}

// Top nav styled as a row of folder tabs - one soft colour per section.
// Every tab keeps its own colour whether active or not; only elevation
// and opacity change. The active tab's colour flows straight down into
// the content panel beneath it (see App.tsx) so it reads as a divider.
export function FolderTabs({ active, onNavigate }: FolderTabsProps) {
  return (
    <nav
      className="relative z-20 flex shrink-0 items-end gap-1.5 overflow-hidden px-4 pt-4 sm:px-8 sm:pt-6"
      aria-label="Primary"
    >
      {TOP_TABS.map(({ id, label }) => {
        const isActive = id === active;
        const colors = TAB_THEME[id];

        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={isActive ? "page" : undefined}
            style={{
              backgroundColor: colors.fill,
              color: colors.ink,
            }}
            className={`tab-grain shrink-0 rounded-t-2xl px-2.5 py-2 text-center font-mono text-[10px] uppercase tracking-tight transition-transform duration-200 sm:px-7 sm:py-3 sm:text-sm sm:tracking-widest ${
              isActive
                ? "z-10 translate-y-0 opacity-100"
                : "translate-y-1.5 opacity-70 hover:translate-y-1 hover:opacity-90"
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
