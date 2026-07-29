import { PenTool, ArrowRight } from "lucide-react";
import { PageShell } from "../layout/PageShell";
import { GlassCard } from "../ui/GlassCard";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";
import { cn } from "../../lib/utils";

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
  { hex: colors.plum, name: "Plum" },
];

// Ordered light to dark.
const finalPalette = [
  { hex: colors.paper, name: "Cream" },
  { hex: colors.gold, name: "Gold" },
  { hex: colors.coral, name: "Coral" },
  { hex: colors.terracotta, name: "Terracotta" },
  { hex: colors.plum, name: "Plum" },
  { hex: colors.oxblood, name: "Oxblood" },
  { hex: colors.warmBlack, name: "Warm black" },
];

// Section anchors, used by both the contents card and the id'd wrappers
// below. Keeping this as a single source of truth means adding a new
// section only requires updating it in one place.
const SECTIONS = [
  { id: "project", label: "the project" },
  { id: "role", label: "my role" },
  { id: "decisions", label: "key decisions" },
  { id: "outcome", label: "outcome" },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-sm text-accent lowercase tracking-widest mb-4">
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
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => jumpToSection(e, section.id)}
            className="group flex items-center justify-between py-3 pl-8 first:pt-0 last:pb-0"
          >
            <span className="font-mono text-sm text-neutral-100 group-hover:text-accent transition-colors">
              {section.label}
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

// A single numbered, collapsible "Key Decision" - the number + title +
// summary stay visible as the tl;dr, and the chevron expands to the full
// issue/what-I-did/outcome breakdown. New decisions just add another
// DecisionItem with the next number.
function DecisionItem({
  number,
  title,
  summary,
  children,
}: {
  number: number;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <AccordionItem value={`decision-${number}`}>
      <AccordionTrigger className="items-start py-5 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:mt-1.5">
        <div className="flex gap-4 text-left">
          <span className="font-pixie text-3xl sm:text-4xl leading-none text-accent/40 shrink-0">
            {String(number).padStart(2, "0")}
          </span>
          <div className="flex flex-col gap-1.5 pt-0.5">
            <h3 className="font-display text-xl sm:text-2xl text-neutral-100">
              {title}
            </h3>
            <p className="font-body text-sm font-normal leading-relaxed text-neutral-400">
              {summary}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-[calc(2.25rem+1rem)] sm:pl-[calc(2.75rem+1rem)]">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

// Fixed-size circles (not a share of the row width), so a palette always
// reads at the same scale whether the card holds 5 swatches or 7 - they
// just wrap onto a second line if the row runs out of space.
function PaletteCircleRow({
  swatches,
}: {
  swatches: { hex: string; name: string; picked?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {swatches.map((swatch) => (
        <div
          key={swatch.hex}
          className="flex w-10 flex-col items-center gap-1.5"
        >
          <div
            className={cn(
              "h-10 w-10 rounded-full ring-1 ring-black/10",
              swatch.picked && "ring-2 ring-accent ring-offset-2 ring-offset-transparent"
            )}
            style={{ backgroundColor: swatch.hex }}
          />
          <span className="font-mono text-[8px] tracking-wide text-neutral-400 truncate max-w-full">
            {swatch.name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PersevereCaseStudy() {
  return (
    <PageShell
      title="Persevere Media"
      subtitle="Designing a website for a digital marketing agency that has to deliver personality, reliability and stand out from the crowd."
      icon={<PenTool size={28} />}
    >
      <div className="flex flex-col gap-8">
        <ContentsCard />

        {/* 1. Project Intro */}
        <div id="project" className="scroll-mt-28">
          <GlassCard>
            <SectionLabel>The Project</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
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

            <Accordion type="single" collapsible defaultValue="decision-1">
              <DecisionItem
                number={1}
                title="Enhancing the Colour Palette"
                summary="The founders' plum read as too grey to anchor the site alone, so I shortlisted five proper darks for them to choose from - they picked oxblood and warm black, and every original colour still made the final cut."
              >
                <div className="flex flex-col gap-4">
                  {/* Issue */}
                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-[10px] text-accent uppercase tracking-widest">
                      Issue
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      The founders' original palette had real charm, but the
                      plum was reading too grey and washed-out to carry the site
                      as its dark anchor.
                    </p>
                    <PaletteCircleRow swatches={originalPalette} />
                  </div>

                  {/* Solution */}
                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-[10px] text-accent uppercase tracking-widest">
                      Solution
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      Kept plum in the palette as an accent, and shortlisted
                      five proper darks for the founders to choose from as the
                      new anchor.
                    </p>
                    <PaletteCircleRow swatches={darkOptions} />
                  </div>

                  {/* Impact */}
                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-[10px] text-accent uppercase tracking-widest">
                      Impact
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      They picked two - oxblood and warm black. Every colour
                      they walked in with is still in the final palette, and the
                      site now feels complete, polished and professional without
                      losing any of the original warmth.
                    </p>
                    <PaletteCircleRow swatches={finalPalette} />
                  </div>
                </div>
              </DecisionItem>

              {/* TODO: Decision 2 - building out the full palette around warm black + oxblood */}
              {/* TODO: Decision 3 - likely a layout or content-structure decision once the brief lands */}
            </Accordion>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}
