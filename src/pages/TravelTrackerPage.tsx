import { useState, useRef, useEffect, useCallback } from "react";
import { Globe, ArrowLeft, Plus, X, Loader2, Home } from "lucide-react";
import { DottedMap } from "../components/ui/dotted-map";

interface Place {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  status: "visited" | "to-visit";
  isHome: boolean;
}

const STORAGE_KEY = "travel-tracker-v3";
const COLOR_KEY_PRO  = "travel-tracker-colors-pro";
const COLOR_KEY_PINK = "travel-tracker-colors-pink";

interface Colors { home: string; visited: string; toVisit: string; }
interface MapTransform { scale: number; x: number; y: number; }
interface TooltipState { label: string; svgX: number; svgY: number; }

function load(): Place[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(places: Place[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}

function defaultColors(isPink: boolean): Colors {
  return {
    home:    "#f0b429",
    visited: isPink ? "#f472b6" : "#c66f80",
    toVisit: isPink ? "#fda4af" : "#9faa74",
  };
}

function loadColors(isPink: boolean): Colors {
  try {
    const raw = localStorage.getItem(isPink ? COLOR_KEY_PINK : COLOR_KEY_PRO);
    return raw ? { ...defaultColors(isPink), ...JSON.parse(raw) } : defaultColors(isPink);
  } catch { return defaultColors(isPink); }
}

function saveColors(isPink: boolean, colors: Colors) {
  localStorage.setItem(isPink ? COLOR_KEY_PINK : COLOR_KEY_PRO, JSON.stringify(colors));
}

async function geocode(query: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  if (!data.length) return null;
  const result = data[0];
  const addr = result.address ?? {};
  return {
    name: addr.city ?? addr.town ?? addr.village ?? addr.county ?? result.name,
    country: addr.country ?? "",
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
  };
}

interface TravelTrackerPageProps {
  onBack: () => void;
  isPink: boolean;
}

export function TravelTrackerPage({ onBack, isPink }: TravelTrackerPageProps) {
  const [places, setPlaces] = useState<Place[]>(load);
  const [input, setInput] = useState("");
  const [addStatus, setAddStatus] = useState<"visited" | "to-visit">("visited");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ left: number; top: number } | null>(null);
  const [colors, setColors] = useState<Colors>(() => loadColors(isPink));
  const [mapTransform, setMapTransform] = useState<MapTransform>({ scale: 1, x: 0, y: 0 });
  const [isPanningActive, setIsPanningActive] = useState(false);

  const [showHomeModal, setShowHomeModal] = useState(false);
  const [homeInput, setHomeInput] = useState("");
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeError, setHomeError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const homeInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const panStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);
  const homeColorRef    = useRef<HTMLInputElement>(null);
  const visitedColorRef = useRef<HTMLInputElement>(null);
  const toVisitColorRef = useRef<HTMLInputElement>(null);

  // Reload saved colours when mode switches
  useEffect(() => { setColors(loadColors(isPink)); }, [isPink]);

  // Show home modal on first use
  useEffect(() => {
    if (!places.some(p => p.isHome)) setShowHomeModal(true);
  }, []);

  useEffect(() => {
    if (showHomeModal) setTimeout(() => homeInputRef.current?.focus(), 50);
  }, [showHomeModal]);

  // Non-passive wheel listener so we can call preventDefault and prevent page scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setMapTransform(prev => {
      const newScale = Math.min(Math.max(prev.scale * factor, 1), 10);
      const ratio = newScale / prev.scale;
      return {
        scale: newScale,
        x: mx - ratio * (mx - prev.x),
        y: my - ratio * (my - prev.y),
      };
    });
  }, []);

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Pan handlers
  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    panStart.current = { mx: e.clientX, my: e.clientY, tx: mapTransform.x, ty: mapTransform.y };
    setIsPanningActive(true);
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!panStart.current) return;
    const dx = e.clientX - panStart.current.mx;
    const dy = e.clientY - panStart.current.my;
    setMapTransform(prev => ({ ...prev, x: panStart.current!.tx + dx, y: panStart.current!.ty + dy }));
  };

  const stopPanning = () => { panStart.current = null; setIsPanningActive(false); };

  // Compute tooltip screen position from SVG coordinates + current transform
  const computeTooltipPos = useCallback((svgX: number, svgY: number) => {
    const el = mapContainerRef.current;
    if (!el) return { left: 0, top: 0 };
    const { scale, x: tx, y: ty } = mapTransform;
    return {
      left: (svgX / 150) * el.clientWidth  * scale + tx,
      top:  (svgY / 75)  * el.clientHeight * scale + ty,
    };
  }, [mapTransform]);

  // Update tooltip position whenever transform changes (keeps tooltip locked to icon during pan/zoom)
  useEffect(() => {
    if (!tooltip) { setTooltipPos(null); return; }
    setTooltipPos(computeTooltipPos(tooltip.svgX, tooltip.svgY));
  }, [tooltip, computeTooltipPos]);

  const updateColor = (key: keyof Colors, value: string) => {
    const next = { ...colors, [key]: value };
    setColors(next);
    saveColors(isPink, next);
  };

  const update = (next: Place[]) => { setPlaces(next); save(next); };

  const submitHome = async () => {
    const query = homeInput.trim();
    if (!query) return;
    setHomeLoading(true);
    setHomeError(null);
    try {
      const geo = await geocode(query);
      if (!geo) { setHomeError(`Couldn't find "${query}" — try a different spelling.`); return; }
      const place: Place = { id: `home-${Date.now()}`, ...geo, status: "visited", isHome: true };
      update([...places.map(p => ({ ...p, isHome: false })), place]);
      setShowHomeModal(false);
    } catch {
      setHomeError("Lookup failed — check your connection.");
    } finally {
      setHomeLoading(false);
    }
  };

  const addPlace = async () => {
    const query = input.trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const geo = await geocode(query);
      if (!geo) { setError(`Couldn't find "${query}" — try a different spelling.`); return; }
      const place: Place = { id: `${geo.lat}-${geo.lng}-${Date.now()}`, ...geo, status: addStatus, isHome: false };
      update([...places, place]);
      setInput("");
      inputRef.current?.focus();
    } catch {
      setError("Lookup failed — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const removePlace = (id: string) => update(places.filter(p => p.id !== id));
  const movePlace = (id: string, status: "visited" | "to-visit") =>
    update(places.map(p => p.id === id ? { ...p, status } : p));

  const visited  = places.filter(p => p.status === "visited" && !p.isHome);
  const toVisit  = places.filter(p => p.status === "to-visit" && !p.isHome);
  const visitedCountries = new Set(visited.map(p => p.country).filter(Boolean)).size;
  const bucketCountries  = new Set(toVisit.map(p => p.country).filter(Boolean)).size;

  const markers = places.map(p => ({
    lat: p.lat, lng: p.lng,
    size: p.isHome ? 1.8 : 1.2,
    pulse: true,
    color: p.isHome ? colors.home : p.status === "visited" ? colors.visited : colors.toVisit,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Home modal */}
      {showHomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-neutral-900 border border-neutral-700 rounded-2xl p-6 shadow-2xl">
            <div className="text-accent mb-1"><Globe size={22} /></div>
            <h2 className="font-display text-xl text-neutral-100 mb-1">Welcome to Travel Tracker</h2>
            <p className="font-body text-sm text-neutral-400 mb-5">What is your city of residence?</p>
            <div className="flex flex-col gap-3">
              <input
                ref={homeInputRef}
                type="text"
                value={homeInput}
                onChange={e => { setHomeInput(e.target.value); setHomeError(null); }}
                onKeyDown={e => e.key === "Enter" && submitHome()}
                placeholder="e.g. Edinburgh"
                className="w-full px-3 py-2.5 rounded-xl text-sm font-body bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-accent transition-colors"
                disabled={homeLoading}
              />
              {homeError && <p className="text-xs font-body text-red-400">{homeError}</p>}
              <button
                onClick={submitHome}
                disabled={homeLoading || !homeInput.trim()}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-body text-sm font-medium text-white bg-accent hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {homeLoading ? <Loader2 size={14} className="animate-spin" /> : <Home size={14} />}
                Set home
              </button>
              <button
                onClick={() => setShowHomeModal(false)}
                className="text-xs font-body text-neutral-500 hover:text-neutral-300 transition-colors text-center"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 self-start font-body text-xs text-neutral-500 hover:text-accent transition-colors duration-150"
      >
        <ArrowLeft size={13} /> Back to My Apps
      </button>

      {/* Heading — inline so it isn't constrained by PageShell's max-w-2xl */}
      <div>
        <div className="opacity-80 mb-3 text-accent"><Globe size={22} /></div>
        <h1 className="font-display text-neutral-100 text-4xl tracking-tight">Travel Tracker</h1>
        <p className="mt-2 font-mono text-neutral-500 text-xs leading-relaxed">places I've explored around the world</p>
        <div className="bg-gradient-to-r from-accent to-transparent mt-4 w-24 h-px" />
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col justify-center px-5 py-3 rounded-xl bg-accent-soft border border-accent/20">
          <span className="font-display text-2xl text-accent">{visitedCountries}</span>
          <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">Countries visited</span>
        </div>
        <div className="flex-1 flex flex-col justify-center px-5 py-3 rounded-xl bg-accent-soft border border-accent/20">
          <span className="font-display text-2xl text-accent">{bucketCountries}</span>
          <span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">Countries in bucket list</span>
        </div>
      </div>

      {/* Map — full width, no max-w constraint */}
      <div
        ref={mapContainerRef}
        className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 w-full"
        style={{
          aspectRatio: "2 / 1",
          cursor: isPanningActive ? "grabbing" : "grab",
          userSelect: "none",
        }}
        onMouseDown={handleMapMouseDown}
        onMouseMove={handleMapMouseMove}
        onMouseUp={stopPanning}
        onMouseLeave={() => { stopPanning(); setTooltip(null); }}
      >
        {/* Zoomable / pannable layer */}
        <div
          style={{
            width: "100%",
            height: "100%",
            transform: `translate(${mapTransform.x}px, ${mapTransform.y}px) scale(${mapTransform.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <DottedMap
            markers={markers}
            dotColor="var(--accent)"
            markerColor="var(--accent)"
            dotRadius={0.35}
            mapSamples={12000}
            pulse
            style={{ opacity: 0.9, display: "block" }}
            renderMarkerOverlay={({ index, x, y, r }) => {
              const place = places[index];
              if (!place) return null;
              const label = `${place.isHome ? "🏠 " : ""}${place.name}${place.country ? `, ${place.country}` : ""}`;
              return (
                <circle
                  cx={x} cy={y} r={r * 6}
                  fill="transparent"
                  style={{ pointerEvents: "all" }}
                  onMouseEnter={() => setTooltip({ label, svgX: x, svgY: y })}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            }}
          />
        </div>

        {/* Tooltip — positioned in container space, above the marker icon */}
        {tooltip && tooltipPos && (
          <div
            className="pointer-events-none absolute z-10 px-2.5 py-1.5 rounded-lg text-xs font-body font-medium whitespace-nowrap"
            style={{
              left: tooltipPos.left,
              top: tooltipPos.top,
              transform: "translate(-50%, calc(-100% - 10px))",
              background: "#1c1c1c",
              color: "#f5f5f5",
              border: "1px solid #404040",
              boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
            }}
          >
            {tooltip.label}
            <div
              className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45"
              style={{ background: "#1c1c1c", borderRight: "1px solid #404040", borderBottom: "1px solid #404040" }}
            />
          </div>
        )}

        {/* Zoom hint */}
        {mapTransform.scale > 1 && (
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={() => setMapTransform({ scale: 1, x: 0, y: 0 })}
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-mono text-neutral-400 bg-neutral-900/80 border border-neutral-700 hover:text-accent hover:border-accent transition-colors"
          >
            Reset view
          </button>
        )}
      </div>

      {/* Legend — click a swatch to customise its colour */}
      <div className="flex flex-wrap gap-4 text-xs font-body text-neutral-400">
        {([
          { colorKey: "home"    as keyof Colors, color: colors.home,    label: "Home",          ref: homeColorRef    },
          { colorKey: "visited" as keyof Colors, color: colors.visited, label: "Visited",       ref: visitedColorRef },
          { colorKey: "toVisit" as keyof Colors, color: colors.toVisit, label: "Want to visit", ref: toVisitColorRef },
        ] as const).map(({ colorKey, color, label, ref }) => (
          <button
            key={label}
            onClick={() => ref.current?.click()}
            title={`Change ${label.toLowerCase()} colour`}
            className="relative flex items-center gap-1.5 hover:text-neutral-200 transition-colors group"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-transparent group-hover:ring-neutral-500 transition-all"
              style={{ background: color }}
            />
            {label}
            <input
              ref={ref}
              type="color"
              value={color}
              onChange={e => updateColor(colorKey, e.target.value)}
              style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
            />
          </button>
        ))}
        <button
          onClick={() => setShowHomeModal(true)}
          className="ml-auto flex items-center gap-1 text-neutral-500 hover:text-accent transition-colors"
        >
          <Home size={11} /> Change home
        </button>
      </div>

      {/* Add place + lists — narrower for readability */}
      <div className="max-w-3xl space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-base text-neutral-100">Add a place</h2>
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setError(null); }}
              onKeyDown={e => e.key === "Enter" && addPlace()}
              placeholder="City or country…"
              className="w-44 px-3 py-2 rounded-xl text-sm font-body bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-accent transition-colors"
              disabled={loading}
            />
            <select
              value={addStatus}
              onChange={e => setAddStatus(e.target.value as "visited" | "to-visit")}
              className="px-3 py-2 rounded-xl text-xs font-body bg-neutral-900 border border-neutral-700 text-neutral-300 focus:outline-none focus:border-accent transition-colors"
              disabled={loading}
            >
              <option value="visited">Visited</option>
              <option value="to-visit">Want to visit</option>
            </select>
            <button
              onClick={addPlace}
              disabled={loading || !input.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-body text-xs font-medium text-white bg-accent hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Add
            </button>
          </div>
          {error && <p className="text-xs font-body text-red-400">{error}</p>}
        </div>

        <PlaceList title="Visited" places={visited} dotColor={colors.visited} homeColor={colors.home}
          onRemove={removePlace}
          onMove={id => movePlace(id, "to-visit")} moveLabel="Move to want-to-visit" />

        <PlaceList title="Want to visit" places={toVisit} dotColor={colors.toVisit} homeColor={colors.home}
          onRemove={removePlace}
          onMove={id => movePlace(id, "visited")} moveLabel="Mark as visited" />
      </div>
    </div>
  );
}

interface PlaceListProps {
  title: string; places: Place[]; dotColor: string; homeColor: string;
  onRemove: (id: string) => void;
  onMove: (id: string) => void; moveLabel: string;
}

function PlaceList({ title, places, dotColor, homeColor, onRemove, onMove, moveLabel }: PlaceListProps) {
  if (places.length === 0) return null;
  return (
    <div>
      <h2 className="font-display text-base text-neutral-100 mb-3">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {places.map(place => (
          <div key={place.id} className="flex items-center gap-1.5 pl-2 pr-1 py-1.5 rounded-full text-xs font-body border border-neutral-700 bg-neutral-900 text-neutral-300">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: place.isHome ? homeColor : dotColor }} />
            <span>{place.name}{place.country ? `, ${place.country}` : ""}</span>
            <button onClick={() => onMove(place.id)} title={moveLabel}
              className="text-neutral-600 hover:text-neutral-300 transition-all text-[10px] px-1">⇄</button>
            <button onClick={() => onRemove(place.id)} title="Remove"
              className="text-neutral-600 hover:text-red-400 transition-all p-0.5">
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
