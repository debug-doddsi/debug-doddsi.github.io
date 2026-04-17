import { Send, Mail, Linkedin, Link } from "lucide-react";
import { PageShell } from "../components/ui/PageShell";

export function ContactPage() {
  return (
    <PageShell
      title="Contact"
      subtitle="Want to work together, or just say hello? Find me here."
      icon={<Send size={28} />}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          {/* Email */}
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-accent shrink-0" />
            <a
              href="mailto:hello.ionakate@gmail.com"
              className="text-accent hover:underline font-body text-sm"
            >
              hello.ionakate@gmail.com
            </a>
          </div>

          {/* LinkedIn */}
          <div className="flex items-center gap-3">
            <Linkedin size={16} className="text-accent shrink-0" />
            <a
              href="https://www.linkedin.com/in/ionawatson/"
              className="text-accent hover:underline font-body text-sm"
            >
              LinkedIn
            </a>
          </div>

          {/* GitHub */}
          <div className="flex items-center gap-3">
            <Link size={16} className="text-accent shrink-0" />

            <a
              href="https://github.com/debug-doddsi"
              className="text-accent hover:underline font-body text-sm"
            >
              Github
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
