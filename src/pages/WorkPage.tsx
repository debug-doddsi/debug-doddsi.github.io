import { FolderKanban } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import {
  ScrapbookProjects,
  type ScrapbookProject,
} from "../components/ui/ScrapbookProjects";

const PROJECTS: ScrapbookProject[] = [
  {
    id: "portfolio",
    title: "This Website",
    subtitle: "my little corner of the internet",
    description:
      "A personal portfolio & playground built with React, TypeScript, and Tailwind CSS. Dual themes, custom animations, and this very scrapbook — still adding things.",
    tech: ["React", "TypeScript", "Tailwind", "Vite"],
    year: "2024",
    imageColor: "#a690c4",
    notes: "* always a work in progress",
    polaroidRotation: -3,
    link: "https://github.com",
  },
  {
    id: "project-2",
    title: "Project Two",
    subtitle: "something interesting",
    description:
      "Add your second project here. Describe what it does, what problem it solves, and what you learned from building it.",
    tech: ["Python", "FastAPI", "PostgreSQL"],
    year: "2023",
    imageColor: "#90b4a8",
    polaroidRotation: 2.5,
  },
  {
    id: "project-3",
    title: "Project Three",
    subtitle: "an experiment",
    description:
      "The scrapbook can hold as many projects as you like — just add more entries to the PROJECTS array in WorkPage.tsx.",
    tech: ["Arduino", "C++", "Processing"],
    year: "2022",
    imageColor: "#c4a888",
    notes: "* hardware is just software with stakes",
    polaroidRotation: -1.5,
  },
];

export function WorkPage() {
  return (
    <PageShell
      title="Work"
      subtitle="Projects, experiments, and things I've built."
      icon={<FolderKanban size={28} />}
    >
      <ScrapbookProjects projects={PROJECTS} />
    </PageShell>
  );
}
