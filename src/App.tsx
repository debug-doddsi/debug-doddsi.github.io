import { useState, useEffect, type CSSProperties } from "react";
import { FolderTabs } from "./components/layout/FolderTabs";
import type { TabId } from "./types";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ContactPage } from "./pages/ContactPage";
import { KitchenPage } from "./pages/KitchenPage";
import { SourdoughCaseStudyPage } from "./pages/SourdoughCaseStudyPage";
import { DnDPage } from "./pages/DnDPage";
import { DnDCaseStudyPage } from "./pages/DnDCaseStudyPage";
import { PersevereCaseStudyPage } from "./pages/PersevereCaseStudyPage";
import { TAB_PATHS, getTabFromLocation } from "./lib/routes";
import { TAB_GROUP, TAB_THEME } from "./lib/tabTheme";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(getTabFromLocation);

  // Clean the address bar back to the tab's pretty path on mount - covers
  // both the redirect stubs' `/?tab=x` round trip and any stale query string.
  useEffect(() => {
    const path = TAB_PATHS[activeTab];
    if (window.location.pathname !== path || window.location.search) {
      window.history.replaceState({ tab: activeTab }, "", path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the tab in sync with browser back/forward navigation.
  useEffect(() => {
    function onPopState() {
      setActiveTab(getTabFromLocation());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(tab: TabId) {
    setActiveTab(tab);
    const path = TAB_PATHS[tab];
    if (window.location.pathname !== path) {
      window.history.pushState({ tab }, "", path);
    }
  }

  function renderTab(tab: TabId) {
    switch (tab) {
      case "home":
        return <HomePage />;
      case "about":
        return <AboutPage />;
      case "projects":
        return <ProjectsPage onNavigate={navigate} />;
      case "persevere":
        return <PersevereCaseStudyPage onBack={() => navigate("projects")} />;
      case "contact":
        return <ContactPage />;
      case "kitchen":
        return <KitchenPage onBack={() => navigate("projects")} />;
      case "kitchen-case-study":
        return <SourdoughCaseStudyPage onBack={() => navigate("projects")} />;
      case "dnd":
        return <DnDPage onBack={() => navigate("projects")} />;
      case "dnd-case-study":
        return <DnDCaseStudyPage onBack={() => navigate("projects")} />;
    }
  }

  const panelTheme = TAB_THEME[TAB_GROUP[activeTab]];

  return (
    <div className="fade-in flex h-screen flex-col overflow-hidden">
      <FolderTabs active={TAB_GROUP[activeTab]} onNavigate={navigate} />

      <main className="flex-1 overflow-hidden px-4 pb-4 sm:px-8 sm:pb-8">
        <div
          key={activeTab}
          style={
            {
              backgroundColor: panelTheme.fill,
              // Re-point the site-wide ink tokens (see index.css) at this
              // tab's own dark shade, so headings/body text on every panel
              // match its background hue instead of always reading matcha
              // green.
              "--ink": panelTheme.ink,
              "--ink-muted": panelTheme.ink,
              "--ink-rose": panelTheme.ink,
              // Same for the accent-button colour - each page's "View Case
              // Study"-style buttons use that page's own dark shade (with
              // ivory text) instead of always strawberry pink.
              "--accent": panelTheme.ink,
              "--accent-rgb": panelTheme.inkRgb,
            } as CSSProperties
          }
          // Fixed-size folder shape - it never grows/scrolls with content.
          // Only the inner div below scrolls, so the rounded frame (and the
          // tab strip it sits under) reads as pinned in place at all times.
          className="page-enter page-grain flex h-full flex-col overflow-hidden rounded-b-[28px] rounded-tr-[28px]"
        >
          <div className="flex-1 overflow-y-auto px-6 py-10 sm:px-14 sm:py-16">
            {renderTab(activeTab)}
          </div>
        </div>
      </main>
    </div>
  );
}
