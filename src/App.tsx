import { useState, useEffect, useRef } from "react";
import { DockNav } from "./components/layout/DockNav";
import { Topbar } from "./components/layout/Topbar";
import type { TabId } from "./types";
import { usePinkMode } from "./hooks/usePinkMode";
import { AboutPage } from "./pages/AboutPage";
import { WorkPage } from "./pages/WorkPage";
import { ContactPage } from "./pages/ContactPage";
import { KitchenPage } from "./pages/KitchenPage";
import { DnDPage } from "./pages/DnDPage";
import { AppsPage } from "./pages/AppsPage";
import { TravelTrackerPage } from "./pages/TravelTrackerPage";
import { StarCursor } from "./components/ui/StarCursor";
import Grainient from "./components/ui/Grainient";

const TRANSITION_MS = 180;

function getInitialTab(): TabId {
  const { pathname, search } = window.location;
  // Match both the redirect path (/sourdough kept by SW navigation fallback)
  // and the query-param path (/?tab=kitchen from the redirect page on first visit)
  if (
    pathname === "/sourdough" ||
    pathname === "/sourdough/" ||
    new URLSearchParams(search).get("tab") === "kitchen"
  ) {
    return "kitchen";
  }
  if (
    pathname === "/dndmapmaker" ||
    pathname === "/dndmapmaker/" ||
    pathname === "/mapgenerator" ||
    pathname === "/mapgenerator/" ||
    new URLSearchParams(search).get("tab") === "dnd"
  ) {
    return "dnd";
  }
  return "about";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);
  const { isPink, toggle } = usePinkMode();

  const [displayedTab, setDisplayedTab] = useState<TabId>(getInitialTab);
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

  function renderTab(tab: TabId) {
    switch (tab) {
      case "about":      return <AboutPage />;
      case "work":       return <WorkPage />;
      case "contact":    return <ContactPage />;
      case "kitchen":    return <KitchenPage onBack={() => setActiveTab("apps")} />;
      case "dnd":        return <DnDPage onBack={() => setActiveTab("apps")} />;
      case "travel":     return <TravelTrackerPage onBack={() => setActiveTab("apps")} isPink={isPink} />;
      case "apps":       return <AppsPage onNavigate={setActiveTab} />;
    }
  }

  return (
    <>
      <div className="fade-in h-screen overflow-hidden flex">
        {/* Grainient page background — pale strawberry-cream dominant, with
            soft strawberry-pink/rose blob accents, sitting behind everything.
            Grainient's own root div hardcodes position:relative, so it's
            wrapped here rather than trying to override that via className
            (Tailwind's utility ordering — not JSX class order — decides
            which `position` utility wins on a class clash). */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <Grainient
            color1="#FCEBF1"
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

        {isPink && <StarCursor isPink={isPink} />}
        <Topbar isPink={isPink} onPinkToggle={toggle} />
        <DockNav active={activeTab} onNavigate={setActiveTab} />

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
