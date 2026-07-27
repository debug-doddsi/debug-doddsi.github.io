// Shared bread-slice shell used by every Sourdough Souschef view.
// Dome = centred text in the curved crown; children = scrollable body below.
export function BreadShell({
  dome,
  children,
  footer,
}: {
  dome: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  // marginTop offsets trace the dome's elliptical arc: shallow at the
  // centre, deeper toward the edges, so the wisps curve with the crust.
  const wispOffsets = ["16px", "6px", "1px", "1px", "6px", "16px"];
  const wispDelays = ["0s", "0.4s", "0.9s", "1.3s", "0.6s", "1.7s"];

  return (
    <div className="relative w-full max-w-lg mx-auto pt-10">
      {/* Steam wisps rise from the top of the crust, curving with its arc */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[85%] flex justify-between items-start pointer-events-none">
        {wispOffsets.map((marginTop, i) => (
          <span
            key={i}
            className="steam-wisp"
            style={{ animationDelay: wispDelays[i], height: "18px", marginTop }}
          />
        ))}
      </div>

      <div className="bread-crust">
        <div className="bread-inner">
          <div className="bread-dome">{dome}</div>
          <div className="bread-body">{children}</div>
          {footer && <div className="bread-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
