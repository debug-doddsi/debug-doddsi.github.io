import { PinkToggle } from "../ui/PinkToggle";
import { SparklesText } from "../ui/sparkles-text";
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
    <header className="top-0 right-0 left-0 z-10 fixed flex items-center bg-neutral-950 px-6 border-neutral-800 border-b h-14">
      {/* Hamburger (mobile only) */}
      <button
        onClick={() => onSidebarToggle(!isSidebarOpen)}
        className="md:hidden text-neutral-400 hover:text-neutral-100 mr-4"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Site name — left side of topbar */}
      <div className="flex items-baseline gap-0 text-3xl font-display font-normal tracking-tight leading-none">
        <SparklesText
          colors={
            isPink
              ? { first: "#c4407a", second: "#e0609a" }
              : { first: "#9E7AFF", second: "#FE8BBB" }
          }
          className="text-3xl font-display font-normal tracking-tight leading-none"
        >
          ionakate
        </SparklesText>
        <span style={{ color: "#a690c4" }}>.uk</span>
      </div>

      {/* Pink toggle — pushed to the right */}
      <div className="ml-auto">
        <PinkToggle isPink={isPink} onToggle={onPinkToggle} />
      </div>
    </header>
  );
}
