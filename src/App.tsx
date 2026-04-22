import { useState, useEffect, useRef } from "react";
import { Sidebar, type TabId } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { usePinkMode } from "./hooks/usePinkMode";
import { AboutPage } from "./pages/AboutPage";
import { WorkPage } from "./pages/WorkPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { WritingPage } from "./pages/WritingPage";
import { ContactPage } from "./pages/ContactPage";
import { KitchenPage } from "./pages/KitchenPage";
import { HomePage } from "./pages/HomePage";
import { StarCursor } from "./components/ui/StarCursor";

const TRANSITION_MS = 180;

function renderTab(tab: TabId) {
  switch (tab) {
    case "about":
      return <AboutPage />;
    case "work":
      return <WorkPage />;
    case "playground":
      return <PlaygroundPage />;
    case "writing":
      return <WritingPage />;
    case "contact":
      return <ContactPage />;
    case "kitchen":
      return <KitchenPage />;
  }
}

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
  return "about";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);
  const { isPink, toggle } = usePinkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Skip the entry splash when arriving via a direct link (e.g. /sourdough)
  const [hasEntered, setHasEntered] = useState(() => getInitialTab() !== "about");

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

  if (!hasEntered) {
    return (
      <>
        <StarCursor />
        <HomePage onEnter={() => setHasEntered(true)} />
      </>
    );
  }

  return (
    <>
      <StarCursor />
      <div className="fade-in h-screen overflow-hidden bg-neutral-950 flex">
        <Sidebar
          active={activeTab}
          onNavigate={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={setIsSidebarOpen}
        />

        {/* Right side — topbar + scrollable content */}
        <div className="flex-1 flex flex-col md:ml-52 overflow-hidden">
          <Topbar
            isPink={isPink}
            onPinkToggle={toggle}
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={setIsSidebarOpen}
          />

          <main ref={mainRef} className="flex-1 overflow-y-auto pt-12">
            <div
              key={displayedTab}
              className={`px-12 py-14 ${isExiting ? "page-exit" : "page-enter"}`}
            >
              {renderTab(displayedTab)}
            </div>
          </main>
        </div>

        {/* Subtle accent glow */}
        <div
          className="pointer-events-none fixed top-0 left-0 w-72 h-72 rounded-full opacity-[0.04] blur-3xl"
          style={{ background: "var(--accent)" }}
        />

        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-[5] bg-black/40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
}
