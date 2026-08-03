import { PenTool, ArrowRight } from "lucide-react";
import { PageShell } from "../layout/PageShell";
import { GlassCard } from "../ui/GlassCard";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";

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
 *   oxblood     #4A1F1D   - added dark, picked by the clients
 *   warmBlack   #241914   - added dark, picked by the clients
 *
 * Both darks were shortlisted from a set of five options as a fix for the
 * plum reading as too grey/dull to anchor the site alone. The clients
 * picked both oxblood and warm black rather than just one.
 *
 * These are Persevere's own brand colours - kept as literal swatch values
 * since they're the subject of the case study. Everything else (type,
 * section chrome, card surfaces) uses this site's own theme.
 */
const colours = {
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
// clients picked - both made it into the final palette.
// Ordered light to dark.
const darkOptions = [
  { hex: "#3D2B2E", name: "Aubergine" },
  { hex: "#4A1F1D", name: "Oxblood" },
  { hex: "#3A2620", name: "Espresso" },
  { hex: "#1B2A4A", name: "Midnight navy" },
  { hex: "#241914", name: "Warm black" },
];

// Ordered light to dark.
const originalPalette = [
  { hex: colours.paper, name: "Cream" },
  { hex: colours.gold, name: "Gold" },
  { hex: colours.coral, name: "Coral" },
  { hex: colours.terracotta, name: "Terracotta" },
  { hex: colours.plum, name: "Plum" },
];

// Ordered light to dark.
const finalPalette = [
  { hex: colours.paper, name: "Cream" },
  { hex: colours.gold, name: "Gold" },
  { hex: colours.coral, name: "Coral" },
  { hex: colours.terracotta, name: "Terracotta" },
  { hex: colours.plum, name: "Plum" },
  { hex: colours.oxblood, name: "Oxblood" },
  { hex: colours.warmBlack, name: "Warm black" },
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
          <span className="font-pixie text-6xl sm:text-7xl leading-none text-accent shrink-0">
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
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

// Fixed-size circles (not a share of the row width), so a palette always
// reads at the same scale whether the card holds 5 swatches or 7 - they
// just wrap onto a second line if the row runs out of space.
function PaletteCircleRow({
  swatches,
}: {
  swatches: { hex: string; name: string }[];
}) {
  return (
    <div className="flex w-full items-start justify-between">
      {swatches.map((swatch) => (
        <div
          key={swatch.hex}
          className="flex flex-1 flex-col items-center gap-1.5 min-w-0"
        >
          <div
            className="h-10 w-10 rounded-full ring-1 ring-black/10 transition-transform duration-200 ease-out hover:scale-125"
            style={{ backgroundColor: swatch.hex }}
          />
          <span className="font-mono text-xs tracking-wide text-neutral-400 truncate max-w-full">
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
              with the clients, translating their personalities and the gap they
              fill in the market into something visual.
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
                title="Optimised the Colour Palette"
                summary="Introduced warm chromatic neutrals as intentional dark anchors, giving structure to the layout and elevating visual hierarchy without compromising the clients' original palette."
              >
                <div className="flex flex-col gap-4">
                  {/* Issue */}
                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-sm text-accent uppercase tracking-widest">
                      Issue
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      I felt that the plum was pulling grey and washed-out next
                      to the palette's warm terracotta and gold tones. Since the
                      clients loved the purple, I wanted to keep it as an
                      accent, but the page still needed a proper dark anchor to
                      hold everything together.
                    </p>
                    <PaletteCircleRow swatches={originalPalette} />
                  </div>

                  {/* Solution */}
                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-sm text-accent uppercase tracking-widest">
                      Solution
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      I ruled out true-black early because its absolute
                      desaturation creates a cold, clinical contrast that
                      clashes with the brand's warm personality. From a colour
                      theory perspective, pure black absorbs all light and lacks
                      a colour temperature, so I instead proposed warm chromatic
                      neutrals like oxblood and espresso to maintain a unified
                      colour temperature with the sunset-inspired palette. I
                      also tested a warm navy blue option after one of the
                      clients enquired about its possible use. I lay all five
                      choices out side by side so they could compare them
                      directly against the existing colours.
                    </p>

                    <PaletteCircleRow swatches={darkOptions} />
                  </div>

                  {/* Impact */}
                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-sm text-accent uppercase tracking-widest">
                      Impact
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      The clients picked two dark colours - oxblood and warm
                      black. Every colour they selected is still in the final
                      palette, including the plum. Introducing these dark
                      anchors establishes a clear visual hierarchy that will
                      anchor the layout, naturally guiding user attention to key
                      conversion points across the site.
                    </p>
                    <PaletteCircleRow swatches={finalPalette} />
                  </div>
                </div>
              </DecisionItem>

              <DecisionItem
                number={2}
                title="Made Blog Publishing Self-Serve"
                summary="Removed the developer bottleneck from routine content updates by integrating a CMS with secure GitHub authentication, giving the founders a self-serve publishing flow that still runs through automated review before anything goes live."
              >
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-sm text-accent uppercase tracking-widest">
                      Issue
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      I noticed that every blog update would have to route
                      through me first. Persevere's founders wanted to post
                      often, but a simple copy change meant writing it, sending
                      it over, waiting on me to code it in, then a review and
                      deploy. That lead time didn't match how often a marketing
                      agency actually needs to publish, and it made me a
                      dependency for something that should have been quick and
                      easy on their end.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-sm text-accent uppercase tracking-widest">
                      Solution
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      I decided the fix wasn't a faster turnaround from me, it
                      was removing me from the loop entirely for routine
                      updates. I chose to integrate Decap CMS, giving the
                      founders a simple login portal to write and publish posts
                      themselves, no code involved. But self-serve publishing on
                      its own felt risky without a safety net, so I built in a
                      review layer rather than letting posts go straight live:
                      every change opens as a pull request, runs through
                      automated checks, and only publishes once approved. I also
                      deployed and configured the authentication layer needed to
                      connect the CMS securely to the site's GitHub repository,
                      without touching the site's existing custom design or
                      performance.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-sm text-accent uppercase tracking-widest">
                      Impact
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      The founders now publish on their own schedule with no
                      developer bottleneck, while the review pipeline means
                      nothing goes live broken or unchecked. It's the kind of
                      setup that gives any client faster content turnaround and
                      genuine independence, without trading away the stability
                      of a properly reviewed release process.
                    </p>
                  </div>
                </div>
              </DecisionItem>

              <DecisionItem
                number={3}
                title="Built Secure, Spam-Protected Form Handling"
                summary="Connected the contact form to a real email pipeline that runs safely behind the scenes, with genuine bot protection that never gets in a visitor's way."
              >
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-sm text-accent uppercase tracking-widest">
                      Issue
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      The contact form had nowhere real to send its data.
                      GitHub Pages, where the site is hosted, only serves static
                      files and can't run any server-side code, so there was no
                      safe way to email submissions without exposing credentials
                      in the browser, or leaving the form wide open to spam bots.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-sm text-accent uppercase tracking-widest">
                      Solution
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      I weighed pointing the form at a third-party form service
                      against building something dedicated, and chose to build
                      a small serverless function so the client would have full
                      control over their own data rather than routing enquiries
                      through someone else's platform. That function sends
                      submissions through Resend's email API, with the API key
                      living only in the server environment, never exposed in
                      the browser. For spam, I didn't want to rely on a single
                      layer of defence, so I combined a hidden honeypot field to
                      catch simple bots outright with Google's reCAPTCHA v3
                      running invisibly in the background, scoring each
                      submission on how human it looks before any email gets
                      sent. Real visitors never see a checkbox or a challenge,
                      the whole thing runs silently while they fill out the form
                      normally.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                    <p className="font-mono text-sm text-accent uppercase tracking-widest">
                      Impact
                    </p>
                    <p className="font-body text-sm leading-relaxed text-neutral-400">
                      Every genuine enquiry now lands straight in the client's
                      inbox, reliably and securely, without them needing to
                      manage any infrastructure themselves. Spam and bot
                      submissions get filtered out before they ever reach a
                      human, keeping the inbox clean without adding friction for
                      real customers trying to get in touch.
                    </p>
                  </div>
                </div>
              </DecisionItem>
            </Accordion>
          </GlassCard>
        </div>
      </div>
    </PageShell>
  );
}