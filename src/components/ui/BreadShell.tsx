// Shared bread-slice shell used by every Sourdough Souschef view.
// Dome = centred text in the curved crown; children = scrollable body below.
export function BreadShell({
  dome,
  children,
}: {
  dome: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full max-w-lg mx-auto pt-10">
      {/* Steam wisps rise from the top of the crust, spread across its width */}
      <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[85%] flex justify-between items-end pointer-events-none">
        <span className="steam-wisp" style={{ animationDelay: "0s", height: "14px" }} />
        <span className="steam-wisp" style={{ animationDelay: "0.4s", height: "20px" }} />
        <span className="steam-wisp" style={{ animationDelay: "0.9s", height: "16px" }} />
        <span className="steam-wisp" style={{ animationDelay: "1.3s", height: "22px" }} />
        <span className="steam-wisp" style={{ animationDelay: "0.6s", height: "15px" }} />
        <span className="steam-wisp" style={{ animationDelay: "1.7s", height: "19px" }} />
      </div>

      <div className="bread-crust">
        <div className="bread-inner">
          <div className="bread-dome">{dome}</div>
          <div className="bread-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
