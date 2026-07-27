import { Folder, Heart } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { GlassCard } from "../components/ui/GlassCard";
import { Experience } from "../components/about/Experience";

export function WorkPage() {
  return (
    <PageShell title="Work" icon={<Folder size={28} />}>
      {/* Personality note */}
      <GlassCard className="flex items-start gap-3 mb-8 p-4">
        <Heart size={15} className="mt-0.5 text-accent shrink-0" />
        <p className="font-body text-neutral-300 text-xs leading-relaxed">
          Due to the nature of my work, I am unable to share specific details
          about the projects I have worked on. However, I can provide a general
          overview of my professional experience and career journey.
        </p>
      </GlassCard>
      <Experience />
    </PageShell>
  );
}
