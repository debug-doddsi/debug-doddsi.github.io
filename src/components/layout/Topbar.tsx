import { PinkToggle } from "../ui/PinkToggle";
import { SparklesText } from "../ui/sparkles-text";

interface TopbarProps {
  isPink: boolean;
  onPinkToggle: () => void;
}

export function Topbar({ isPink, onPinkToggle }: TopbarProps) {
  return (
    <header className="top-0 right-0 left-0 z-10 fixed flex items-center bg-neutral-950 px-6 border-neutral-800 border-b h-14">
      <div className="flex items-baseline gap-0 text-3xl font-display font-normal tracking-tight leading-none">
        <SparklesText
          colors={
            isPink
              ? { first: "#c4407a", second: "#e0609a" }
              : { first: "#9E7AFF", second: "#FE8BBB" }
          }
          className="text-3xl font-display font-normal tracking-tight leading-none"
        >
          ionakate
        </SparklesText>
        <span style={{ color: isPink ? "#ff6eb4" : "#a690c4" }}>.uk</span>
      </div>

      <div className="ml-auto">
        <PinkToggle isPink={isPink} onToggle={onPinkToggle} />
      </div>
    </header>
  );
}
