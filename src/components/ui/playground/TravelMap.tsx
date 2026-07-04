import { useState, type ReactElement } from "react";

type PinType = "home" | "visited" | "wishlist";

interface TravelPin {
  id: string;
  label: string;
  type: PinType;
  lat: number;
  lon: number;
}

function latLonToPercent(lat: number, lon: number) {
  return {
    left: ((lon + 180) / 360) * 100,
    top: ((90 - lat) / 180) * 100,
  };
}

const PINS: TravelPin[] = [
  { id: "home",      label: "Edinburgh, Scotland", type: "home",     lat: 55.9,  lon: -3.2  },
  { id: "newyork",   label: "New York",            type: "visited",  lat: 40.7,  lon: -74.0 },
  { id: "portugal",  label: "Portugal",            type: "visited",  lat: 38.7,  lon: -9.1  },
  { id: "france",    label: "France",              type: "visited",  lat: 48.9,  lon: 2.3   },
  { id: "italy",     label: "Italy",               type: "visited",  lat: 41.9,  lon: 12.5  },
  { id: "barcelona", label: "Barcelona",           type: "visited",  lat: 41.4,  lon: 2.2   },
  { id: "turkey",    label: "Turkey",              type: "visited",  lat: 41.0,  lon: 28.9  },
  { id: "japan",     label: "Japan",               type: "wishlist", lat: 35.7,  lon: 139.7 },
  { id: "thailand",  label: "Thailand",            type: "wishlist", lat: 13.8,  lon: 100.5 },
  { id: "australia", label: "Australia",           type: "wishlist", lat: -33.9, lon: 151.2 },
  { id: "norway",    label: "Norway",              type: "wishlist", lat: 59.9,  lon: 10.8  },
];

// ─── SVG Pin Components ───────────────────────────────────────────────────────

function MushroomPin({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.57} viewBox="0 0 28 44" fill="none">
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
    <svg width={size} height={size * 1.57} viewBox="0 0 28 44" fill="none">
      <path
        d="M14 2 L16.47 9.18 L24 9.18 L17.76 13.82 L20.24 21 L14 16.36 L7.76 21 L10.24 13.82 L4 9.18 L11.53 9.18 Z"
        fill="#f5c532"
      />
      <circle cx="10.5" cy="7.5" r="2" fill="rgba(255,255,255,0.5)" />
      <rect x="13" y="22" width="2.5" height="17" rx="1.25" fill="#8a7060" />
      <ellipse cx="14" cy="40" rx="5" ry="2" fill="rgba(0,0,0,0.13)" />
    </svg>
  );
}

function FlagPin({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.57} viewBox="0 0 28 44" fill="none">
      <rect x="12.5" y="4" width="2.5" height="34" rx="1.25" fill="#5a4a3a" />
      <rect x="15" y="4" width="13" height="10" rx="1" fill="#003f8a" />
      <line x1="15" y1="4" x2="28" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="14" x2="28" y2="4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="13.75" cy="40" rx="4.5" ry="1.8" fill="rgba(0,0,0,0.13)" />
    </svg>
  );
}

function CornerPin({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 18 24" fill="none">
      <ellipse cx="9" cy="13" rx="6" ry="2" fill="#7a6a52" />
      <circle cx="9" cy="8" r="6" fill="#a08060" />
      <circle cx="7" cy="6" r="2" fill="rgba(255,255,255,0.4)" />
      <ellipse cx="9" cy="22" rx="3.5" ry="1.2" fill="rgba(0,0,0,0.12)" />
    </svg>
  );
}

// ─── World Map SVG paths (equirectangular, viewBox 1000×500) ─────────────────
// x = (lon + 180) / 360 * 1000   y = (90 − lat) / 180 * 500

const NORTH_AMERICA = `
  M 95,72 L 122,52 L 165,50 L 210,52 L 255,58 L 275,68
  L 302,62 L 345,72 L 375,86 L 392,106 L 398,122
  L 385,148 L 368,162 L 355,185 L 348,208 L 332,222
  L 320,238 L 305,252 L 290,262 L 278,272
  L 292,278 L 305,265 L 328,258 L 335,270
  L 320,280 L 308,288
  L 278,282 L 258,265 L 248,245 L 232,240
  L 215,255 L 208,268 L 218,278 L 232,273
  L 242,282 L 238,295 L 225,300 L 210,292
  L 195,278 L 182,265 L 172,248 L 162,232
  L 148,220 L 138,215 L 125,220 L 115,232
  L 105,240 L 92,235 L 80,225 L 70,212
  L 58,198 L 50,182 L 46,165 L 50,148
  L 43,135 L 36,118 L 32,102 L 40,88
  L 55,76 L 72,70 Z
`;

const GREENLAND = `
  M 320,35 L 342,28 L 375,26 L 402,30 L 420,40
  L 430,56 L 422,70 L 408,78 L 386,80 L 362,72
  L 340,65 L 324,55 Z
`;

const SOUTH_AMERICA = `
  M 248,270 L 265,265 L 280,268 L 295,278
  L 308,295 L 320,312 L 330,332 L 334,358
  L 328,382 L 318,402 L 305,420 L 288,432
  L 272,438 L 254,435 L 238,424 L 226,408
  L 216,390 L 208,370 L 206,348 L 210,326
  L 216,306 L 226,288 L 238,275 Z
`;

// Europe — main body (Iberia through Balkans/Greece) + Scandinavian peninsula + Italian boot
const EUROPE = `
  M 474,148
  L 474,131 L 480,128 L 489,128 L 494,128
  L 494,117 L 486,117 L 492,111
  L 500,108 L 511,106 L 519,103 L 528,97
  L 544,100 L 556,97 L 561,97
  L 569,89 L 583,86
  L 608,94 L 608,108
  L 594,122 L 583,125 L 578,131
  L 567,136 L 567,147 L 561,142
  L 556,139 L 550,133
  L 544,128 L 536,125 L 528,125 L 517,128
  L 511,131 L 506,133 L 503,136
  L 497,139 L 494,144
  L 486,147 L 486,150 Z
  M 519,100
  L 514,83 L 511,75
  L 517,64 L 531,58 L 544,53
  L 564,50 L 578,53 L 578,58
  L 572,69 L 561,83 L 556,97 L 544,100 Z
  M 533,125
  L 536,128 L 542,136
  L 536,144 L 542,144
  L 550,139 L 544,128 Z
`;

const ICELAND = `
  M 432,78 L 442,72 L 455,70 L 462,76
  L 460,88 L 448,93 L 436,88 Z
`;

const AFRICA = `
  M 448,180 L 467,176 L 483,173 L 502,176
  L 520,178 L 538,183 L 552,196 L 558,215
  L 560,238 L 556,260 L 548,282 L 538,302
  L 524,322 L 509,340 L 494,353 L 478,360
  L 462,363 L 448,358 L 432,347 L 419,330
  L 408,310 L 402,288 L 399,265 L 403,242
  L 408,219 L 418,200 L 432,188 Z
`;

// Asia main body + Arabian Peninsula + India + Indochina
const ASIA = `
  M 558,78 L 583,65 L 614,58 L 652,54
  L 692,51 L 732,50 L 772,52 L 810,55
  L 847,60 L 881,68 L 908,78 L 931,92
  L 947,108 L 953,125 L 948,142 L 936,158
  L 919,167 L 900,172 L 880,178 L 860,182
  L 847,186 L 836,194 L 822,208 L 811,222
  L 797,236 L 783,247 L 769,256 L 752,264
  L 736,267 L 719,264 L 703,256 L 689,248
  L 672,240 L 658,236 L 642,238 L 628,244
  L 614,252 L 602,260 L 589,264 L 572,261
  L 548,256 L 536,244 L 530,230 L 525,214
  L 528,192 L 536,175 L 545,160 L 550,148
  L 548,135 L 544,120 L 545,105 L 548,90 Z
`;

// Arabian peninsula (protrudes SW from main Asia)
const ARABIAN_PENINSULA = `
  M 594,175
  L 608,164 L 628,164 L 647,169
  L 658,181 L 661,192 L 656,203
  L 647,211 L 631,214 L 617,211
  L 611,200 L 606,186 Z
`;

// Indian subcontinent (protrudes south)
const INDIA = `
  M 672,183
  L 692,181 L 714,178 L 739,178
  L 752,186 L 756,197 L 750,211
  L 739,219 L 727,225 L 714,228
  L 706,222 L 700,211 L 694,200
  L 681,194 Z
`;

// Indochina peninsula (SE Asia)
const INDOCHINA = `
  M 775,244
  L 783,239 L 794,241 L 800,250
  L 797,261 L 792,272 L 786,281
  L 781,272 L 778,258 Z
`;

const JAPAN = `
  M 878,148 L 888,142 L 895,148 L 892,158
  L 882,162 L 875,155 Z
  M 885,162 L 895,158 L 902,165 L 898,175
  L 888,178 L 882,170 Z
`;

const AUSTRALIA = `
  M 798,318 L 820,306 L 847,303 L 872,307
  L 894,314 L 912,328 L 922,344 L 922,360
  L 914,377 L 900,390 L 880,400 L 858,403
  L 836,400 L 816,391 L 800,376 L 791,358
  L 789,340 L 793,326 Z
`;

const NEW_ZEALAND = `
  M 950,356 L 960,350 L 969,356 L 966,367
  L 956,371 L 948,364 Z
  M 953,374 L 963,368 L 971,374 L 968,385
  L 958,390 L 951,383 Z
`;

const ANTARCTICA = `
  M 0,482 L 120,474 L 260,469 L 400,466
  L 500,464 L 640,466 L 780,469 L 900,474
  L 1000,480 L 1000,500 L 0,500 Z
`;

const ALL_LAND = [
  NORTH_AMERICA, GREENLAND, SOUTH_AMERICA,
  EUROPE, ICELAND, AFRICA,
  ASIA, ARABIAN_PENINSULA, INDIA, INDOCHINA,
  JAPAN, AUSTRALIA, NEW_ZEALAND, ANTARCTICA,
];

// ─── Individual pin on map ────────────────────────────────────────────────────

interface MapPinProps {
  pin: TravelPin;
  visible: boolean;
  active: boolean;
  onActivate: (id: string) => void;
  onDeactivate: () => void;
}

function MapPin({ pin, visible, active, onActivate, onDeactivate }: MapPinProps) {
  const [hovered, setHovered] = useState(false);
  const { left, top } = latLonToPercent(pin.lat, pin.lon);
  const lifted = hovered || active;

  return (
    <div
      className="travel-map-pin"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: lifted
          ? "translate(-50%, -100%) translateY(-9px)"
          : "translate(-50%, -100%)",
        filter: lifted
          ? "drop-shadow(0 10px 6px rgba(0,0,0,0.35))"
          : "drop-shadow(0 2px 2px rgba(0,0,0,0.22))",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); onDeactivate(); }}
      onClick={(e) => { e.stopPropagation(); onActivate(pin.id); }}
      title={pin.label}
    >
      {pin.type === "home"     && <FlagPin    size={16} />}
      {pin.type === "visited"  && <MushroomPin size={14} />}
      {pin.type === "wishlist" && <StarPin     size={14} />}
      {active && (
        <div className="travel-map-pin-label">{pin.label}</div>
      )}
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
    { type: "home",     label: "home",     pin: <FlagPin     size={18} /> },
    { type: "visited",  label: "visited",  pin: <MushroomPin size={16} /> },
    { type: "wishlist", label: "wishlist", pin: <StarPin     size={16} /> },
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

const CORNER = 68;

export function TravelMap() {
  const [activeFilters, setActiveFilters] = useState<Set<PinType>>(
    new Set(["home", "visited", "wishlist"])
  );
  const [folded, setFolded] = useState(true);
  const [activePinId, setActivePinId] = useState<string | null>(null);

  const toggleFilter = (type: PinType) => {
    setActiveFilters((prev: Set<PinType>) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // clip-path cuts the bottom-right corner to expose the wall behind
  const paperClip = folded
    ? `polygon(0 0, 100% 0, 100% calc(100% - ${CORNER}px), calc(100% - ${CORNER}px) 100%, 0 100%)`
    : `polygon(0 0, 100% 0, 100% 100%, 0 100%)`;

  return (
    <div className="travel-map-container">
      {/* Outer wrapper carries the box-shadow (clip-path kills shadow on the paper itself) */}
      <div className="travel-map-outer">

        {/* Paper — clip-path cuts the bottom-right corner, revealing the wall */}
        <div
          className="travel-map-paper"
          style={{ clipPath: paperClip }}
          onClick={() => setActivePinId(null)}
        >
          {/* Corner decorative pins */}
          <div className="travel-map-corner-pin tl"><CornerPin /></div>
          <div className="travel-map-corner-pin tr"><CornerPin /></div>
          <div className="travel-map-corner-pin bl"><CornerPin /></div>
          <div className="travel-map-corner-pin br-safe"><CornerPin /></div>

          {/* World map SVG — no grid, waves only */}
          <svg
            className="travel-map-svg"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
          >
            <rect width="1000" height="500" fill="#6daac8" />

            {/* Ocean waves — three strips, each 2000px wide */}
            <g className="travel-map-wave" style={{ animationDuration: "14s" }}>
              <path
                d="M-1000,112 Q-975,105 -950,112 Q-925,119 -900,112 Q-875,105 -850,112 Q-825,119 -800,112 Q-775,105 -750,112 Q-725,119 -700,112 Q-675,105 -650,112 Q-625,119 -600,112 Q-575,105 -550,112 Q-525,119 -500,112 Q-475,105 -450,112 Q-425,119 -400,112 Q-375,105 -350,112 Q-325,119 -300,112 Q-275,105 -250,112 Q-225,119 -200,112 Q-175,105 -150,112 Q-125,119 -100,112 Q-75,105 -50,112 Q-25,119 0,112 Q25,105 50,112 Q75,119 100,112 Q125,105 150,112 Q175,119 200,112 Q225,105 250,112 Q275,119 300,112 Q325,105 350,112 Q375,119 400,112 Q425,105 450,112 Q475,119 500,112 Q525,105 550,112 Q575,119 600,112 Q625,105 650,112 Q675,119 700,112 Q725,105 750,112 Q775,119 800,112 Q825,105 850,112 Q875,119 900,112 Q925,105 950,112 Q975,119 1000,112 Q1025,105 1050,112 Q1075,119 1100,112 Q1125,105 1150,112 Q1175,119 1200,112 Q1225,105 1250,112 Q1275,119 1300,112 Q1325,105 1350,112 Q1375,119 1400,112 Q1425,105 1450,112 Q1475,119 1500,112 Q1525,105 1550,112 Q1575,119 1600,112 Q1625,105 1650,112 Q1675,119 1700,112 Q1725,105 1750,112 Q1775,119 1800,112 Q1825,105 1850,112 Q1875,119 1900,112 Q1925,105 1950,112 Q1975,119 2000,112"
                stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" fill="none"
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

            {/* Landmasses */}
            {ALL_LAND.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="#7dab7d"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            ))}

            {/* Subtle vignette */}
            <defs>
              <radialGradient id="tmVignette" cx="50%" cy="50%" r="70%">
                <stop offset="60%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
              </radialGradient>
            </defs>
            <rect width="1000" height="500" fill="url(#tmVignette)" />
          </svg>

          {/* Map pins layer */}
          <div className="travel-map-pins-layer">
            {PINS.map((pin) => (
              <MapPin
                key={pin.id}
                pin={pin}
                visible={activeFilters.has(pin.type)}
                active={activePinId === pin.id}
                onActivate={setActivePinId}
                onDeactivate={() => setActivePinId((cur) => cur === pin.id ? null : cur)}
              />
            ))}
          </div>

          {/* Filter bar */}
          <FilterBar activeFilters={activeFilters} onToggle={toggleFilter} />

          {/* Note text — lives in the corner, only visible when paper is unfolded */}
          <span className={`travel-map-dogear-note handwritten${!folded ? " open" : ""}`}>
            psst… hi! 🗺️
          </span>
        </div>

        {/* Fold crease — diagonal shadow along the cut edge, sits outside the clip */}
        <div
          className="travel-map-fold-crease"
          style={{ opacity: folded ? 1 : 0 }}
        />

        {/* Hover zone — triggers the unfold, sits outside clip so it catches events in the cut area */}
        <div
          className="travel-map-dogear-zone"
          onMouseEnter={() => setFolded(false)}
          onMouseLeave={() => setFolded(true)}
        />
      </div>
    </div>
  );
}
