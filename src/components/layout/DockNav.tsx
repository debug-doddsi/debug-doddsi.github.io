import { Smile, Folder, Send, LayoutGrid } from "lucide-react";
import Dock, { type DockItemData } from "../ui/Dock";
import type { TabId } from "../../types";

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "about", label: "About", icon: <Smile size={20} /> },
  { id: "work", label: "Work", icon: <Folder size={20} /> },
  { id: "apps", label: "My Apps", icon: <LayoutGrid size={20} /> },
  { id: "contact", label: "Contact", icon: <Send size={20} /> },
];

interface DockNavProps {
  active: TabId;
  onNavigate: (id: TabId) => void;
}

export function DockNav({ active, onNavigate }: DockNavProps) {
  const items: DockItemData[] = NAV_ITEMS.map((item) => {
    const isActive =
      item.id === active ||
      (item.id === "apps" &&
        (active === "kitchen" || active === "dnd" || active === "travel"));

    return {
      icon: item.icon,
      label: item.label,
      onClick: () => onNavigate(item.id),
      className: isActive ? "border-accent text-accent" : "",
    };
  });

  return (
    <div className="bottom-0 left-0 z-[1001] fixed w-full h-24 pointer-events-none">
      <div className="relative mx-auto w-fit h-full pointer-events-auto">
        <Dock items={items} panelHeight={64} baseItemSize={48} magnification={64} />
      </div>
    </div>
  );
}
