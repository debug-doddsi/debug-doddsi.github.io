import { Smile } from "lucide-react";
import { PageShell, SkeletonBlock } from "../components/ui/PageShell";

export function AboutPage() {
  return (
    <PageShell
      title="Hello, I'm Iona."
      subtitle="TODO: Introduction"
      icon={<Smile size={28} />}
    >
      <div className="space-y-4">
        <SkeletonBlock label="TODO: Bio / intro paragraph" height="h-28" />
        <SkeletonBlock label="TODO: Skills or interests" height="h-20" />
        <SkeletonBlock label="TODO: A photo, perhaps?" height="h-48" />
      </div>
    </PageShell>
  );
}
