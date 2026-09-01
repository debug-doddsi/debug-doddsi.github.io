import { Send, Mail, Linkedin, Github } from "lucide-react";
import { PageShell } from "../components/layout/PageShell";

interface ContactNote {
  icon: typeof Mail;
  heading: string;
  value: string;
  href: string;
  rotate: number;
}

const CONTACT_NOTES: ContactNote[] = [
  {
    icon: Mail,
    heading: "say hello!",
    value: "hello.ionakate@gmail.com",
    href: "mailto:hello.ionakate@gmail.com",
    rotate: -3,
  },
  {
    icon: Linkedin,
    heading: "connect with me",
    value: "/in/ionawatson",
    href: "https://www.linkedin.com/in/ionawatson/",
    rotate: 2.5,
  },
  {
    icon: Github,
    heading: "see my code",
    value: "@debug-doddsi",
    href: "https://github.com/debug-doddsi",
    rotate: -2,
  },
];

export function ContactPage() {
  return (
    <PageShell
      title="Contact"
      subtitle="Want to work together, or just say hello? Find me here."
      icon={<Send size={28} />}
      maxWidthClassName="max-w-3xl"
    >
      <div className="flex flex-wrap justify-center gap-8 py-6">
        {CONTACT_NOTES.map(({ icon: Icon, heading, value, href, rotate }) => (
          <a
            key={heading}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="sticky-note flex w-56 flex-col items-center gap-2 bg-[var(--card-surface)] px-6 py-8 text-center transition-transform duration-300 hover:!rotate-0"
            style={{ transform: `rotate(${rotate}deg)` }}
          >
            <div className="sticky-tape" />
            <Icon size={20} className="text-accent" />
            <p className="scrapbook-title text-xl">{heading}</p>
            <p className="handwritten text-base text-[var(--matcha-dark)] break-all">
              {value}
            </p>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
