import { Gamepad2 } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { Notebook } from "../components/ui/Notebook";
import { ScrapbookProjects } from "../components/ui/ScrapbookProjects";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

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

const SCRAPBOOK_DEMO_PROJECTS = [
  {
    id: "web-app",
    title: "Recipe Keeper",
    subtitle: "a full-stack cooking companion",
    description:
      "A web app for storing, tagging, and scaling recipes. Built for the family group chat that kept losing links. Features fuzzy search and a grocery list generator.",
    tech: ["Next.js", "Prisma", "PostgreSQL", "Tailwind"],
    year: "2024",
    imageColor: "#b8895a",
    notes: "* grandma approved",
    polaroidRotation: -3,
    link: "https://example.com",
  },
  {
    id: "hardware",
    title: "Plant Monitor",
    subtitle: "so my succulents stop dying",
    description:
      "A soil moisture sensor that texts me when a plant needs watering. Powered by an ESP32, a bag of resistors, and sheer frustration at forgetting to water things.",
    tech: ["C++", "Arduino", "MQTT", "Python"],
    year: "2023",
    imageColor: "#6a9e72",
    notes: "* success rate: 80%. rip cactus.",
    polaroidRotation: 2,
  },
  {
    id: "data-vis",
    title: "Tube Delays",
    subtitle: "data viz for the chronically annoyed",
    description:
      "Scraped two years of TfL delay data and visualised peak disruption patterns by line and hour. Turns out the Central line is exactly as bad as you think.",
    tech: ["Python", "pandas", "D3.js", "FastAPI"],
    year: "2023",
    imageColor: "#4a6fa5",
    polaroidRotation: -1.5,
  },
  {
    id: "game",
    title: "Tiny Dungeon",
    subtitle: "a weekend game jam entry",
    description:
      "A 48-hour game jam entry — a turn-based dungeon crawler that fits in a terminal window. More fun to make than it is to play, but that's the spirit of a jam.",
    tech: ["Rust", "crossterm", "RON"],
    year: "2022",
    imageColor: "#6b4e8a",
    notes: "* placed 12th out of 47. I'll take it.",
    polaroidRotation: 3,
    link: "https://example.com",
  },
];

// Add new components here — kept in alphabetical order
const COMPONENTS = [
  {
    id: "notebook",
    name: "The Notebook",
    description: "a notebook with tabbed chapters",
    demo: (
      <Notebook chapters={NOTEBOOK_DEMO_CHAPTERS} footerLabel="playground" />
    ),
  },
  {
    id: "scrapbook",
    name: "The Scrapbook",
    description: "a page-flipping project showcase",
    demo: <ScrapbookProjects projects={SCRAPBOOK_DEMO_PROJECTS} />,
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
          half-finished ideas, things I'm learning and stuff I've made. It's a
          bit of a brain dump. Enjoy.
        </p>
      </div>

      <div className="space-y-10">
        {/* Components I like */}
        <div>
          <h2 className="font-display text-xl text-neutral-100 mb-1">
            Components I Like!
          </h2>
          <p className="font-body text-xs text-neutral-400 mb-5">
            Things I've made and liked too much to throw away.
          </p>

          <Accordion type="multiple" className="space-y-1">
            {COMPONENTS.map((c) => (
              <AccordionItem
                key={c.id}
                value={c.id}
                className="border border-neutral-800 rounded-lg px-4 overflow-hidden"
              >
                <AccordionTrigger className="py-3 hover:no-underline group">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-lg text-neutral-100 group-hover:text-accent transition-colors duration-200">
                      <span className="text-accent mr-1.5">✦</span>
                      {c.name}
                    </span>
                    <span className="font-body text-xs text-neutral-500 italic">
                      {c.description}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5">{c.demo}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </PageShell>
  );
}

