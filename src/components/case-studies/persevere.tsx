import { PenTool } from "lucide-react";
import { PageShell } from "../layout/PageShell";
import { BentoGrid, BentoCard } from "../ui/bento-grid";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion";

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

// The three foundry options shortlisted for the brand typeface pairing,
// ordered to match the narrative (Jamboree, Motion Sickness, Pomelo).
const fontSpecimens = [
  { src: "/case-studies/persevere/jam.png", name: "Jamboree" },
  { src: "/case-studies/persevere/motion.png", name: "Motion Sickness" },
  { src: "/case-studies/persevere/Pomelo.png", name: "Pomelo" },
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

// One column of the project-meta strip - a label up top, a short 1-2 word
// value beneath it.
function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-mono text-xs text-accent lowercase tracking-widest">
        {label}
      </p>
      <p className="font-body text-xs text-neutral-400">{value}</p>
    </div>
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
}: {
  swatches: { hex: string; name: string }[];
}) {
  return (
    <div className="flex w-full items-start justify-between">
      {swatches.map((swatch) => (
        <div
          key={swatch.hex}
          className="flex flex-1 items-center justify-center min-w-0"
        >
          <div
            className="h-10 w-10 rounded-full ring-1 ring-black/10 transition-transform duration-200 ease-out hover:scale-125"
            style={{ backgroundColor: swatch.hex }}
          />
        </div>
      ))}
    </div>
  );
}

// Type specimens for the shortlisted foundry options, shown as a row of
// framed images so readers can see the letterforms rather than take the
// names on faith.
function FontSpecimenRow({
  specimens,
}: {
  specimens: { src: string; name: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {specimens.map((specimen) => (
        <div key={specimen.name} className="flex flex-col gap-2">
          <div className="aspect-square w-full overflow-hidden rounded-xl ring-1 ring-black/10">
            <img
              src={specimen.src}
              alt={`${specimen.name} typeface specimen`}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-mono text-xs tracking-widest text-neutral-400 text-center">
            {specimen.name}
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
      <BentoGrid>
        {/* 1. Hero Screenshot / GIF */}
        <BentoCard size="full" className="!min-h-0">
          <div className="aspect-video w-full overflow-hidden rounded-xl ring-1 ring-black/10">
            <img
              src="/case-studies/persevere/artifact-1.png"
              alt="Screenshot of the final Persevere Media artifacts"
              className="h-full w-full object-cover"
            />
          </div>
        </BentoCard>

        {/* 2. Project Meta */}
        <BentoCard size="sm">
          <div className="flex flex-col gap-3">
            <MetaItem label="Timeline" value="July - September 2026" />
            <MetaItem label="Team" value="Solo" />
            <MetaItem
              label="Skills"
              value="UI/UX Design, Requirements Gathering, Frontend Development"
            />
          </div>
        </BentoCard>

        {/* 3. Overview */}
        <BentoCard size="wide">
          <div>
            <SectionLabel>Overview</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              Persevere Media is a new Edinburgh-based digital marketing agency
              putting paid media and creative production under one roof. This
              project allowed me to design and build something from scratch and
              define a brand's breakout identity on launch.
            </p>
          </div>
        </BentoCard>

        {/* 4. My Role */}
        <BentoCard size="wide">
          <div>
            <SectionLabel>My Role</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              I own this project end to end, working directly with the clients
              to turn their personality and market position into something that
              attracts and converts their ideal customers.
              <br />
              <br />
              I am responsible for:
              <br />
              <strong className="font-semibold">Design</strong> of the visual
              tone, colour system and brand feel.
              <br />
              <strong className="font-semibold">Development</strong> of the site
              and its backend infrastructure.
            </p>
          </div>
        </BentoCard>

        <BentoCard size="sm">
          <div>
            <SectionLabel>Context</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              First impressions of Persevere matter, especially when
              cold-launched. The site had to prove reliability and skill
              immediately and burst onto the scene rather than blend in.
            </p>
          </div>
        </BentoCard>

        {/* 5. The Brief */}
        <BentoCard size="full">
          <div>
            <SectionLabel>The Brief</SectionLabel>
            <p className="font-body text-sm leading-relaxed text-neutral-400">
              A website for{" "}
              <strong className="font-semibold">
                business owners looking to scale
              </strong>
              , built to convert on the first fold and stand apart from the
              generic, corporate look agency sites typically default to.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 font-body text-sm leading-relaxed text-neutral-400">
              <li>
                Prove Persevere's{" "}
                <strong className="font-semibold">
                  credibility and capability
                </strong>{" "}
                immediately, to drive discovery call bookings
              </li>
              <li>
                Carry a{" "}
                <strong className="font-semibold">
                  gritty, for-the-people
                </strong>{" "}
                attitude through the design itself
              </li>
              <li>
                Brand voice is{" "}
                <strong className="font-semibold">anti-establishment</strong>:
                plain-spoken, rhythmic, inspired by monologues from the movie
                Trainspotting
              </li>
              <li>
                <strong className="font-semibold">No agency jargon</strong>
              </li>
            </ul>
          </div>
        </BentoCard>

        {/* 6. Key Design Decisions */}
        <BentoCard size="full">
          <SectionLabel>Key Decisions</SectionLabel>

          <Accordion type="single" collapsible>
            <DecisionItem
              number={1}
              title="Optimised the Colour Palette"
              summary="Introduced warm chromatic neutrals as intentional dark anchors, giving the layout a proper contrast point without compromising the clients' original palette."
            >
              <div className="flex flex-col gap-4">
                {/* Issue */}
                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Issue
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    I felt that the plum was pulling grey and washed-out next to
                    the palette's warm terracotta and gold tones. Since the
                    clients loved the purple, I wanted to keep it as an accent,
                    but the page still needed a proper dark anchor to hold
                    everything together.
                  </p>
                  <PaletteCircleRow swatches={originalPalette} />
                </div>

                {/* Solution */}
                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Solution
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    True black was out early - it's too cold and clinical next
                    to a palette this warm. I proposed oxblood and espresso
                    instead, both closer in temperature to the sunset tones, and
                    threw in a warm navy after one of the clients asked about
                    it. Laid all five out next to the existing colours so they
                    could compare directly.
                  </p>

                  <PaletteCircleRow swatches={darkOptions} />
                </div>

                {/* Impact */}
                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Impact
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    The clients picked two dark colours: oxblood and warm black.
                    Every colour they selected is still in the final palette,
                    including the plum, and the layout finally has a proper dark
                    anchor to build contrast from.
                  </p>
                  <PaletteCircleRow swatches={finalPalette} />
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
                    I noticed that every blog update would have to route through
                    me first. Persevere's founders wanted to post often, but a
                    simple copy change meant writing it, sending it over,
                    waiting on me to code it in, then a review and deploy. That
                    lead time didn't match how often a marketing agency actually
                    needs to publish. It also made me a dependency for something
                    that should have been quick and easy on their end.
                  </p>
                </div>

                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Solution
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    The fix wasn't a faster turnaround from me - it was removing
                    myself from the loop entirely for routine updates. I chose
                    to integrate Decap CMS, giving the founders a simple login
                    portal to write and publish posts themselves, no code
                    involved. But self-serve publishing on its own felt risky
                    without a safety net. So I built in a review layer rather
                    than letting posts go straight live: every change opens as a
                    pull request, runs through automated checks, and only
                    publishes once approved. I also deployed and configured the
                    authentication layer needed to connect the CMS securely to
                    the site's GitHub repository, without touching the site's
                    existing custom design or performance.
                  </p>
                </div>

                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Impact
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    The founders now publish on their own schedule with no
                    developer bottleneck. The review pipeline still catches
                    anything before it goes live, so Persevere gets faster
                    turnaround without losing that safety net.
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
                    and can't run any server-side code. That left no safe way to
                    email submissions without exposing credentials in the
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
                    living only in the server environment, never exposed in the
                    browser. For spam, I didn't want to rely on a single layer
                    of defence. So I combined a hidden honeypot field to catch
                    simple bots outright with Google's reCAPTCHA v3, running
                    invisibly in the background and scoring each submission on
                    how human it looks before any email gets sent. Real visitors
                    never see a checkbox or a challenge. The whole thing runs
                    silently while they fill out the form normally.
                  </p>
                </div>

                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Impact
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    Every genuine enquiry now lands straight in the client's
                    inbox, reliably and securely, without them needing to manage
                    any infrastructure themselves. Spam and bot submissions get
                    filtered out before they ever reach a human. That keeps the
                    inbox clean without slowing down real customers trying to
                    get in touch.
                  </p>
                </div>
              </div>
            </DecisionItem>

            <DecisionItem
              number={4}
              title="Proposed Typeface Systems with Character"
              summary="Researched independent type foundries for something with more character than a mainstream library, shortlisted three options, and landed on a pairing that now runs across the entire brand."
            >
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Issue
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    Persevere's identity and voice was gritty, cheeky and
                    anti-establishment, but the visual identity was still
                    leaning on Inter Variable, a generic, easily available font
                    that didn't carry any of that personality. A mainstream
                    typeface system would have blended in with every other
                    agency site, completely going against the requirement for
                    Persevere to burst onto the scene rather than blend in.
                  </p>
                </div>

                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Solution
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    Rather than default to a mainstream font library, I
                    researched independent type foundries and found Tom Gordon,
                    an independent artist who specialises in hand-painted,
                    distinctive, and characterful display faces. I shortlisted
                    three options I felt captured Persevere's style;{" "}
                    <em>Jamboree</em>, <em>Motion Sickness</em> and{" "}
                    <em>Pomelo</em>. I presented them to the client and
                    discussed things such as legibility, licensing, and use in
                    future graphic designs. I also created some mockups of the
                    word <em>Persevere</em> for them to have a visual
                    representation of how each typeface would look in the
                    context of their brand.
                  </p>
                  <FontSpecimenRow specimens={fontSpecimens} />
                </div>

                <div className="rounded-2xl border border-accent/20 bg-black/[0.03] p-6 flex flex-col gap-4">
                  <p className="font-mono text-sm text-accent uppercase tracking-widest">
                    Impact
                  </p>
                  <p className="font-body text-sm leading-relaxed text-neutral-400">
                    The clients immediately fell in love with <em>Pomelo</em>{" "}
                    and <em>Motion Sickness</em> and have adopted them as their
                    core brand fonts. Both now run front and centre across
                    graphics, business cards, the website and LinkedIn - a
                    visual signature no mainstream library could have given
                    them. Sourcing from an independent foundry instead of
                    commissioning custom lettering also kept costs down, and the
                    research fed directly into how the wider brand identity
                    evolved.
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
