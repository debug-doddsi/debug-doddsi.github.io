import { Map } from "lucide-react";
import { DnDMapGenerator } from "../components/ui/DnDMapGenerator";

export function DnDPage() {
  return (
    <div className="flex flex-col gap-5">
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
