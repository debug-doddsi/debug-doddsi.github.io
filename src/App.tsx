import { useState, useEffect, useRef } from "react";
import { DockNav } from "./components/layout/DockNav";
import type { TabId } from "./types";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { WorkPage } from "./pages/WorkPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ContactPage } from "./pages/ContactPage";
import { KitchenPage } from "./pages/KitchenPage";
import { SourdoughCaseStudyPage } from "./pages/SourdoughCaseStudyPage";
import { DnDPage } from "./pages/DnDPage";
import { DnDCaseStudyPage } from "./pages/DnDCaseStudyPage";
import { PersevereCaseStudyPage } from "./pages/PersevereCaseStudyPage";
import { TAB_PATHS, getTabFromLocation } from "./lib/routes";

const TRANSITION_MS = 180;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(getTabFromLocation);

  const [displayedTab, setDisplayedTab] = useState<TabId>(getTabFromLocation);
  const [isExiting, setIsExiting] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (activeTab === displayedTab) return;
    setIsExiting(true);
    const t = setTimeout(() => {
      setDisplayedTab(activeTab);
      setIsExiting(false);
      mainRef.current?.scrollTo({ top: 0 });
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [activeTab, displayedTab]);

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
        return <HomePage onNavigate={navigate} />;
      case "about":
        return <AboutPage />;
      case "work":
        return <WorkPage />;
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

  return (
    <>
      <div className="fade-in h-screen overflow-hidden flex">
        <DockNav active={activeTab} onNavigate={navigate} />

        {/* Scrollable content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main ref={mainRef} className="flex-1 overflow-y-auto pt-14 pb-24">
            <div
              key={displayedTab}
              className={`px-12 py-14 ${isExiting ? "page-exit" : "page-enter"}`}
            >
              {renderTab(displayedTab)}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
