import { Gamepad2 } from "lucide-react";
import { PageShell, SkeletonBlock } from "../components/ui/PageShell";

export function PlaygroundPage() {
  return (
    <PageShell
      title="Playground"
      subtitle="An honest look at what I'm currently tinkering with. No polish required."
      icon={<Gamepad2 size={28} />}
    >
      {/* Personality note */}
      <div className="flex items-start gap-3 mb-8 px-4 py-3 border border-accent rounded-lg bg-accent-soft">
        <Gamepad2 size={15} className="mt-0.5 text-accent shrink-0" />
        <p className="font-body text-neutral-300 text-xs leading-relaxed">
          This section is intentionally messy. It's a space for experiments,
          half-finished ideas, and things I'm learning.{" "}
        </p>
      </div>

      <div className="space-y-4">
        <SkeletonBlock label="TODO: Current experiment" height="h-36" />
        <SkeletonBlock label="TODO: Something I'm learning" height="h-24" />
        <SkeletonBlock label="TODO: A tool or snippet I liked" height="h-20" />
      </div>
    </PageShell>
  );
}
