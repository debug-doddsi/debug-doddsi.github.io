import { useState } from "react";
import { Sidebar, type TabId } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { usePinkMode } from "./hooks/usePinkMode";
import { AboutPage } from "./pages/AboutPage";
import { WorkPage } from "./pages/WorkPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { WritingPage } from "./pages/WritingPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";

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
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("about");
  const { isPink, toggle } = usePinkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  if (!hasEntered) {
    return <HomePage onEnter={() => setHasEntered(true)} />;
  }

  return (
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

        <main className="flex-1 overflow-y-auto pt-12">
          <div className="px-12 py-14">{renderTab(activeTab)}</div>
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
  );
}
