import { Smile } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { Interests } from "../components/ui/about/Interests";
import { Bio } from "../components/ui/about/Bio";

export function AboutPage() {
  return (
    <div className="relative">
      <PageShell
        title="Hello, I'm Iona."
        subtitle="I'm a Software Engineer from Scotland. Welcome to my website!"
        icon={<Smile size={28} />}
      >
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl text-neutral-100 mb-4">
              About Me
            </h2>

            <Bio />
          </div>

          <div>
            <h2 className="font-display text-xl text-neutral-100 mb-4">
              Interests
            </h2>
            <Interests />
          </div>
        </div>
      </PageShell>
    </div>
  );
}
