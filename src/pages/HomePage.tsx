import { useState, useEffect } from "react";

const FULL_TEXT = "ionakate.uk";
const TYPING_SPEED = 85;
const START_DELAY = 350;

interface HomePageProps {
  onEnter: () => void;
}

export function HomePage({ onEnter }: HomePageProps) {
  const [typedText, setTypedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let startTimeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    startTimeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i++;
        setTypedText(FULL_TEXT.slice(0, i));
        if (i === FULL_TEXT.length) {
          clearInterval(interval);
          setIsDone(true);
        }
      }, TYPING_SPEED);
    }, START_DELAY);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fade-in min-h-screen bg-neutral-950 flex flex-col">
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
          {typedText}
          <span className="typewriter-cursor ml-[2px]">|</span>
        </h1>

        <div
          className="transition-opacity duration-700"
          style={{ opacity: isDone ? 1 : 0 }}
        >
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
        </div>
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
