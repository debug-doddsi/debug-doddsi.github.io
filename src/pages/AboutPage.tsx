import { Smile } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";
import { Interests } from "../components/ui/Interests.tsx";
import { Bio } from "../components/ui/Bio.tsx";

export function AboutPage() {
  return (
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

          {/* Portrait floated right so text wraps around it */}
          <div className="float-right ml-6 mb-4">
            <div className="border border-accent p-2 rounded-lg bg-accent-soft inline-block">
              <img
                src="/stardew.png"
                alt="Iona, in Stardew Valley style"
                className="h-40 w-auto object-contain rounded"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>

          <Bio />

          {/* Clear the float so subsequent sections sit below */}
          <div className="clear-both" />
        </div>

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
