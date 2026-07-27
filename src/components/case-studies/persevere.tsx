import { PenTool } from "lucide-react";
import { PageShell } from "../ui/PageShell";
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
const darkOptions = [
  { hex: "#3A2620", name: "Espresso", picked: false },
  { hex: "#4A1F1D", name: "Oxblood", picked: true },
  { hex: "#3D2B2E", name: "Aubergine", picked: false },
  { hex: "#1B2A4A", name: "Midnight navy", picked: false },
  { hex: "#241914", name: "Warm black", picked: true },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-4">
      {children}
    </p>
  );
}

function Swatch({
  hex,
  name,
  note,
  struck,
}: {
  hex: string;
  name: string;
  note?: string;
  struck?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-14 h-14 rounded-full shrink-0 border border-accent/30"
        style={{ backgroundColor: hex, opacity: struck ? 0.45 : 1 }}
      />
      <div>
        <p
          className={`font-body text-sm font-medium ${
            struck ? "text-neutral-500 line-through" : "text-neutral-100"
          }`}
        >
          {name}
        </p>
        {note && (
          <p className="font-body text-xs text-neutral-400 mt-0.5">{note}</p>
        )}
      </div>
    </div>
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
        className="w-16 h-16 rounded-full relative"
        style={{
          backgroundColor: hex,
          boxShadow: picked
            ? "0 0 0 3px #241914, 0 0 0 5px var(--accent)"
            : "1px solid rgba(255,255,255,0.2)",
          border: picked ? "none" : "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {picked && (
          <span
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full whitespace-nowrap text-neutral-950"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Picked
          </span>
        )}
      </div>
      <p className="font-body text-xs mt-1" style={{ color: "#F7F3E3", opacity: 0.7 }}>
        {name}
      </p>
    </div>
  );
}

export default function PersevereCaseStudy() {
  return (
    <PageShell
      title="Persevere"
      subtitle="Case Study - In Progress · Designing a website for a digital marketing agency that had to be fun, capable, and unmistakably itself."
      icon={<PenTool size={28} />}
    >
      <div className="flex flex-col gap-6">
        {/* 1. Project Intro */}
        <GlassCard>
          <SectionLabel>The Project</SectionLabel>
          <p className="font-display text-xl sm:text-2xl leading-relaxed text-neutral-100">
            Persevere is a full-service digital marketing agency - videography,
            photography, content creation, and strategy under one roof - run by
            two best friends whose skillsets fill a gap in the market. The brief
            was to set the tone for a brand-new business: fun yet capable, with
            charm and care built into every detail.
          </p>
        </GlassCard>

        {/* 2. My Role */}
        <GlassCard>
          <SectionLabel>My Role</SectionLabel>
          <p className="font-body text-sm leading-relaxed text-neutral-400">
            I'm the designer behind the site from the ground up - setting the
            visual tone, proposing the colour system, and shaping how the brand
            feels before a single page goes live. I'm working directly with the
            two founders, translating their personalities and the gap they fill
            in the market into something visual.
          </p>
          {/* TODO: confirm scope (design only vs. design + build) once brief lands */}
        </GlassCard>

        {/* 3. Key Design Decisions */}
        <GlassCard>
          <SectionLabel>Key Decisions</SectionLabel>

          <h3 className="font-display text-2xl sm:text-3xl mb-3 text-neutral-100">
            Giving a washed-out palette an anchor
          </h3>
          <p className="font-body text-sm leading-relaxed mb-8 text-neutral-400">
            The founders' original palette - terracotta, coral, plum, gold,
            and a warm cream - had real charm, but the plum was reading too
            grey and washed-out to carry the site as its dark anchor. I kept
            it in the palette as an accent and proposed shortlisting a proper
            dark from five options. They picked two: oxblood and warm black.
            Both made it into the final palette.
          </p>

          {/* Group 1 - the founders' original palette */}
          <div className="rounded-2xl p-6 sm:p-8 mb-6 border border-accent/20 bg-black/[0.03]">
            <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest mb-5">
              01 - What the founders provided
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              <Swatch hex={colors.terracotta} name="Terracotta" />
              <Swatch hex={colors.coral} name="Coral" />
              <Swatch
                hex={colors.plum}
                name="Plum"
                note="Too washed-out to anchor alone"
              />
              <Swatch hex={colors.gold} name="Gold" />
              <Swatch hex={colors.paper} name="Cream" />
            </div>
          </div>

          {/* Group 2 - the range of dark options I suggested */}
          <div
            className="rounded-2xl p-6 sm:p-8 mb-6"
            style={{ backgroundColor: colors.warmBlack }}
          >
            <p
              className="font-mono text-[10px] uppercase tracking-widest mb-6"
              style={{ color: "#F7F3E3", opacity: 0.7 }}
            >
              02 - The range I suggested
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-8">
              {darkOptions.map((opt) => (
                <OptionSwatch
                  key={opt.hex}
                  hex={opt.hex}
                  name={opt.name}
                  picked={opt.picked}
                />
              ))}
            </div>
            <p
              className="font-body text-xs mt-8"
              style={{ color: "#F7F3E3", opacity: 0.55 }}
            >
              They picked two - oxblood and warm black - rather than just one.
            </p>
          </div>

          {/* Group 3 - the final palette, inclusive of the picked darks */}
          <div className="rounded-2xl p-6 sm:p-8 border border-accent/20 bg-black/[0.03]">
            <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-5">
              03 - Final palette
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              <Swatch hex={colors.terracotta} name="Terracotta" />
              <Swatch hex={colors.coral} name="Coral" />
              <Swatch hex={colors.plum} name="Plum" note="Accent" />
              <Swatch hex={colors.gold} name="Gold" />
              <Swatch hex={colors.paper} name="Cream" />
              <Swatch
                hex={colors.oxblood}
                name="Oxblood"
                note="New anchor dark"
              />
              <Swatch
                hex={colors.warmBlack}
                name="Warm black"
                note="New anchor dark"
              />
            </div>
          </div>

          {/* TODO: Decision 2 - building out the full palette around warm black + oxblood */}
          {/* TODO: Decision 3 - likely a layout or content-structure decision once the brief lands */}
          <p className="font-body text-xs mt-8 italic text-neutral-500">
            More decisions will be added here as the project progresses.
          </p>
        </GlassCard>

        {/* 4. Outcome */}
        <GlassCard>
          <SectionLabel>Outcome</SectionLabel>
          <p className="font-display text-xl sm:text-2xl leading-relaxed text-neutral-100">
            Anchoring the palette with oxblood and warm black gave the site an
            instantly more polished, professional feel - without losing any of
            the warmth the founders started with. Every colour they walked in
            with is still in the final palette.
          </p>
          {/* TODO: add metrics / client feedback / launch date once available */}
        </GlassCard>
      </div>
    </PageShell>
  );
}
