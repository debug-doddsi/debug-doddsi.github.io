import { ArrowLeft } from "lucide-react";
import PersevereCaseStudy from "../components/case-studies/persevere";

interface PersevereCaseStudyPageProps {
  onBack: () => void;
}

export function PersevereCaseStudyPage({
  onBack,
}: PersevereCaseStudyPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 self-start font-body text-xs text-neutral-500 hover:text-accent transition-colors duration-150"
      >
        <ArrowLeft size={13} /> Back to Case Studies
      </button>
      <PersevereCaseStudy />
    </div>
  );
}
