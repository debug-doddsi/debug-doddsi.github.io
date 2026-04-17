import { Smile, FolderKanban, Gamepad2, Pencil, Send } from "lucide-react";

export type TabId = "about" | "work" | "playground" | "writing" | "contact";

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  whimsy?: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "about", label: "About", icon: <Smile size={16} /> },
  { id: "work", label: "Work", icon: <FolderKanban size={16} /> },
  {
    id: "playground",
    label: "Playground",
    icon: <Gamepad2 size={16} />,
  },
  { id: "writing", label: "Writing", icon: <Pencil size={16} /> },
  { id: "contact", label: "Contact", icon: <Send size={16} /> },
];

interface SidebarProps {
  active: TabId;
  onNavigate: (id: TabId) => void;
  isSidebarOpen: boolean;
  onSidebarToggle: (value: boolean) => void;
}

export function Sidebar({ active, onNavigate, isSidebarOpen }: SidebarProps) {
  return (
    <aside
      className={`top-0 left-0 z-10 fixed flex flex-col bg-neutral-950 border-neutral-800 border-r w-52 h-full transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
      {/* Wordmark */}
      <div className="px-6 pt-8 pb-10">
        <span className="font-display text-neutral-100 text-xl tracking-tight">
          iona<span className="text-accent">kate</span>
        </span>
        <p className="mt-1 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
          .uk
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm
                font-body font-medium tracking-wide transition-all duration-200
                ${
                  isActive
                    ? "nav-item-active"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                }
              `}
            >
              <span className={isActive ? "text-accent" : ""}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer note */}
      <div className="px-6 pb-6">
        <p className="font-mono text-[9px] text-neutral-700 uppercase tracking-widest">
          typed by hand, with love in Leith
        </p>
      </div>
    </aside>
  );
}
