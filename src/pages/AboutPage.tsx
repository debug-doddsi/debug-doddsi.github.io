import { PageShell } from "../components/layout/PageShell";
import { GlassCard } from "../components/ui/GlassCard";
import { Bio } from "../components/about/Bio";
import { Education } from "../components/about/Education";
import { Experience } from "../components/about/Experience";
import { TechLoop } from "../components/about/TechLoop";
import { Heart } from "lucide-react";

export function AboutPage() {
  return (
    <div className="relative">
      <PageShell title="About">
        <div className="space-y-8">
          <Bio />

          <GlassCard className="flex items-start gap-3 p-4">
            <Heart size={15} className="mt-0.5 shrink-0 text-accent" />
            <p className="font-body text-xs leading-relaxed text-neutral-300">
              Due to the nature of my work, I can't share specific details about
              the projects I've worked on, but here's a general overview of my
              professional experience.
            </p>
          </GlassCard>

          <Education />
          <Experience />

          <GlassCard>
            <h3 className="font-display text-lg text-neutral-100 mb-3">
              Tech Stack
            </h3>
            <TechLoop />
          </GlassCard>
        </div>
      </PageShell>
    </div>
  );
}
