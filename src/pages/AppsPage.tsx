import { ChefHat, Map, LayoutGrid } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { CutoutLaunchCard } from "../components/ui/CutoutLaunchCard";
import { CutoutCardImage } from "../components/ui/cutout-card";

interface AppsPageProps {
  onNavigate: (tab: "kitchen" | "dnd") => void;
}

export function AppsPage({ onNavigate }: AppsPageProps) {
  return (
    <PageShell
      title="My Apps"
      subtitle="Silly little apps I have made for my friends and I!"
      icon={<LayoutGrid size={28} />}
    >
      <div className="flex flex-wrap justify-center gap-6">
        <CutoutLaunchCard
          icon={<ChefHat size={18} />}
          title="Sourdough Souschef"
          subtitle="Kitchen · Baking"
          description="I used this app to throughly document and track my sourdough starter feedings, generate a step-by-step baking guide, and quickly calculate flour / water / starter / salt ratios for my loaves."
          placeholder={
            <CutoutCardImage
              src="/sourdough/sourdough.jpg"
              alt="Sourdough bread"
            />
          }
          ctaLabel="Open App"
          onLaunch={() => onNavigate("kitchen")}
        />

        <CutoutLaunchCard
          icon={<Map size={18} />}
          title="D&D Map Maker"
          subtitle="Cartography · Tabletop"
          description="I created this app with my DM in mind. This app generates landscape and civilisation maps, and populates them with all your usual locations. Also allows for custom pins to be added. Skyrim inspired."
          placeholder={
            <CutoutCardImage src="/dndmapmaker/dnd.jpg" alt="D&D map" />
          }
          ctaLabel="Open App"
          onLaunch={() => onNavigate("dnd")}
        />
      </div>
    </PageShell>
  );
}
