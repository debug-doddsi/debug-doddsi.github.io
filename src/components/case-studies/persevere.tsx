import { PenTool } from "lucide-react";
import { PageShell } from "../layout/PageShell";
import { BentoGrid, BentoCard } from "../ui/bento-grid";
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

// Shared width for the decision number column, used both on the trigger's
// number glyph and as an invisible spacer above the accordion content, so
// the expanded Issue/Solution/Impact cards line up under the title instead
// of sitting flush left under the number.
const NUMBER_COLUMN_WIDTH = "w-14 sm:w-16";

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-sm text-accent lowercase tracking-widest mb-4">
      {children}
    </p>
  );
}

// A single numbered, collapsible "Key Decision" - the number + title +
// summary stay visible as the tl;dr, and the chevron expands to the full
// issue/what-I-did/outcome breakdown. New decisions just add another
// DecisionItem with the next number.
//
// The number column has a fixed width (NUMBER_COLUMN_WIDTH), reused as an
// invisible spacer above the accordion content, so the expanded cards align
// under the title/summary text rather than sitting under the number itself.
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
          <span
            className={`font-pixie text-6xl sm:text-7xl leading-none text-accent shrink-0 text-center ${NUMBER_COLUMN_WIDTH}`}
          >
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
      <AccordionContent>
        <div className="flex gap-4">
          <span
            className={`shrink-0 ${NUMBER_COLUMN_WIDTH}`}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// Fixed-size circles (not a share of the row width), so a palette always
// reads at the same scale whether the card holds 5 swatches or 7 - they
// just wrap onto a second line if the row runs out of space.
function PaletteCircleRow({
  swatches,
  showNames = true,
}: {
  swatches: { hex: string; name: string }[];
  showNames?: boolean;
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
          {showNames && (
            <span className="font-mono text-xs tracking-wide text-neutral-400 truncate max-w-full">
              {swatch.name}
            </span>
          )}
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
      <BentoGrid>
        {/* 1. Overview */}
        <BentoCard size="sm">
          <div>
            <SectionLabel>Overview</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              Persevere Media is an Edinburgh-based digital marketing agency putting paid media
              and creative production under one roof.
            </p>
          </div>
        </BentoCard>

        {/* 2. My Role */}
        <BentoCard size="wide">
          <div>
            <SectionLabel>My Role</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              I own this project end to end, working directly with the
              clients to turn their personality and market position into
              something that attracts and converts their ideal customers.
              <br/><br/>
              I am responsible for:
              <br/>
              <strong className="font-semibold">Design</strong> of the visual tone, colour system and brand feel.
              <br/>
              <strong className="font-semibold">Development</strong> of the site and its backend infrastructure.
            </p>
          </div>
        </BentoCard>

        {/* 3. The Brief */}
        <BentoCard size="full">
          <div>
            <SectionLabel>The Brief</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              A website for <strong className="font-semibold">business owners looking to scale</strong>,
              built to convert on the first fold and stand apart from the
              generic, corporate look agency sites typically default to.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 font-body text-sm leading-relaxed text-neutral-400">
              <li>
                Prove Persevere's <strong className="font-semibold">credibility and capability</strong> immediately, to drive discovery call bookings
              </li>
              <li>
                Carry a <strong className="font-semibold">gritty, for-the-people</strong> attitude through the design itself
              </li>
              <li>
                Brand voice is <strong className="font-semibold">anti-establishment</strong>: plain-spoken, rhythmic, inspired by monologues from the movie Trainspotting
              </li>
              <li>
                <strong className="font-semibold">No agency jargon</strong>
              </li>
            </ul>
          </div>
        </BentoCard>

        {/* 4. Key Design Decisions */}
        <BentoCard size="full">
          <SectionLabel>Key Decisions</SectionLabel>

          <Accordion type="single" collapsible>
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
                    a colour temperature. So I instead proposed warm chromatic
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
                    The clients picked two dark colours: oxblood and warm
                    black. Every colour they selected is still in the final
                    palette, including the plum. Introducing these dark
                    anchors establishes a clear visual hierarchy that anchors
                    the layout. It naturally guides user attention to key
                    conversion points across the site.
                  </p>
                  <PaletteCircleRow swatches={finalPalette} showNames={false} />
                </div>
              </div>
            </DecisionItem>

            <DecisionItem
              number={2}
              title="Made Blog Publishing Self-Serve"
              summary="Removed the developer bottleneck from routine content updates by integrating a CMS with secure GitHub authentication. The result is a self-serve publishing flow for the founders that still runs through automated review before anything goes live."
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
                    agency actually needs to publish. It also made me a
                    dependency for something that should have been quick and
                    easy on their end.
                  </p>
                </div>

                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Solution
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    I decided the fix wasn't a faster turnaround from me. It
                    was removing me from the loop entirely for routine
                    updates. I chose to integrate Decap CMS, giving the
                    founders a simple login portal to write and publish posts
                    themselves, no code involved. But self-serve publishing on
                    its own felt risky without a safety net. So I built in a
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
                    developer bottleneck. The review pipeline still means
                    nothing goes live broken or unchecked. It's the kind of
                    setup that gives any client faster content turnaround and
                    genuine independence, and it doesn't trade away the
                    stability of a properly reviewed release process.
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
                    The contact form had nowhere real to send its data. GitHub
                    Pages, where the site is hosted, only serves static files
                    and can't run any server-side code. That left no safe way
                    to email submissions without exposing credentials in the
                    browser, or leaving the form wide open to spam bots.
                  </p>
                </div>

                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Solution
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    I weighed pointing the form at a third-party form service
                    against building something dedicated. I chose to build a
                    small serverless function so the client would have full
                    control over their own data rather than routing enquiries
                    through someone else's platform. That function sends
                    submissions through Resend's email API, with the API key
                    living only in the server environment, never exposed in
                    the browser. For spam, I didn't want to rely on a single
                    layer of defence. So I combined a hidden honeypot field to
                    catch simple bots outright with Google's reCAPTCHA v3,
                    running invisibly in the background and scoring each
                    submission on how human it looks before any email gets
                    sent. Real visitors never see a checkbox or a challenge.
                    The whole thing runs silently while they fill out the form
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
                    human. That keeps the inbox clean without adding friction
                    for real customers trying to get in touch.
                  </p>
                </div>
              </div>
            </DecisionItem>
          </Accordion>
        </BentoCard>
      </BentoGrid>
    </PageShell>
  );
}
