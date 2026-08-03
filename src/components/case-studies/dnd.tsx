import { Map, Mountain, Landmark, MapPin, Download } from "lucide-react";
import { PageShell } from "../layout/PageShell";
import { GlassCard } from "../ui/GlassCard";

/**
 * D&D Map Maker - Case Study
 * -----------------------------------------------------------------------
 * A personal project, not client work - so unlike the Persevere case study
 * there's no "my role" or "key decisions" section (no one else's brief or
 * approval to navigate). This is a straight walkthrough of the idea, what
 * it does, and what building it was actually like.
 */

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-sm text-accent lowercase tracking-widest mb-4">
      {children}
    </p>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Mountain;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-5 flex flex-col gap-3">
      <Icon size={18} className="text-accent shrink-0" />
      <h3 className="font-display text-base text-neutral-100">{title}</h3>
      <p className="font-body text-sm leading-relaxed text-neutral-400">
        {description}
      </p>
    </div>
  );
}

export default function DnDCaseStudy() {
  return (
    <PageShell
      title="D&D Map Maker"
      subtitle="A procedural map generator built for my Dungeon Master, so a new landscape or town is never more than a click away."
      icon={<Map size={28} />}
    >
      <div className="flex flex-col gap-8">
        {/* The Idea */}
        <div id="idea" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>The Idea</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              My DM was spending real prep time hand-drawing maps for
              whatever region or town the party was about to stumble into,
              and I wanted to give that time back. I'm a big fan of Skyrim's
              map style, so I set out to build something that could generate
              a similar-feeling landscape or settlement on demand: enough
              structure to look intentional, with room to drop in the
              specific locations a session actually needs.
            </p>
          </GlassCard>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>How It Works</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400 mb-5">
              There are two map modes, plus the finishing touches that make a
              generated map feel like it belongs at the table:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCard
                icon={Mountain}
                title="Landscape Maps"
                description="Procedural terrain with forests, rivers, and scattered cities and towns, at small, medium, or large scale depending on how much of the world the party needs to see."
              />
              <FeatureCard
                icon={Landmark}
                title="Settlement Maps"
                description="Village, town, or city-scale maps with their own road networks and building types - castles, inns, taverns, merchants, churches, blacksmiths and more - laid out procedurally around the settlement."
              />
              <FeatureCard
                icon={MapPin}
                title="Custom Pins"
                description="Drop in labelled pins for the specific locations a session actually needs, on top of whatever the generator produced."
              />
              <FeatureCard
                icon={Download}
                title="Export"
                description="Download the finished map as an image, ready to drop straight into a session or a VTT."
              />
            </div>
          </GlassCard>
        </div>

        {/* Under the Hood */}
        <div id="under-the-hood" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>Under the Hood</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              Terrain is built from layered simplex noise rather than
              anything hand-placed, so coastlines, rivers and forest clusters
              come out looking organic instead of obviously generated.
              Settlement layouts use their own procedural pass for roads and
              building placement, with building density and road width
              scaling to whether it's a village, town, or city. Everything
              runs off a seeded random number generator, so regenerating with
              the same seed reproduces the same map - useful for tweaking a
              map without losing a layout that already worked.
            </p>
          </GlassCard>
        </div>

        {/* Outcome */}
        <div id="outcome" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>Outcome</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              My DM now generates a usable map in seconds instead of losing
              an evening to one, and pins the specific locations a session
              needs on top of it. It's also been the most fun way I've found
              to practise procedural generation and canvas work outside of
              client projects, where the only brief is "would I actually want
              to use this at my own table."
            </p>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
