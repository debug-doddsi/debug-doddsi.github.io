import { FolderKanban } from "lucide-react";
import { PageShell, SkeletonBlock } from "../components/ui/PageShell";

export function WorkPage() {
  return (
    <PageShell
      title="Work"
      subtitle="TODO: Add projects, theses and whatnot."
      icon={<FolderKanban size={28} />}
    >
      <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock
            key={i}
            label={`TODO: Project ${i + 1}`}
            height="h-36"
          />
        ))}
      </div>
    </PageShell>
  );
}
