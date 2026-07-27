import { useState, useEffect } from "react";
import type { TabId } from "../types";

const FULL_TEXT = "ionakate.uk";
const TYPING_SPEED = 85;
const START_DELAY = 350;

interface HomePageProps {
  onNavigate: (id: TabId) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
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
        <p className="font-body text-sm text-neutral-400 mb-12 max-w-sm leading-relaxed mx-auto">
          Scientifically trained.
          <br />
          Creatively driven.
          <br />
          Dangerously fond of pink.
        </p>

        <button
          onClick={() => onNavigate("about")}
          className="px-8 py-3 rounded-full border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-neutral-950 transition-all duration-300"
        >
          More about me
        </button>
      </div>
    </div>
  );
}
