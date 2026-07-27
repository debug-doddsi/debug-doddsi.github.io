import { FileText, PenTool } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { LaunchCard } from "../components/ui/LaunchCard";
import type { TabId } from "../types";

interface CaseStudiesPageProps {
  onNavigate: (tab: TabId) => void;
}

export function CaseStudiesPage({ onNavigate }: CaseStudiesPageProps) {
  return (
    <PageShell
      title="Case Studies"
      subtitle="Deeper dives into a few projects I've worked on"
      icon={<FileText size={28} />}
    >
      <div className="flex flex-wrap justify-center gap-6">
        <LaunchCard
          icon={<PenTool size={18} />}
          title="Persevere"
          subtitle="Branding · Web Design"
          description="Designing a website for a digital marketing agency that had to be fun, capable, and unmistakably itself."
          placeholder={
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #5E1A22 0%, #1B1713 100%)",
              }}
            >
              <span
                className="text-2xl text-[#F3EEE6]"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Persevere
              </span>
            </div>
          }
          ctaLabel="Read case study"
          onLaunch={() => onNavigate("persevere")}
        />
      </div>
    </PageShell>
  );
}
