import { PageShell } from "../components/layout/PageShell";

export function HomePage() {
  return (
    <PageShell title="Hello, I'm Iona">
      <div className="space-y-1">
        <p className="font-mono text-sm text-neutral-500 leading-relaxed">
          I'm a Software Engineer & UX Designer.
        </p>
        <p className="font-mono text-sm text-neutral-500 leading-relaxed">
          I build websites people love, and apps engineers actually want to use.
        </p>
      </div>
    </PageShell>
  );
}
