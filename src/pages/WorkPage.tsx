import { FolderKanban } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { Experience } from "../components/ui/about/Experience";

export function WorkPage() {
  return (
    <PageShell
      title="Work"
      subtitle="Due to the nature of my work, I am unable to share specific details
          about the projects I have worked on. However, I can provide a general
          overview of my professional experience and career journey."
      icon={<FolderKanban size={28} />}
    >
      <Experience />
    </PageShell>
  );
}
