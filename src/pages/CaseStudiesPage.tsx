import { FileText } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";

export function CaseStudiesPage() {
  return (
    <PageShell
      title="Case Studies"
      subtitle="Deeper dives into a few projects I've worked on"
      icon={<FileText size={28} />}
    />
  );
}
