import { GlassCard } from "../ui/GlassCard";
import { JourneyScroll } from "./JourneyScroll";

export function Bio() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="font-display text-xl text-neutral-100 mb-4">
          TODO: Section Title
        </h2>
        <p className="font-body text-xs text-neutral-400 leading-relaxed">
          <em className="text-lg">TODO: placeholder content goes here.</em>
        </p>
      </GlassCard>

      <JourneyScroll />
    </div>
  );
}
