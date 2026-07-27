import { PenTool, ArrowRight } from "lucide-react";
import { PageShell } from "../layout/PageShell";
import { GlassCard } from "../ui/GlassCard";

/**
 * Persevere - Case Study
 * -----------------------------------------------------------------------
 * A living case-study page. Sections 2–3 will fill out as the brief and
 * further decisions land - search "TODO" to find what's still open.
 *
 * Palette - the actual client-approved Persevere palette:
 *   terracotta  #D5573B   - original palette, primary warm accent
 *   coral       #DF7F68   - original palette, secondary warm accent
 *   plum        #594157   - original palette, kept as an accent (too washed
 *                           out on its own to anchor the site as a dark)
 *   gold        #EDB03E   - original palette, accent
 *   paper       #F7F3E3   - original palette, page background
 *   oxblood     #4A1F1D   - added dark, picked by the founders
 *   warmBlack   #241914   - added dark, picked by the founders
 *
 * Both darks were shortlisted from a set of five options as a fix for the
 * plum reading as too grey/dull to anchor the site alone. The founders
 * picked both oxblood and warm black rather than just one.
 *
 * These are Persevere's own brand colours - kept as literal swatch values
 * since they're the subject of the case study. Everything else (type,
 * section chrome, card surfaces) uses this site's own theme.
 */
const colors = {
  terracotta: "#D5573B",
  coral: "#DF7F68",
  plum: "#594157",
  gold: "#EDB03E",
  paper: "#F7F3E3",
  oxblood: "#4A1F1D",
  warmBlack: "#241914",
};

// The five dark options I shortlisted as a fix for the plum reading too
// washed-out to anchor the site. Oxblood and warm black are the two the
// founders picked - both made it into the final palette.
// Ordered light to dark.
const darkOptions = [
  { hex: "#3D2B2E", name: "Aubergine", picked: false },
  { hex: "#4A1F1D", name: "Oxblood", picked: true },
  { hex: "#3A2620", name: "Espresso", picked: false },
  { hex: "#1B2A4A", name: "Midnight navy", picked: false },
  { hex: "#241914", name: "Warm black", picked: true },
];

// Ordered light to dark.
const originalPalette = [
  { hex: colors.paper, name: "Cream" },
  { hex: colors.gold, name: "Gold" },
  { hex: colors.coral, name: "Coral" },
  { hex: colors.terracotta, name: "Terracotta" },
  { hex: colors.plum, name: "Plum", note: "Too washed-out alone" },
];

// Ordered light to dark.
const finalPalette = [
  { hex: colors.paper, name: "Cream" },
  { hex: colors.gold, name: "Gold" },
  { hex: colors.coral, name: "Coral" },
  { hex: colors.terracotta, name: "Terracotta" },
  { hex: colors.plum, name: "Plum", note: "Accent" },
  { hex: colors.oxblood, name: "Oxblood", note: "Anchor dark" },
  { hex: colors.warmBlack, name: "Warm black", note: "Anchor dark" },
];

// Section anchors, used by both the contents card and the id'd wrappers
// below. Keeping this as a single source of truth means adding a new
// section only requires updating it in one place.
const SECTIONS = [
  { id: "project", label: "The Project" },
  { id: "role", label: "My Role" },
  { id: "decisions", label: "Key Decisions" },
  { id: "outcome", label: "Outcome" },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-4">
      {children}
    </p>
  );
}

// Scrolls to a section with an offset, so the target doesn't land hidden
// underneath a sticky header.
function jumpToSection(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ContentsCard() {
  return (
    <GlassCard>
      <SectionLabel>Contents</SectionLabel>
      <nav className="flex flex-col divide-y divide-accent/10">
        {SECTIONS.map((section, i) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => jumpToSection(e, section.id)}
            className="group flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <span className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-accent/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-body text-sm text-neutral-100 group-hover:text-accent transition-colors">
                {section.label}
              </span>
            </span>
            <ArrowRight
              size={14}
              className="text-neutral-500 group-hover:text-accent group-hover:translate-x-0.5 transition-all"
            />
          </a>
        ))}
      </nav>
    </GlassCard>
  );
}

function OptionSwatch({
  hex,
  name,
  picked,
}: {
  hex: string;
  name: string;
  picked: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className="w-9 h-9 rounded-full relative"
        style={{
          backgroundColor: hex,
          boxShadow: picked
            ? "0 0 0 3px #faf3e4, 0 0 0 4px var(--accent)"
            : "none",
          border: picked ? "none" : "1px solid rgba(0,0,0,0.15)",
        }}
      >
        {picked && (
          <span
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap text-neutral-950"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Picked
          </span>
        )}
      </div>
      <p className="font-body text-[11px] mt-1 text-neutral-400">{name}</p>
    </div>
  );
}

function MiniSwatch({
  hex,
  name,
  note,
}: {
  hex: string;
  name: string;
  note?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center w-16">
      <div
        className="w-9 h-9 rounded-full shrink-0 border border-accent/30"
        style={{ backgroundColor: hex }}
      />
      <div>
        <p className="font-body text-[11px] font-medium text-neutral-100 leading-tight">
          {name}
        </p>
        {note && (
          <p className="font-body text-[10px] text-neutral-500 leading-tight">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PersevereCaseStudy() {
  return (
    <PageShell
      title="Persevere Media"
      subtitle="Case Study - In Progress · Designing a website for a digital marketing agency that had to be fun, capable, and unmistakably itself."
      icon={<PenTool size={28} />}
    >
      <div className="flex flex-col gap-8">
        <ContentsCard />

        {/* 1. Project Intro */}
        <div id="project" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>The Project</SectionLabel>
            <p className="font-body text-xl sm:text-2xl leading-relaxed text-neutral-100">
              Persevere is a full-service digital marketing agency -
              videography, photography, content creation, and strategy under one
              roof - run by two best friends whose skillsets fill a gap in the
              market. The brief was to set the tone for a brand-new business:
              fun yet capable, with charm and care built into every detail.
            </p>
          </GlassCard>
        </div>

        {/* 2. My Role */}
        <div id="role" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>My Role</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              I'm the designer behind the site from the ground up - setting the
              visual tone, proposing the colour system, and shaping how the
              brand feels before a single page goes live. I'm working directly
              with the two founders, translating their personalities and the gap
              they fill in the market into something visual.
            </p>
            {/* TODO: confirm scope (design only vs. design + build) once brief lands */}
          </GlassCard>
        </div>

        {/* 3. Key Design Decisions */}
        <div id="decisions" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>Key Decisions</SectionLabel>

            <h3 className="font-body text-2xl sm:text-3xl mb-6 text-neutral-100">
              Giving a washed-out palette an anchor
            </h3>

            <div className="rounded-2xl border border-accent/20 bg-black/[0.03] grid sm:grid-cols-3 divide-y divide-accent/15 sm:divide-y-0 sm:divide-x sm:divide-accent/15">
              {/* Issue */}
              <div className="p-6 flex flex-col items-center text-center">
                <div className="flex flex-col items-center gap-4 flex-1">
                  <p className="font-mono text-[10px] text-accent uppercase tracking-widest">
                    Issue
                  </p>
                  <p className="font-body text-xs leading-relaxed text-neutral-400">
                    The founders' original palette had real charm, but the plum
                    was reading too grey and washed-out to carry the site as its
                    dark anchor.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 mt-2">
                  <MiniSwatch {...originalPalette[0]} />
                  <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-4">
                    {originalPalette.slice(1).map((swatch) => (
                      <MiniSwatch key={swatch.hex} {...swatch} />
                    ))}
                  </div>
                </div>
              </div>

              {/* What I Did */}
              <div className="p-6 flex flex-col items-center text-center">
                <div className="flex flex-col items-center gap-4 flex-1">
                  <p className="font-mono text-[10px] text-accent uppercase tracking-widest">
                    What I Did
                  </p>
                  <p className="font-body text-xs leading-relaxed text-neutral-400">
                    Kept plum in the palette as an accent, and shortlisted five
                    proper darks for the founders to choose from as the new
                    anchor.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-6 mt-2">
                  <OptionSwatch
                    hex={darkOptions[0].hex}
                    name={darkOptions[0].name}
                    picked={darkOptions[0].picked}
                  />
                  <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6">
                    {darkOptions.slice(1).map((opt) => (
                      <OptionSwatch
                        key={opt.hex}
                        hex={opt.hex}
                        name={opt.name}
                        picked={opt.picked}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Outcome */}
              <div className="p-6 flex flex-col items-center text-center">
                <div className="flex flex-col items-center gap-4 flex-1">
                  <p className="font-mono text-[10px] text-accent uppercase tracking-widest">
                    Outcome
                  </p>
                  <p className="font-body text-xs leading-relaxed text-neutral-400">
                    They picked two - oxblood and warm black - rather than just
                    one. Every colour they walked in with is still in the final
                    palette.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 mt-2">
                  <MiniSwatch {...finalPalette[0]} />
                  <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-4">
                    {finalPalette.slice(1).map((swatch) => (
                      <MiniSwatch key={swatch.hex} {...swatch} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TODO: Decision 2 - building out the full palette around warm black + oxblood */}
            {/* TODO: Decision 3 - likely a layout or content-structure decision once the brief lands */}
            <p className="font-body text-xs mt-8 italic text-neutral-500">
              Anchoring the palette with oxblood and warm black gave the site an
              instantly more polished, professional feel - without losing any of
              the warmth the founders started with. Every colour they walked in
              with is still in the final palette.
            </p>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
