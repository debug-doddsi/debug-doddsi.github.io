import { ChefHat, Map, Globe, ArrowRight } from "lucide-react";
import { DottedMap } from "../components/ui/dotted-map";

interface AppCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  placeholder: React.ReactNode;
  onLaunch: () => void;
}

function AppCard({
  icon,
  title,
  subtitle,
  description,
  placeholder,
  onLaunch,
}: AppCardProps) {
  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden w-72 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative h-52 w-full overflow-hidden">{placeholder}</div>

      {/* Card body */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-accent-soft">
            <span className="text-accent">{icon}</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-neutral-100 text-base leading-tight">
              {title}
            </h2>
            <p className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <p className="font-body text-xs text-neutral-400 leading-relaxed">
          {description}
        </p>

        <button
          onClick={onLaunch}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl font-body text-xs font-medium text-white bg-accent transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          Open App <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

interface AppsPageProps {
  onNavigate: (tab: "kitchen" | "dnd" | "travel") => void;
}

export function AppsPage({ onNavigate }: AppsPageProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl text-neutral-100 leading-tight">
          My Apps
        </h1>
        <p className="font-body text-sm text-neutral-500">
          Apps I have made for myself and use day-to-day!
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        <AppCard
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
          onLaunch={() => onNavigate("kitchen")}
        />

        <AppCard
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
          onLaunch={() => onNavigate("dnd")}
        />

        <AppCard
          icon={<Globe size={18} />}
          title="Travel Tracker"
          subtitle="Travel · World Map"
          description="A personal map of everywhere I've been. I use this to log cities visited, track how many countries I've explored, and plan where I want to go next."
          placeholder={
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center p-4">
              <DottedMap
                dotColor="var(--accent)"
                markerColor="var(--accent)"
                dotRadius={0.3}
                markers={[
                  { lat: 55.95, lng: -3.19, size: 1.2, pulse: true },
                  { lat: 48.86, lng: 2.35,  size: 1.2, pulse: true },
                  { lat: 41.90, lng: 12.50, size: 1.2, pulse: true },
                  { lat: 40.71, lng: -74.01, size: 1.2, pulse: true },
                  { lat: 41.01, lng: 28.98, size: 1.2, pulse: true },
                ]}
                pulse
                style={{ opacity: 0.85 }}
              />
            </div>
          }
          onLaunch={() => onNavigate("travel")}
        />
      </div>
    </div>
  );
}
