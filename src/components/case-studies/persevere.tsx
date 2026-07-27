import React from "react";

/**
 * Persevere — Case Study
 * -----------------------------------------------------------------------
 * A living case-study page. Sections 2–3 will fill out as the brief and
 * further decisions land — search "TODO" to find what's still open.
 *
 * Palette (derived from the actual design decision made on this project):
 *   warmBlack   #1B1713   — new anchor dark, replaced the founders' plum
 *   oxblood     #5E1A22   — their original colour, kept as an accent
 *   plumGhost   #5B3A52   — the rejected "before" colour, shown struck out
 *   paper       #F3EEE6   — warm off-white page background
 *   brass       #B08A4E   — supporting accent / dividers
 *   ink         #2A2420   — body text
 *
 * Type:
 *   Display — "Fraunces" (characterful serif, used sparingly, large sizes only)
 *   Body/UI — "Inter" (quiet workhorse for everything else)
 *
 * Tailwind is used only for layout/spacing/type-scale utilities.
 * All custom colors are applied via inline style, per the core-utilities-only constraint.
 */

const colors = {
  warmBlack: "#1B1713",
  oxblood: "#5E1A22",
  plumGhost: "#5B3A52",
  paper: "#F3EEE6",
  brass: "#B08A4E",
  ink: "#2A2420",
  inkSoft: "#6B6259",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs tracking-[0.25em] uppercase mb-4"
      style={{ color: colors.brass, fontFamily: "Inter, sans-serif" }}
    >
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
        className="w-14 h-14 rounded-full shrink-0"
        style={{
          backgroundColor: hex,
          border: `1px solid ${colors.brass}55`,
          opacity: struck ? 0.45 : 1,
        }}
      />
      <div>
        <p
          className="text-sm font-medium"
          style={{
            color: struck ? colors.inkSoft : colors.ink,
            textDecoration: struck ? "line-through" : "none",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {name}
        </p>
        {note && (
          <p
            className="text-xs mt-0.5"
            style={{ color: colors.inkSoft, fontFamily: "Inter, sans-serif" }}
          >
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PersevereCaseStudy() {
  return (
    <div style={{ backgroundColor: colors.paper, color: colors.ink }}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
      />

      <main className="max-w-3xl mx-auto px-6 py-24">
        {/* ---------------------------------------------------------------- */}
        {/* Hero */}
        {/* ---------------------------------------------------------------- */}
        <header className="mb-24">
          <SectionLabel>Case Study — In Progress</SectionLabel>
          <h1
            className="text-5xl sm:text-6xl leading-[1.05] mb-6"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
          >
            Persevere
          </h1>
          <p
            className="text-lg sm:text-xl max-w-xl"
            style={{ color: colors.inkSoft, fontFamily: "Inter, sans-serif" }}
          >
            Designing a website for a digital marketing agency that had to be
            fun, capable, and unmistakably itself.
          </p>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* 1. Project Intro */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-20">
          <SectionLabel>The Project</SectionLabel>
          <p
            className="text-xl sm:text-2xl leading-relaxed"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
          >
            Persevere is a full-service digital marketing agency — videography,
            photography, content creation, and strategy under one roof — run by
            two best friends whose skillsets fill a gap in the market. The brief
            was to set the tone for a brand-new business: fun yet capable, with
            charm and care built into every detail.
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* 2. My Role */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-20">
          <SectionLabel>My Role</SectionLabel>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl"
            style={{ fontFamily: "Inter, sans-serif", color: colors.ink }}
          >
            I'm the designer behind the site from the ground up — setting the
            visual tone, proposing the colour system, and shaping how the brand
            feels before a single page goes live. I'm working directly with the
            two founders, translating their personalities and the gap they fill
            in the market into something visual.
          </p>
          {/* TODO: confirm scope (design only vs. design + build) once brief lands */}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* 3. Key Design Decisions */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-20">
          <SectionLabel>Key Decisions</SectionLabel>

          <div className="mb-4">
            <h3
              className="text-2xl sm:text-3xl mb-3"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 500 }}
            >
              Trading deep plum for warm black
            </h3>
            <p
              className="text-base leading-relaxed mb-8 max-w-2xl"
              style={{ fontFamily: "Inter, sans-serif", color: colors.inkSoft }}
            >
              The founders came in with a deep plum as their anchor dark colour.
              Rather than throw it out, I repositioned it — warm black became
              the new foundation, giving the site a more sophisticated,
              editorial feel, while their original plum instinct survived as
              oxblood, used as an accent rather than the base. They loved it.
            </p>

            <div
              className="rounded-2xl p-6 sm:p-8 grid sm:grid-cols-2 gap-8"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${colors.brass}33`,
              }}
            >
              <div>
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-5"
                  style={{
                    color: colors.inkSoft,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Proposed
                </p>
                <div className="flex flex-col gap-5">
                  <Swatch
                    hex={colors.plumGhost}
                    name="Deep plum"
                    note="Original anchor dark"
                    struck
                  />
                </div>
              </div>
              <div>
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-5"
                  style={{
                    color: colors.brass,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Shipped
                </p>
                <div className="flex flex-col gap-5">
                  <Swatch
                    hex={colors.warmBlack}
                    name="Warm black"
                    note="New anchor dark"
                  />
                  <Swatch
                    hex={colors.oxblood}
                    name="Oxblood"
                    note="Their plum, kept as an accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TODO: Decision 2 — building out the full palette around warm black + oxblood */}
          {/* TODO: Decision 3 — likely a layout or content-structure decision once the brief lands */}
          <p
            className="text-sm mt-10 italic"
            style={{ color: colors.inkSoft, fontFamily: "Inter, sans-serif" }}
          >
            More decisions will be added here as the project progresses.
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* 4. Outcome */}
        {/* ---------------------------------------------------------------- */}
        <section className="mb-8">
          <SectionLabel>Outcome</SectionLabel>
          <p
            className="text-xl sm:text-2xl leading-relaxed"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
          >
            The revised palette gave the site an instantly more polished,
            professional feel than the founders' original direction — while
            keeping a personal thread back to what they came in wanting.
          </p>
          {/* TODO: add metrics / client feedback / launch date once available */}
        </section>
      </main>
    </div>
  );
}
