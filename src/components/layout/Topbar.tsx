import { PinkToggle } from "../ui/PinkToggle";

interface TopbarProps {
  isPink: boolean;
  onPinkToggle: () => void;
}

export function Topbar({ isPink, onPinkToggle }: TopbarProps) {
  return (
    <header className="top-0 right-0 left-52 z-10 fixed flex justify-end items-center bg-neutral-950 px-8 border-neutral-800 border-b h-12">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest select-none">
          {isPink ? "Fun Mode" : "Professional Mode"}
        </span>
        <PinkToggle isPink={isPink} onToggle={onPinkToggle} />
      </div>
    </header>
  );
}
