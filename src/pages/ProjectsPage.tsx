import { useMemo, useState, type ReactNode } from "react";
import { LayoutGrid } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { CutoutLaunchCard } from "../components/ui/CutoutLaunchCard";
import { CutoutCardImage } from "../components/ui/cutout-card";
import type { ProjectTag, TabId } from "../types";
import { PROJECT_TAG_LABELS } from "../types";

interface ProjectsPageProps {
  onNavigate: (tab: TabId) => void;
}

interface Project {
  id: string;
  title: string;
  description: string;
  placeholder: ReactNode;
  tags: ProjectTag[];
  onLaunch: (onNavigate: (tab: TabId) => void) => void;
  secondaryLabel: string;
  secondaryHref?: string;
  onSecondaryLaunch?: (onNavigate: (tab: TabId) => void) => void;
}

const PROJECTS: Project[] = [
  {
    id: "persevere",
    title: "Persevere Media",
    description: "A custom website for a digital marketing agency.",
    placeholder: (
      <CutoutCardImage
        src="/case-studies/persevere/persevere-logo.png"
        alt="Persevere Media logo"
      />
    ),
    tags: ["professional"],
    onLaunch: (onNavigate) => onNavigate("persevere"),
    secondaryLabel: "Open Website",
    secondaryHref: "https://choosepersevere.com",
  },
  {
    id: "sourdough",
    title: "Sourdough Souschef",
    description:
      "A tracker for managing your sourdough bread starter and baking schedule.",
    placeholder: (
      <CutoutCardImage src="/sourdough/sourdough.jpg" alt="Sourdough bread" />
    ),
    tags: ["fun"],
    onLaunch: (onNavigate) => onNavigate("kitchen-case-study"),
    secondaryLabel: "Open App",
    onSecondaryLaunch: (onNavigate) => onNavigate("kitchen"),
  },
  {
    id: "dnd",
    title: "D&D Map Maker",
    description:
      "Procedural landscape and town maps for my DM, with custom pins built in.",
    placeholder: <CutoutCardImage src="/dndmapmaker/dnd.jpg" alt="D&D map" />,
    tags: ["fun"],
    onLaunch: (onNavigate) => onNavigate("dnd-case-study"),
    secondaryLabel: "Open App",
    onSecondaryLaunch: (onNavigate) => onNavigate("dnd"),
  },
];

const ALL_TAGS: ProjectTag[] = ["professional", "fun"];

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const [activeTag, setActiveTag] = useState<ProjectTag | null>(null);

  const toggleTag = (tag: ProjectTag) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
  };

  const visibleProjects = useMemo(() => {
    if (activeTag === null) return PROJECTS;
    return PROJECTS.filter((project) => project.tags.includes(activeTag));
  }, [activeTag]);

  return (
    <PageShell
      title="Projects"
      subtitle="Case studies, side projects, and stuff I've made for my friends and I"
      icon={<LayoutGrid size={28} />}
      maxWidthClassName="max-w-5xl"
    >
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <span className="font-mono text-neutral-500 text-xs uppercase tracking-widest">
          Filter by:
        </span>
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          aria-pressed={activeTag === null}
          className={`rounded-full border px-4 py-1.5 font-body text-xs font-medium transition-colors duration-150 ${
            activeTag === null
              ? "border-accent bg-accent text-accent-ink"
              : "border-accent/30 bg-[#faf3e4]/60 text-accent hover:border-accent/70"
          }`}
        >
          All
        </button>
        {ALL_TAGS.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-1.5 font-body text-xs font-medium transition-colors duration-150 ${
                isActive
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-accent/30 bg-[#faf3e4]/60 text-accent hover:border-accent/70"
              }`}
            >
              {PROJECT_TAG_LABELS[tag]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => (
          <CutoutLaunchCard
            key={project.id}
            title={project.title}
            description={project.description}
            placeholder={project.placeholder}
            tags={project.tags}
            ctaLabel="View Case Study"
            onLaunch={() => project.onLaunch(onNavigate)}
            secondaryLabel={project.secondaryLabel}
            secondaryHref={project.secondaryHref}
            onSecondaryLaunch={
              project.onSecondaryLaunch
                ? () => project.onSecondaryLaunch!(onNavigate)
                : undefined
            }
          />
        ))}
      </div>
    </PageShell>
  );
}
