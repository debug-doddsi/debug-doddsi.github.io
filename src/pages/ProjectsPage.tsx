import { ChefHat, Map, PenTool, LayoutGrid } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { CutoutLaunchCard } from "../components/ui/CutoutLaunchCard";
import { CutoutCardImage } from "../components/ui/cutout-card";
import type { TabId } from "../types";

interface ProjectsPageProps {
  onNavigate: (tab: TabId) => void;
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  return (
    <PageShell
      title="Projects"
      subtitle="Case studies, side projects, and silly little apps I've made for my friends and I"
      icon={<LayoutGrid size={28} />}
    >
      <div className="flex flex-wrap justify-center gap-6">
        <CutoutLaunchCard
          icon={<PenTool size={18} />}
          title="Persevere Media"
          subtitle="Branding · Web Design"
          description="Designing a website for a digital marketing agency that had to be fun, capable, and unmistakably itself."
          placeholder={
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #594157 0%, #d5573b 55%, #edb03e 100%)",
              }}
            >
              <span
                className="text-2xl text-[#F3EEE6]"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Persevere Media
              </span>
            </div>
          }
          ctaLabel="Read case study"
          onLaunch={() => onNavigate("persevere")}
        />

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
