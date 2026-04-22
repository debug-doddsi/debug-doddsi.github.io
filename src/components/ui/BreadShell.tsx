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
      {/* Steam wisps rise from the top of the crust */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 flex justify-around pointer-events-none">
        <span className="steam-wisp" style={{ animationDelay: "0s" }} />
        <span className="steam-wisp" style={{ animationDelay: "0.75s" }} />
        <span className="steam-wisp" style={{ animationDelay: "1.5s" }} />
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
