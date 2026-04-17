import { Send } from "lucide-react";
import { PageShell, SkeletonBlock } from "../components/ui/PageShell";

export function ContactPage() {
  return (
    <PageShell
      title="Contact"
      subtitle="Want to work together, or just say hello? Find me here."
      icon={<Send size={28} />}
    >
      <div className="space-y-4">
        <SkeletonBlock label="TODO: Email / social links" height="h-24" />
        <SkeletonBlock label="TODO: Contact form (optional)" height="h-48" />
      </div>
    </PageShell>
  );
}
