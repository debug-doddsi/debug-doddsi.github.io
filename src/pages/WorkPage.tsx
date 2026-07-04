import { Folder, Heart } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { Experience } from "../components/ui/about/Experience";

export function WorkPage() {
  return (
    <PageShell title="Work" icon={<Folder size={28} />}>
      {/* Personality note */}
      <div className="flex items-start gap-3 mb-8 px-4 py-3 border border-accent rounded-lg bg-accent-soft">
        <Heart size={15} className="mt-0.5 text-accent shrink-0" />
        <p className="font-body text-neutral-300 text-xs leading-relaxed">
          Due to the nature of my work, I am unable to share specific details
          about the projects I have worked on. However, I can provide a general
          overview of my professional experience and career journey.
        </p>
      </div>
      <Experience />
    </PageShell>
  );
}
