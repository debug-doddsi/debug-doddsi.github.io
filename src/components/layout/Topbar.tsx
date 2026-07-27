import { SparklesText } from "../ui/sparkles-text";

export function Topbar() {
  return (
    <header className="top-0 right-0 left-0 z-10 fixed flex items-center px-6 h-14">
      <div className="flex items-baseline gap-0 text-3xl font-pixie font-normal tracking-tight leading-none">
        <SparklesText
          colors={{ first: "#c66f80", second: "#9faa74" }}
          className="text-3xl font-pixie font-normal tracking-tight leading-none"
        >
          ionakate
        </SparklesText>
        <span style={{ color: "#c66f80" }}>.uk</span>
      </div>
    </header>
  );
}
