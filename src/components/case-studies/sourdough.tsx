import { ChefHat, BookOpen, Flame, Calculator } from "lucide-react";
import { PageShell } from "../layout/PageShell";
import { GlassCard } from "../ui/GlassCard";

/**
 * Sourdough Souschef - Case Study
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
  icon: typeof BookOpen;
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

export default function SourdoughCaseStudy() {
  return (
    <PageShell
      title="Sourdough Souschef"
      subtitle="A personal app for tracking my sourdough starter, guiding my bakes, and doing the ratio maths so I don't have to."
      icon={<ChefHat size={28} />}
    >
      <div className="flex flex-col gap-8">
        {/* The Idea */}
        <div id="idea" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>The Idea</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              I keep a sourdough starter going, and I kept losing track of the
              same three things: when it was last fed, whether my numbers for
              a loaf actually added up, and where I was in a bake I'd started
              hours earlier. Recipe cards and notes apps weren't cutting it,
              so I built Souschef, a small companion app that remembers all
              of that for me and walks me through a bake step by step.
            </p>
          </GlassCard>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>How It Works</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400 mb-5">
              The app is built around three things I actually needed while
              baking, not a feature list I decided on up front:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FeatureCard
                icon={BookOpen}
                title="Track"
                description="Logs every starter feeding so I can spot patterns instead of guessing whether it's hungry."
              />
              <FeatureCard
                icon={Flame}
                title="Bake"
                description="A step-by-step baking guide with built-in timers for each stage, from autolyse through to cooling on the rack."
              />
              <FeatureCard
                icon={Calculator}
                title="Quick Start"
                description="Calculates flour, water, and salt from whatever starter I have on hand, for when I want to freestyle a loaf without a saved session."
              />
            </div>
          </GlassCard>
        </div>

        {/* Under the Hood */}
        <div id="under-the-hood" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>Under the Hood</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              An active bake is a real session, not just a checklist: it
              tracks flour, water, starter and salt mass off a fixed ratio,
              persists to local storage so a page refresh mid-bake doesn't
              lose my place, and steps through a fourteen-stage timeline with
              per-step timers for things like stretch-and-folds and the
              overnight proof. It's a genuinely small, single-purpose app,
              which was the point - I wanted something that opens straight
              to what I need mid-bake, with flour on my hands, rather than a
              general-purpose recipe app I have to dig through.
            </p>
          </GlassCard>
        </div>

        {/* Outcome */}
        <div id="outcome" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>Outcome</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              I use this for every bake now. I've stopped losing track of
              when my starter last got fed, and I haven't ended up with an
              over-proofed loaf from losing the thread of a bake halfway
              through. It's also been a nice low-stakes space to keep
              practising UI and product decisions on something real, outside
              of client work, where I'm both the designer and the only user.
            </p>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
