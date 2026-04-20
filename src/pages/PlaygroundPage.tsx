import { Gamepad2 } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { Notebook } from "../components/ui/Notebook";
import { NewspaperReader, type PaperArticle } from "../components/ui/NewspaperReader";
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

const NEWSPAPER_DEMO_PAPERS: PaperArticle[] = [
  {
    url: "https://doi.org/10.1103/PhysRevLett.116.061102",
    headline: "Scientists Detect Ripples in the Fabric of Spacetime",
    subheadline:
      "First direct observation of gravitational waves confirms Einstein's century-old prediction",
    summary:
      "Researchers at the Laser Interferometer Gravitational-Wave Observatory (LIGO) have announced the first direct detection of gravitational waves — ripples in the curvature of spacetime produced by the cataclysmic collision of two black holes 1.3 billion light-years away. The signal, designated GW150914, lasted 0.2 seconds and matched theoretical predictions with extraordinary precision. The two black holes, weighing 29 and 36 solar masses respectively, merged to form a single 62-solar-mass remnant, radiating the equivalent of three solar masses as pure gravitational energy in a fraction of a second. This landmark discovery not only validates a core prediction of Einstein's 1915 General Theory of Relativity but inaugurates an entirely new field of gravitational-wave astronomy, offering humanity a fundamentally new way to observe the cosmos.",
    journal: "Physical Review Letters, Vol. 116, 061102",
    date: "11 February 2016",
    authors: "B. P. Abbott et al. (LIGO Scientific Collaboration)",
  },
  {
    url: "https://doi.org/10.1038/s41586-021-03819-2",
    headline: "AI Solves Biology's 50-Year Grand Challenge",
    subheadline:
      "DeepMind's AlphaFold predicts protein structures with near-experimental accuracy",
    summary:
      "DeepMind's AlphaFold 2 system achieves near-experimental accuracy predicting the three-dimensional structure of proteins from their amino acid sequences alone — solving a problem that consumed structural biology for five decades. Proteins fold into precise shapes that determine their function, and resolving those shapes experimentally can take years of costly laboratory work. AlphaFold solves this computationally in minutes, scoring a median of 92.4 on the CASP14 benchmark. The team released over 350,000 predictions publicly, including the entire human proteome.",
    journal: "Nature, Vol. 596, pp. 583–589",
    date: "15 July 2021",
    authors: "Jumper, Evans et al. (DeepMind)",
  },
  {
    url: "https://doi.org/10.1126/science.1225829",
    headline: "Molecular Scissors Rewrite the Code of Life",
    subheadline: "CRISPR-Cas9 enables precise, programmable editing of any genome",
    summary:
      "Biochemists Jennifer Doudna and Emmanuelle Charpentier demonstrate that the bacterial immune system CRISPR-Cas9 can be repurposed as a programmable genome-editing tool. By guiding the Cas9 protein to any target DNA sequence via a synthetic RNA molecule, the system makes precise double-strand cuts, enabling deletion, correction or insertion of genetic material with unprecedented accuracy and at a fraction of the cost of prior techniques. The discovery sparked a revolution across medicine, agriculture and fundamental biology, and earned its authors the 2020 Nobel Prize in Chemistry.",
    journal: "Science, Vol. 337, Issue 6096, pp. 816–821",
    date: "28 June 2012",
    authors: "Jinek, Chylinski, Fonfara, Hauer, Doudna, Charpentier",
  },
];

// Add new components here — kept in alphabetical order
const COMPONENTS = [
  {
    id: "newspaper",
    name: "The Science Times",
    description: "scientific papers, typeset as a 1999 newspaper",
    demo: <NewspaperReader papers={NEWSPAPER_DEMO_PAPERS} />,
  },
  {
    id: "notebook",
    name: "The Notebook",
    description: "a notebook with tabbed chapters",
    demo: (
      <Notebook chapters={NOTEBOOK_DEMO_CHAPTERS} footerLabel="playground" />
    ),
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
