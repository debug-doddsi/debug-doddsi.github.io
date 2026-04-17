import { PinkToggle } from "../ui/PinkToggle";
import { Menu, X } from "lucide-react";

interface TopbarProps {
  isPink: boolean;
  onPinkToggle: () => void;
  isSidebarOpen: boolean;
  onSidebarToggle: (value: boolean) => void;
}

export function Topbar({
  isPink,
  onPinkToggle,
  isSidebarOpen,
  onSidebarToggle,
}: TopbarProps) {
  return (
    <header className="top-0 right-0 left-0 z-10 fixed flex justify-between md:justify-end items-center bg-neutral-950 px-8 border-neutral-800 border-b h-12">
      {/* Hamburger */}
      <button
        onClick={() => onSidebarToggle(!isSidebarOpen)}
        className="md:hidden text-neutral-400 hover:text-neutral-100"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {/* Fun toggle */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest select-none">
          {isPink ? "Fun Mode" : "Professional Mode"}
        </span>
        <PinkToggle isPink={isPink} onToggle={onPinkToggle} />
      </div>
    </header>
  );
}
