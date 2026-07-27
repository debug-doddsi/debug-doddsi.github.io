import { PageShell } from "../components/layout/PageShell";
import { Interests } from "../components/about/Interests";
import { Bio } from "../components/about/Bio";

export function AboutPage() {
  return (
    <div className="relative">
      <PageShell
        title="Hello, I'm Iona."
        subtitle="I'm a Software Engineer from Scotland. Welcome to my website!"
      >
        <div className="space-y-8">
          <Bio />
          <Interests />
        </div>
      </PageShell>
    </div>
  );
}
