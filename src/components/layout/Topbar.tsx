import { PinkToggle } from "../ui/PinkToggle";
import { SparklesText } from "../ui/sparkles-text";

interface TopbarProps {
  isPink: boolean;
  onPinkToggle: () => void;
}

export function Topbar({ isPink, onPinkToggle }: TopbarProps) {
  return (
    <header className="top-0 right-0 left-0 z-10 fixed flex items-center px-6 h-14">
      <div className="flex items-baseline gap-0 text-3xl font-display font-normal tracking-tight leading-none">
        <SparklesText
          colors={
            isPink
              ? { first: "#c4407a", second: "#e0609a" }
              : { first: "#c66f80", second: "#9faa74" }
          }
          className="text-3xl font-display font-normal tracking-tight leading-none"
        >
          ionakate
        </SparklesText>
        <span style={{ color: isPink ? "#ff6eb4" : "#c66f80" }}>.uk</span>
      </div>

      {/* Hidden for now — strawberry matcha is the only palette in play.
          Kept mounted (not deleted) since this is slated to become a
          light/dark mode toggle later. */}
      <div className="hidden ml-auto">
        <PinkToggle isPink={isPink} onToggle={onPinkToggle} />
      </div>
    </header>
  );
}
