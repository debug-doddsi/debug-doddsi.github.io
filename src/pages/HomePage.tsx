import { Sparkles } from "lucide-react";
import { usePinkMode } from "../hooks/usePinkMode";

interface HomePageProps {
  onEnter: () => void;
}

export function HomePage({ onEnter }: HomePageProps) {
  const { isPink, toggle } = usePinkMode();

  return (
    <div className="fade-in min-h-screen bg-neutral-950 flex flex-col">
      {/* Pink toggle in top right */}
      <header className="fixed top-0 right-0 px-8 h-12 flex items-center gap-3">
        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest select-none">
          {isPink ? "Fun Mode" : "Professional Mode"}
        </span>
        <button
          onClick={toggle}
          className="flex items-center gap-2 group"
          aria-label="Toggle pink mode"
        >
          <div
            className={`relative w-10 h-5 rounded-full transition-all duration-300 border border-neutral-700 group-hover:border-accent ${isPink ? "bg-accent" : "bg-neutral-800"}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 bg-white shadow-sm ${isPink ? "left-5" : "left-0.5"}`}
            />
          </div>
          <Sparkles
            size={13}
            className={`transition-all duration-300 ${isPink ? "text-accent opacity-100" : "text-neutral-600 opacity-60 group-hover:opacity-100 group-hover:text-accent"}`}
          />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Accent glow */}
        <div
          className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: "var(--accent)" }}
        />

        <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-6 select-none">
          Welcome to
        </p>

        <h1 className="font-display text-6xl md:text-8xl text-neutral-100 tracking-tight mb-6">
          ionakate.uk
        </h1>

        <p className="font-body text-sm text-neutral-400 mb-12 max-w-sm leading-relaxed">
          Scientifically trained.
          <br />
          Creatively driven.
          <br />
          Dangerously fond of pink.
        </p>

        <button
          onClick={onEnter}
          className="px-8 py-3 rounded-full border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-neutral-950 transition-all duration-300"
        >
          Come in!
        </button>
      </main>

      {/* Footer */}
      <footer className="px-8 pb-6 text-center">
        <p className="font-mono text-[9px] text-neutral-700 uppercase tracking-widest">
          made with love in Leith
        </p>
      </footer>
    </div>
  );
}
