import { Smile } from "lucide-react";
import { PageShell, SkeletonBlock } from "../components/ui/PageShell";
import { Interests } from "../components/ui/Interests.tsx";
import { Bio } from "../components/ui/Bio.tsx";

export function AboutPage() {
  return (
    <PageShell
      title="Hello, I'm Iona."
      subtitle="I'm a Software Engineer from Scotland. Welcome to my Portfolio!"
      icon={<Smile size={28} />}
    >
      {/* insert a cute pixel gif here */}

      <div className="space-y-8">
        <div>
          <h2 className="font-display text-xl text-neutral-100 mb-4">
            About Me
          </h2>
          <Bio />
        </div>

        <SkeletonBlock label="TODO: A photo, perhaps?" height="h-48" />

        <div>
          <h2 className="font-display text-xl text-neutral-100 mb-4">
            Interests
          </h2>
          <Interests />
        </div>
      </div>
    </PageShell>
  );
}
