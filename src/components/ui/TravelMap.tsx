import { useState, type ReactElement } from "react";

type PinType = "home" | "visited" | "wishlist";

interface TravelPin {
  id: string;
  label: string;
  type: PinType;
  lat: number;
  lon: number;
}

// Equirectangular projection: x = (lon+180)/360*100, y = (90-lat)/180*100
function latLonToPercent(lat: number, lon: number) {
  return {
    left: ((lon + 180) / 360) * 100,
    top: ((90 - lat) / 180) * 100,
  };
}

const PINS: TravelPin[] = [
  { id: "home",      label: "Edinburgh, Scotland", type: "home",     lat: 55.9,  lon: -3.2  },
  { id: "newyork",   label: "New York",            type: "visited",  lat: 40.7,  lon: -74.0 },
  { id: "lisbon",    label: "Portugal",            type: "visited",  lat: 38.7,  lon: -9.1  },
  { id: "paris",     label: "France",              type: "visited",  lat: 48.9,  lon: 2.3   },
  { id: "rome",      label: "Italy",               type: "visited",  lat: 41.9,  lon: 12.5  },
  { id: "barcelona", label: "Barcelona",           type: "visited",  lat: 41.4,  lon: 2.2   },
  { id: "istanbul",  label: "Turkey",              type: "visited",  lat: 41.0,  lon: 28.9  },
  { id: "tokyo",     label: "Japan",               type: "wishlist", lat: 35.7,  lon: 139.7 },
  { id: "bangkok",   label: "Thailand",            type: "wishlist", lat: 13.8,  lon: 100.5 },
  { id: "sydney",    label: "Australia",           type: "wishlist", lat: -33.9, lon: 151.2 },
  { id: "oslo",      label: "Norway",              type: "wishlist", lat: 59.9,  lon: 10.8  },
];

// ─── SVG Pin Components ───────────────────────────────────────────────────────

function MushroomPin({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.57} viewBox="0 0 28 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="14" cy="21" rx="10" ry="3.5" fill="#c0503a" />
      <circle cx="14" cy="12" r="10" fill="#e8674f" />
      <circle cx="10" cy="8" r="3.5" fill="rgba(255,255,255,0.45)" />
      <rect x="13" y="23" width="2.5" height="16" rx="1.25" fill="#8a7060" />
      <ellipse cx="14" cy="40" rx="5" ry="2" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

function StarPin({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.57} viewBox="0 0 28 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 2 L16.47 9.18 L24 9.18 L17.76 13.82 L20.24 21 L14 16.36 L7.76 21 L10.24 13.82 L4 9.18 L11.53 9.18 Z"
        fill="#4bbdcc"
      />
      <circle cx="10.5" cy="7.5" r="2" fill="rgba(255,255,255,0.45)" />
      <rect x="13" y="22" width="2.5" height="17" rx="1.25" fill="#8a7060" />
      <ellipse cx="14" cy="40" rx="5" ry="2" fill="rgba(0,0,0,0.13)" />
    </svg>
  );
}

function FlagPin({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.57} viewBox="0 0 28 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12.5" y="4" width="2.5" height="34" rx="1.25" fill="#5a4a3a" />
      {/* Flag rectangle */}
      <rect x="15" y="4" width="13" height="10" rx="1" fill="#003f8a" />
      {/* St Andrew's cross — white diagonals */}
      <line x1="15" y1="4" x2="28" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="14" x2="28" y2="4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="13.75" cy="40" rx="4.5" ry="1.8" fill="rgba(0,0,0,0.13)" />
    </svg>
  );
}

function CornerPin({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="9" cy="13" rx="6" ry="2" fill="#7a6a52" />
      <circle cx="9" cy="8" r="6" fill="#a08060" />
      <circle cx="7" cy="6" r="2" fill="rgba(255,255,255,0.4)" />
      <ellipse cx="9" cy="22" rx="3.5" ry="1.2" fill="rgba(0,0,0,0.12)" />
    </svg>
  );
}

// ─── World Map SVG paths (simplified equirectangular, viewBox 1000×500) ──────

const NORTH_AMERICA = `
  M 95,72 L 120,52 L 165,50 L 210,52 L 250,58 L 270,68
  L 300,62 L 340,70 L 370,82 L 390,100 L 398,120
  L 388,150 L 370,165 L 358,185 L 350,210 L 332,222
  L 310,238 L 295,252 L 288,268 L 302,278 L 310,262
  L 330,255 L 338,268 L 322,278 L 310,288
  L 280,282 L 260,265 L 250,245 L 235,240
  L 218,255 L 210,268 L 222,280 L 235,275
  L 245,285 L 240,298 L 228,302 L 212,295
  L 195,278 L 185,268 L 175,250 L 165,235
  L 152,222 L 140,215 L 128,220 L 118,232
  L 108,240 L 95,238 L 82,228 L 72,215
  L 60,200 L 52,185 L 48,168 L 52,150
  L 45,138 L 38,122 L 35,105 L 42,90
  L 55,78 L 70,72 Z
`;

const GREENLAND = `
  M 318,38 L 340,30 L 372,28 L 400,32 L 418,42
  L 428,58 L 422,72 L 408,80 L 388,82 L 365,75
  L 342,68 L 326,58 L 318,48 Z
`;

const SOUTH_AMERICA = `
  M 248,272 L 262,268 L 278,270 L 292,280
  L 305,295 L 318,310 L 328,330 L 332,355
  L 328,380 L 318,400 L 305,418 L 288,430
  L 272,438 L 255,435 L 240,425 L 228,410
  L 218,392 L 210,372 L 208,350 L 212,328
  L 218,308 L 228,290 L 238,278 Z
`;

const EUROPE = `
  M 448,68 L 462,62 L 478,60 L 492,65 L 510,62
  L 530,65 L 548,70 L 558,80 L 548,90 L 538,98
  L 528,105 L 520,118 L 510,125 L 500,130
  L 488,128 L 478,135 L 470,142 L 458,148
  L 448,145 L 438,138 L 432,128 L 435,115
  L 440,102 L 445,90 L 448,78 Z
  M 480,148 L 490,144 L 498,148 L 502,158
  L 498,165 L 488,168 L 480,162 L 478,155 Z
  M 505,132 L 515,128 L 522,135 L 520,145
  L 512,148 L 505,142 Z
  M 534,120 L 548,115 L 558,120 L 562,132
  L 555,140 L 542,140 L 534,132 Z
`;

const AFRICA = `
  M 448,182 L 465,178 L 482,175 L 500,178
  L 518,180 L 535,185 L 548,198 L 555,215
  L 558,235 L 555,258 L 548,278 L 538,298
  L 525,318 L 510,335 L 495,348 L 480,358
  L 465,362 L 450,358 L 435,348 L 422,332
  L 412,312 L 405,290 L 402,268 L 405,245
  L 410,222 L 418,202 L 430,190 Z
`;

const ICELAND = `
  M 432,78 L 442,72 L 452,72 L 460,78
  L 458,88 L 448,92 L 438,88 Z
`;

const ASIA = `
  M 558,78 L 580,65 L 610,58 L 648,55
  L 690,52 L 730,50 L 770,52 L 808,55
  L 845,60 L 878,68 L 905,78 L 928,90
  L 945,105 L 952,122 L 948,140 L 938,155
  L 922,165 L 905,172 L 885,178 L 865,182
  L 848,190 L 835,202 L 820,215 L 808,228
  L 795,240 L 782,250 L 768,258 L 752,265
  L 735,268 L 718,265 L 702,258 L 688,250
  L 672,242 L 658,238 L 642,238 L 628,242
  L 615,250 L 602,258 L 590,265 L 578,268
  L 562,265 L 548,258 L 538,248 L 532,235
  L 528,220 L 525,205 L 528,190 L 535,175
  L 542,162 L 548,148 L 548,135 L 545,120
  L 542,105 L 545,90 Z
  M 858,188 L 872,182 L 882,188 L 882,200
  L 872,205 L 858,200 Z
`;

const JAPAN = `
  M 878,148 L 888,142 L 895,148 L 892,158
  L 882,162 L 875,155 Z
  M 885,162 L 895,158 L 902,165 L 898,175
  L 888,178 L 882,170 Z
`;

const AUSTRALIA = `
  M 798,318 L 820,308 L 845,305 L 870,308
  L 892,315 L 910,328 L 920,342 L 922,358
  L 915,375 L 902,388 L 882,398 L 860,402
  L 838,400 L 818,392 L 802,378 L 792,360
  L 790,342 L 794,328 Z
`;

const NEW_ZEALAND = `
  M 950,358 L 960,352 L 968,358 L 965,368
  L 955,372 L 948,365 Z
  M 952,375 L 962,370 L 970,375 L 968,385
  L 958,390 L 950,384 Z
`;

const ANTARCTICA = `
  M 60,480 L 200,472 L 350,468 L 500,465
  L 650,465 L 800,468 L 940,472 L 1000,478
  L 1000,500 L 0,500 Z
`;

// ─── Individual pin on map ────────────────────────────────────────────────────

interface MapPinProps {
  pin: TravelPin;
  visible: boolean;
}

function MapPin({ pin, visible }: MapPinProps) {
  const [hovered, setHovered] = useState(false);
  const { left, top } = latLonToPercent(pin.lat, pin.lon);

  return (
    <div
      className="travel-map-pin"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: hovered ? "translate(-50%, -100%) translateY(-9px)" : "translate(-50%, -100%)",
        filter: hovered
          ? "drop-shadow(0 12px 8px rgba(0,0,0,0.35))"
          : "drop-shadow(0 3px 3px rgba(0,0,0,0.2))",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={pin.label}
    >
      {pin.type === "home" && <FlagPin size={16} />}
      {pin.type === "visited" && <MushroomPin size={14} />}
      {pin.type === "wishlist" && <StarPin size={14} />}
      {hovered && (
        <div className="travel-map-pin-tooltip">{pin.label}</div>
      )}
    </div>
  );
}

// ─── Dog-ear fold ─────────────────────────────────────────────────────────────

function DogEar() {
  const [unfolded, setUnfolded] = useState(false);

  return (
    <div
      className="travel-map-dogear"
      onMouseEnter={() => setUnfolded(true)}
      onMouseLeave={() => setUnfolded(false)}
    >
      {/* Note text — sits on the paper, revealed when triangle unfolds */}
      <span className={`travel-map-dogear-note handwritten${unfolded ? " open" : ""}`}>
        psst… hi! 🗺️
      </span>
      {/* The folded triangle — paper back-side colour, collapses to corner on hover */}
      <div
        className="travel-map-dogear-flap"
        style={{
          clipPath: unfolded
            ? "polygon(100% 100%, 100% 100%, 100% 100%)"
            : "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />
    </div>
  );
}

// ─── Filter sidebar ───────────────────────────────────────────────────────────

interface FilterBarProps {
  activeFilters: Set<PinType>;
  onToggle: (type: PinType) => void;
}

function FilterBar({ activeFilters, onToggle }: FilterBarProps) {
  const items: { type: PinType; label: string; pin: ReactElement }[] = [
    { type: "home",     label: "home",     pin: <FlagPin size={18} /> },
    { type: "visited",  label: "visited",  pin: <MushroomPin size={16} /> },
    { type: "wishlist", label: "wishlist", pin: <StarPin size={16} /> },
  ];

  return (
    <div className="travel-map-filter-bar">
      {items.map(({ type, label, pin }) => {
        const active = activeFilters.has(type);
        return (
          <button
            key={type}
            className={`travel-map-filter-pin${active ? "" : " inactive"}`}
            onClick={() => onToggle(type)}
            title={`${active ? "hide" : "show"} ${label}`}
          >
            {pin}
            <span className="travel-map-filter-label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TravelMap() {
  const [activeFilters, setActiveFilters] = useState<Set<PinType>>(
    new Set(["home", "visited", "wishlist"])
  );

  const toggleFilter = (type: PinType) => {
    setActiveFilters((prev: Set<PinType>) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div className="travel-map-container">
      <div className="travel-map-paper">
        {/* Corner decorative pins */}
        <div className="travel-map-corner-pin tl"><CornerPin /></div>
        <div className="travel-map-corner-pin tr"><CornerPin /></div>
        <div className="travel-map-corner-pin bl"><CornerPin /></div>
        <div className="travel-map-corner-pin br-safe"><CornerPin /></div>

        {/* World map SVG */}
        <svg
          className="travel-map-svg"
          viewBox="0 0 1000 500"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Ocean background */}
          <rect width="1000" height="500" fill="#6daac8" />

          {/* Ocean waves — three strips, each 2000px wide so they tile */}
          <g className="travel-map-wave" style={{ animationDuration: "14s" }}>
            <path
              d="M-1000,112 Q-975,105 -950,112 Q-925,119 -900,112 Q-875,105 -850,112 Q-825,119 -800,112 Q-775,105 -750,112 Q-725,119 -700,112 Q-675,105 -650,112 Q-625,119 -600,112 Q-575,105 -550,112 Q-525,119 -500,112 Q-475,105 -450,112 Q-425,119 -400,112 Q-375,105 -350,112 Q-325,119 -300,112 Q-275,105 -250,112 Q-225,119 -200,112 Q-175,105 -150,112 Q-125,119 -100,112 Q-75,105 -50,112 Q-25,119 0,112 Q25,105 50,112 Q75,119 100,112 Q125,105 150,112 Q175,119 200,112 Q225,105 250,112 Q275,119 300,112 Q325,105 350,112 Q375,119 400,112 Q425,105 450,112 Q475,119 500,112 Q525,105 550,112 Q575,119 600,112 Q625,105 650,112 Q675,119 700,112 Q725,105 750,112 Q775,119 800,112 Q825,105 850,112 Q875,119 900,112 Q925,105 950,112 Q975,119 1000,112 Q1025,105 1050,112 Q1075,119 1100,112 Q1125,105 1150,112 Q1175,119 1200,112 Q1225,105 1250,112 Q1275,119 1300,112 Q1325,105 1350,112 Q1375,119 1400,112 Q1425,105 1450,112 Q1475,119 1500,112 Q1525,105 1550,112 Q1575,119 1600,112 Q1625,105 1650,112 Q1675,119 1700,112 Q1725,105 1750,112 Q1775,119 1800,112 Q1825,105 1850,112 Q1875,119 1900,112 Q1925,105 1950,112 Q1975,119 2000,112"
              stroke="rgba(255,255,255,0.09)" strokeWidth="2.5" fill="none"
            />
          </g>

          <g className="travel-map-wave" style={{ animationDuration: "18s", animationDelay: "-6s" }}>
            <path
              d="M-1000,255 Q-975,248 -950,255 Q-925,262 -900,255 Q-875,248 -850,255 Q-825,262 -800,255 Q-775,248 -750,255 Q-725,262 -700,255 Q-675,248 -650,255 Q-625,262 -600,255 Q-575,248 -550,255 Q-525,262 -500,255 Q-475,248 -450,255 Q-425,262 -400,255 Q-375,248 -350,255 Q-325,262 -300,255 Q-275,248 -250,255 Q-225,262 -200,255 Q-175,248 -150,255 Q-125,262 -100,255 Q-75,248 -50,255 Q-25,262 0,255 Q25,248 50,255 Q75,262 100,255 Q125,248 150,255 Q175,262 200,255 Q225,248 250,255 Q275,262 300,255 Q325,248 350,255 Q375,262 400,255 Q425,248 450,255 Q475,262 500,255 Q525,248 550,255 Q575,262 600,255 Q625,248 650,255 Q675,262 700,255 Q725,248 750,255 Q775,262 800,255 Q825,248 850,255 Q875,262 900,255 Q925,248 950,255 Q975,262 1000,255 Q1025,248 1050,255 Q1075,262 1100,255 Q1125,248 1150,255 Q1175,262 1200,255 Q1225,248 1250,255 Q1275,262 1300,255 Q1325,248 1350,255 Q1375,262 1400,255 Q1425,248 1450,255 Q1475,262 1500,255 Q1525,248 1550,255 Q1575,262 1600,255 Q1625,248 1650,255 Q1675,262 1700,255 Q1725,248 1750,255 Q1775,262 1800,255 Q1825,248 1850,255 Q1875,262 1900,255 Q1925,248 1950,255 Q1975,262 2000,255"
              stroke="rgba(255,255,255,0.07)" strokeWidth="2" fill="none"
            />
          </g>

          <g className="travel-map-wave" style={{ animationDuration: "22s", animationDelay: "-12s" }}>
            <path
              d="M-1000,388 Q-975,381 -950,388 Q-925,395 -900,388 Q-875,381 -850,388 Q-825,395 -800,388 Q-775,381 -750,388 Q-725,395 -700,388 Q-675,381 -650,388 Q-625,395 -600,388 Q-575,381 -550,388 Q-525,395 -500,388 Q-475,381 -450,388 Q-425,395 -400,388 Q-375,381 -350,388 Q-325,395 -300,388 Q-275,381 -250,388 Q-225,395 -200,388 Q-175,381 -150,388 Q-125,395 -100,388 Q-75,381 -50,388 Q-25,395 0,388 Q25,381 50,388 Q75,395 100,388 Q125,381 150,388 Q175,395 200,388 Q225,381 250,388 Q275,395 300,388 Q325,381 350,388 Q375,395 400,388 Q425,381 450,388 Q475,395 500,388 Q525,381 550,388 Q575,395 600,388 Q625,381 650,388 Q675,395 700,388 Q725,381 750,388 Q775,395 800,388 Q825,381 850,388 Q875,395 900,388 Q925,381 950,388 Q975,395 1000,388 Q1025,381 1050,388 Q1075,395 1100,388 Q1125,381 1150,388 Q1175,395 1200,388 Q1225,381 1250,388 Q1275,395 1300,388 Q1325,381 1350,388 Q1375,395 1400,388 Q1425,381 1450,388 Q1475,395 1500,388 Q1525,381 1550,388 Q1575,395 1600,388 Q1625,381 1650,388 Q1675,395 1700,388 Q1725,381 1750,388 Q1775,395 1800,388 Q1825,381 1850,388 Q1875,395 1900,388 Q1925,381 1950,388 Q1975,395 2000,388"
              stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none"
            />
          </g>

          {/* Graticule — 30° longitude lines */}
          {[83, 167, 250, 333, 417, 500, 583, 667, 750, 833, 917].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
          ))}
          {/* Graticule — 30° latitude lines */}
          {[83, 167, 333, 417].map((y) => (
            <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
          ))}
          {/* Tropic of Cancer (23.4°N) and Tropic of Capricorn (23.4°S) */}
          <line x1="0" y1="185" x2="1000" y2="185" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" strokeDasharray="6 4" />
          <line x1="0" y1="315" x2="1000" y2="315" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" strokeDasharray="6 4" />
          {/* Equator */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          {/* Prime meridian */}
          <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255,255,255,0.10)" strokeWidth="0.7" />

          {/* Landmasses — slightly stronger definition */}
          {[
            NORTH_AMERICA, GREENLAND, SOUTH_AMERICA,
            EUROPE, AFRICA, ICELAND,
            ASIA, JAPAN, AUSTRALIA, NEW_ZEALAND, ANTARCTICA
          ].map((d, i) => (
            <path key={i} d={d} fill="#7dab7d" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" strokeLinejoin="round" />
          ))}
          {/* Inland tone overlay for texture */}
          {[
            NORTH_AMERICA, SOUTH_AMERICA, EUROPE, AFRICA, ASIA, AUSTRALIA
          ].map((d, i) => (
            <path key={`t${i}`} d={d} fill="rgba(255,255,255,0.06)" stroke="none" />
          ))}

          {/* Subtle paper vignette overlay */}
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
          </radialGradient>
          <rect width="1000" height="500" fill="url(#vignette)" />
        </svg>

        {/* Map pins layer */}
        <div className="travel-map-pins-layer">
          {PINS.map((pin) => (
            <MapPin key={pin.id} pin={pin} visible={activeFilters.has(pin.type)} />
          ))}
        </div>

        {/* Filter bar */}
        <FilterBar activeFilters={activeFilters} onToggle={toggleFilter} />

        {/* Dog-ear fold */}
        <DogEar />
      </div>
    </div>
  );
}
