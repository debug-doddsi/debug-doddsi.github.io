import { ArrowLeft, ChefHat } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";

interface SourdoughCaseStudyPageProps {
  onBack: () => void;
}

export function SourdoughCaseStudyPage({
  onBack,
}: SourdoughCaseStudyPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 self-start font-body text-xs text-neutral-500 hover:text-accent transition-colors duration-150"
      >
        <ArrowLeft size={13} /> Back to Projects
      </button>
      <PageShell
        icon={<ChefHat size={22} />}
        title="Sourdough Souschef"
        subtitle="Case study coming soon."
      />
    </div>
  );
}
