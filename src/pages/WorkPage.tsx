import { FolderKanban } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { Experience } from "../components/ui/about/Experience";

export function WorkPage() {
  return (
    <PageShell
      title="Work"
      subtitle="experience & projects"
      icon={<FolderKanban size={28} />}
    >
      <Experience />
    </PageShell>
  );
}
