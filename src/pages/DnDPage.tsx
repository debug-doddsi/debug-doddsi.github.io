import { Map, ArrowLeft } from "lucide-react";
import { DnDMapGenerator } from "../components/ui/dnd/DnDMapGenerator";

interface DnDPageProps {
  onBack: () => void;
}

export function DnDPage({ onBack }: DnDPageProps) {
  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 self-start font-body text-xs text-neutral-500 hover:text-accent transition-colors duration-150"
      >
        <ArrowLeft size={13} /> Back to My Apps
      </button>
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <Map size={20} className="text-accent shrink-0" />
        <div>
          <h1 className="font-display text-xl text-neutral-100 leading-tight">
            D&D Map Generator
          </h1>
          <p className="font-body text-[11px] text-neutral-500 mt-0.5">
            procedural cartography · landscape &amp; town maps
          </p>
        </div>
      </div>
      <DnDMapGenerator />
    </div>
  );
}
