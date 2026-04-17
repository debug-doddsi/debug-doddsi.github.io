import { Send, Mail } from "lucide-react";
import { PageShell, SkeletonBlock } from "../components/ui/PageShell";

export function ContactPage() {
  return (
    <PageShell
      title="Contact"
      subtitle="Want to work together, or just say hello? Find me here."
      icon={<Send size={28} />}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail size={16} className="text-accent shrink-0" />
          
            <a href="mailto:hello.ionakate@gmail.com"
            className="text-accent hover:underline font-body text-sm"
          >
            hello.ionakate@gmail.com
          </a>
        </div>
        <SkeletonBlock label="TODO: Contact form (optional)" height="h-48" />
      </div>
    </PageShell>
  );
}