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
      subtitle="Case studies, side projects, and stuff I've made for my friends and I"
      icon={<LayoutGrid size={28} />}
      maxWidthClassName="max-w-5xl"
    >
      <div className="flex flex-wrap justify-center gap-6">
        <CutoutLaunchCard
          icon={<PenTool size={18} />}
          title="Persevere Media"
          description="A bold, capable rebrand and website for a digital marketing agency."
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
          ctaLabel="View Case Study"
          onLaunch={() => onNavigate("persevere")}
          secondaryLabel="Open Website"
          secondaryHref="https://choosepersevere.com"
        />

        <CutoutLaunchCard
          icon={<ChefHat size={18} />}
          title="Sourdough Souschef"
          description="A sourdough tracker that logs feedings, guides bakes, and does the ratio maths for you."
          placeholder={
            <CutoutCardImage
              src="/sourdough/sourdough.jpg"
              alt="Sourdough bread"
            />
          }
          ctaLabel="View Case Study"
          onLaunch={() => onNavigate("kitchen-case-study")}
          secondaryLabel="Open App"
          onSecondaryLaunch={() => onNavigate("kitchen")}
        />

        <CutoutLaunchCard
          icon={<Map size={18} />}
          title="D&D Map Maker"
          description="Procedural landscape and town maps for my DM, with custom pins built in."
          placeholder={
            <CutoutCardImage src="/dndmapmaker/dnd.jpg" alt="D&D map" />
          }
          ctaLabel="View Case Study"
          onLaunch={() => onNavigate("dnd-case-study")}
          secondaryLabel="Open App"
          onSecondaryLaunch={() => onNavigate("dnd")}
        />
      </div>
    </PageShell>
  );
}
