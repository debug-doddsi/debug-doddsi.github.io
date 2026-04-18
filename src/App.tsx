import { useState } from "react";
import { Sidebar, type TabId } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { usePinkMode } from "./hooks/usePinkMode";
import { AboutPage } from "./pages/AboutPage";
import { WorkPage } from "./pages/WorkPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { WritingPage } from "./pages/WritingPage";
import { ContactPage } from "./pages/ContactPage";
import { Routes, Route } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-neutral-950">
      <Sidebar
        active={activeTab}
        onNavigate={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={setIsSidebarOpen}
      />
      <Topbar
        isPink={isPink}
        onPinkToggle={toggle}
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={setIsSidebarOpen}
      />

      {/* Main content — offset for sidebar + topbar */}
      <main className="ml-0 md:ml-52 pt-12 min-h-screen">
        <div className="px-12 py-14">{renderTab(activeTab)}</div>
      </main>

      {/* Subtle accent glow in top-left corner — changes with theme */}
      <div
        className="pointer-events-none fixed top-0 left-0 w-72 h-72 rounded-full opacity-[0.04] blur-3xl"
        style={{ background: "var(--accent)" }}
      />

      {/* Mobile backdrop to allow closing of sidebar by clicking on main page*/}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[5] bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
