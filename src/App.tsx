import { useState, useEffect, useRef } from "react";
import { DockNav } from "./components/layout/DockNav";
import type { TabId } from "./types";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { WorkPage } from "./pages/WorkPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ContactPage } from "./pages/ContactPage";
import { KitchenPage } from "./pages/KitchenPage";
import { DnDPage } from "./pages/DnDPage";
import { PersevereCaseStudyPage } from "./pages/PersevereCaseStudyPage";
import Grainient from "./components/ui/Grainient";
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
        return (
          <PersevereCaseStudyPage onBack={() => navigate("projects")} />
        );
      case "contact":
        return <ContactPage />;
      case "kitchen":
        return <KitchenPage onBack={() => navigate("projects")} />;
      case "dnd":
        return <DnDPage onBack={() => navigate("projects")} />;
    }
  }

  return (
    <>
      <div className="fade-in h-screen overflow-hidden flex">
        {/* Grainient page background - pale strawberry-cream dominant, with
            soft strawberry-pink/rose blob accents, sitting behind everything.
            Grainient's own root div hardcodes position:relative, so it's
            wrapped here rather than trying to override that via className
            (Tailwind's utility ordering - not JSX class order - decides
            which `position` utility wins on a class clash). */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <Grainient
            color1="#FBF0DE"
            color2="#F4C7D0"
            color3="#8B3F56"
            colorBalance={0.15}
            warpAmplitude={60}
            blendSoftness={0.18}
            grainAmount={0.045}
            contrast={1.3}
            saturation={1.15}
            zoom={1.1}
          />
        </div>

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
