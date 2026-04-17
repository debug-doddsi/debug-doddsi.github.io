import { Pencil } from "lucide-react";
import { PageShell, SkeletonBlock } from "../components/ui/PageShell";

export function WritingPage() {
  return (
    <PageShell
      title="Writing"
      subtitle="Things I've written. Could be technical. Could be anything, really."
      icon={<Pencil size={28} />}
    >
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} label={`TODO: Post ${i + 1}`} height="h-20" />
        ))}
      </div>
    </PageShell>
  );
}
