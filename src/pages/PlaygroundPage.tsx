import { Gamepad2 } from "lucide-react";
import { PageShell, SkeletonBlock } from "../components/ui/PageShell";
import { Notebook } from "../components/ui/Notebook";

const NOTEBOOK_DEMO_CHAPTERS = [
  {
    numeral: "I",
    label: "Demo",
    subtitle: "Overview",
    tabTop: "22%",
    items: [
      "flips between two chapters",
      "interactive tabs",
      "lined paper effect",
      "items slide in one by one",
      "chapter headings",
      "two columns of text",
      "theme reactive",
      "smooth tab switching",
      "plug in the text and go!",
    ],
  },
  {
    numeral: "II",
    label: "Iona's Diary",
    subtitle: "My Favourite Things",
    tabTop: "58%",
    items: ["cats", "cake", "coding"],
  },
];

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
          half-finished ideas, and things I'm learning.
        </p>
      </div>

      <div className="space-y-10">
        <div className="space-y-4">
          <SkeletonBlock label="TODO: Current experiment" height="h-36" />
          <SkeletonBlock label="TODO: Something I'm learning" height="h-24" />
        </div>

        {/* Components I like */}
        <div>
          <h2 className="font-display text-xl text-neutral-100 mb-1">
            Components
          </h2>
          <p className="font-body text-xs text-neutral-400 mb-6">
            Things I've made and liked too much to throw away.
          </p>

          <div className="space-y-2">
            <p className="font-mono text-[10px] text-accent uppercase tracking-widest">
              ✦ The Notebook
            </p>
            <Notebook
              chapters={NOTEBOOK_DEMO_CHAPTERS}
              footerLabel="playground"
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
