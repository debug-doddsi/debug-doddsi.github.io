import { ChefHat, Map, LayoutGrid } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { LaunchCard } from "../components/ui/LaunchCard";

interface AppsPageProps {
  onNavigate: (tab: "kitchen" | "dnd") => void;
}

export function AppsPage({ onNavigate }: AppsPageProps) {
  return (
    <PageShell
      title="My Apps"
      subtitle="Apps I have made for myself and use day-to-day!"
      icon={<LayoutGrid size={28} />}
    >
      <div className="flex flex-wrap justify-center gap-6">
        <LaunchCard
          icon={<ChefHat size={18} />}
          title="Sourdough Souschef"
          subtitle="Kitchen · Baking"
          description="I use this app to track my sourdough starter feedings, generate a step-by-step baking guide, and calculate dough ratios for my loaves."
          placeholder={
            <img
              src="/sourdough/sourdough.jpg"
              alt="Sourdough bread"
              className="w-full h-full object-cover"
            />
          }
          ctaLabel="Open App"
          onLaunch={() => onNavigate("kitchen")}
        />

        <LaunchCard
          icon={<Map size={18} />}
          title="D&D Map Maker"
          subtitle="Cartography · Tabletop"
          description="I created this app with my DM in mind. This app generates landscape and civilisation maps, and populates them with all youur usual locations."
          placeholder={
            <img
              src="/dndmapmaker/dnd.jpg"
              alt="D&D map"
              className="w-full h-full object-cover"
            />
          }
          ctaLabel="Open App"
          onLaunch={() => onNavigate("dnd")}
        />
      </div>
    </PageShell>
  );
}
