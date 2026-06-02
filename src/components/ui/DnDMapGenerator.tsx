import { useState, useEffect, useRef } from "react";
import { RefreshCw, MapPin, Download, Check, X } from "lucide-react";
import { createNoise2D } from "simplex-noise";
import { cn } from "../../lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const W = 1000;
const H = 667;
const HM_W = 400;
const HM_H = 267;

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserPin { id: string; nx: number; ny: number; label: string; }
interface ForestCluster { cx: number; cy: number; }
interface LandscapeLocation { type: "city" | "town"; cx: number; cy: number; }
interface RiverPoint { gx: number; gy: number; }

type MapScale = "small" | "medium" | "large";
type CivSize = "village" | "town" | "city";
type BuildingType = "normal" | "castle" | "inn" | "tavern" | "merchant" | "church" | "blacksmith" | "potions" | "armoury";
interface TownBuilding { x: number; y: number; w: number; h: number; type: BuildingType; doorSide?: "N"|"S"|"E"|"W"; }
interface FarmArea { fx: number; fy: number; fw: number; fh: number; f: number; }

interface CubicSegment {
  p0: { x: number; y: number };
  cp1: { x: number; y: number };
  cp2: { x: number; y: number };
  p1: { x: number; y: number };
}
interface CivRoad {
  segments: CubicSegment[];
  width: number;
  style: "primary" | "secondary" | "track";
}

type RGB = [number, number, number];

// ─── Seeded RNG ──────────────────────────────────────────────────────────────

function seededRand(n: number, seed: number): number {
  let h = ((n | 0) ^ (Math.imul(seed | 0, 2654435761) | 0)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x45d9f3b) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
}

function getDoorSide(dx: number, dy: number): "N"|"S"|"E"|"W" {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "E" : "W";
  return dy > 0 ? "S" : "N";
}

// ─── Noise ────────────────────────────────────────────────────────────────────

function makeNoise(seed: number): ReturnType<typeof createNoise2D> {
  let s = (seed * 1664525 + 1013904223) | 0;
  return createNoise2D(() => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 0x100000000;
  });
}

function fbm(noise: ReturnType<typeof createNoise2D>, x: number, y: number, oct: number): number {
  let v = 0, amp = 0.5, freq = 1, maxV = 0;
  for (let i = 0; i < oct; i++) {
    v += amp * (noise(x * freq, y * freq) * 0.5 + 0.5);
    maxV += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return v / maxV;
}

// ─── Heightmap ────────────────────────────────────────────────────────────────

const SCALE_FREQ: Record<MapScale, number> = { small: 1.0, medium: 2.0, large: 4.0 };

// Organic road generation tuning parameters
const ORGANIC_ROAD = {
  curviness:         0.65, // 0–1: perpendicular offset of control points relative to road length
  wobble:            0.45, // 0–1: Perlin noise edge displacement (max ~5px at 1.0)
  widthVariance:     0.65, // 0–1: sine-wave oscillation of road width along its length
  minAngleDeltaDeg:  28,   // minimum angular separation between roads leaving same node
  cobbleDensity:     0.85, // 0–1: fraction of cobblestone stamp positions that are filled
  useChainedBeziers: true, // split roads >240px into 2 chained cubic segments
};

function buildMaps(seed: number, scale: MapScale = "medium"): { hm: Float32Array; am: Float32Array; sm: Float32Array } {
  const tn = makeNoise(seed);
  const an = makeNoise(seed + 99991);
  const dn = makeNoise(seed + 49999);

  const hm = new Float32Array(HM_W * HM_H);
  const am = new Float32Array(HM_W * HM_H);

  const marginX = 0.06 + seededRand(10, seed) * 0.05;
  const marginY = 0.08 + seededRand(11, seed) * 0.05;
  const tf = SCALE_FREQ[scale];

  let maxH = 0;
  for (let gy = 0; gy < HM_H; gy++) {
    for (let gx = 0; gx < HM_W; gx++) {
      const nx = gx / HM_W, ny = gy / HM_H;
      const raw = fbm(tn, nx * tf, ny * tf, 6) + fbm(dn, nx * tf * 4, ny * tf * 4, 3) * 0.08;
      const ex = Math.max(0, Math.max((marginX - nx) / marginX, (nx - (1 - marginX)) / marginX));
      const ey = Math.max(0, Math.max((marginY - ny) / marginY, (ny - (1 - marginY)) / marginY));
      const fall = 1 - Math.min(1, Math.pow(Math.max(ex, ey) * 3.5, 1.3));
      const h = Math.max(0, raw * fall);
      hm[gy * HM_W + gx] = h;
      am[gy * HM_W + gx] = fbm(an, nx * 4, ny * 4, 3);
      if (h > maxH) maxH = h;
    }
  }

  // Guarantee land
  if (maxH < 0.45) {
    const scale = 0.45 / maxH;
    for (let i = 0; i < hm.length; i++) hm[i] *= scale;
  }

  // World map mode: push more terrain below the water threshold for realistic ocean coverage
  if (scale === "small") {
    for (let i = 0; i < hm.length; i++) hm[i] *= 0.72;
  }
  // Large scale: more ocean for realistic land/ocean ratio
  if (scale === "large") {
    for (let i = 0; i < hm.length; i++) hm[i] *= 0.88;
  }

  // Hillshade
  const sm = new Float32Array(HM_W * HM_H);
  for (let gy = 0; gy < HM_H; gy++) {
    for (let gx = 0; gx < HM_W; gx++) {
      const gx0 = Math.max(0, gx - 1), gx2 = Math.min(HM_W - 1, gx + 1);
      const gy0 = Math.max(0, gy - 1), gy2 = Math.min(HM_H - 1, gy + 1);
      const dzdx = (hm[gy * HM_W + gx2] - hm[gy * HM_W + gx0]) / (gx2 - gx0);
      const dzdy = (hm[gy2 * HM_W + gx] - hm[gy0 * HM_W + gx]) / (gy2 - gy0);
      const ex = -dzdx * 10, ey = -dzdy * 10, ez = 0.15;
      const len = Math.sqrt(ex * ex + ey * ey + ez * ez);
      const lx = -0.5774, ly = -0.5774, lz = 0.5774;
      sm[gy * HM_W + gx] = Math.max(0.05, (ex * lx + ey * ly + ez * lz) / len);
    }
  }

  return { hm, am, sm };
}

function sampleGrid(g: Float32Array, nx: number, ny: number): number {
  const gx = Math.max(0, Math.min(HM_W - 1.001, nx * (HM_W - 1)));
  const gy = Math.max(0, Math.min(HM_H - 1.001, ny * (HM_H - 1)));
  const gx0 = gx | 0, gy0 = gy | 0, gx1 = gx0 + 1, gy1 = gy0 + 1;
  const fx = gx - gx0, fy = gy - gy0;
  return g[gy0 * HM_W + gx0] * (1 - fx) * (1 - fy)
       + g[gy0 * HM_W + gx1] * fx * (1 - fy)
       + g[gy1 * HM_W + gx0] * (1 - fx) * fy
       + g[gy1 * HM_W + gx1] * fx * fy;
}

// ─── Terrain Colour ───────────────────────────────────────────────────────────

const BANDS: Array<{ t: number; rgb: RGB }> = [
  { t: 0.30, rgb: [58, 84, 108] },
  { t: 0.37, rgb: [85, 120, 145] },
  { t: 0.41, rgb: [198, 182, 140] },
  { t: 0.48, rgb: [135, 152, 92] },
  { t: 0.55, rgb: [118, 140, 78] },
  { t: 0.62, rgb: [90, 120, 62] },
  { t: 0.69, rgb: [68, 98, 48] },
  { t: 0.75, rgb: [148, 138, 118] },
  { t: 0.82, rgb: [182, 174, 162] },
  { t: 0.90, rgb: [218, 212, 205] },
  { t: 1.01, rgb: [242, 240, 238] },
];

function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function terrainColor(h: number, arid: number): RGB {
  const blend = 0.014;
  let base: RGB = BANDS[BANDS.length - 1].rgb;
  for (let i = 0; i < BANDS.length - 1; i++) {
    if (h < BANDS[i + 1].t) {
      const delta = h - (BANDS[i + 1].t - blend);
      base = delta > 0 ? lerpRGB(BANDS[i].rgb, BANDS[i + 1].rgb, delta / blend) : BANDS[i].rgb;
      break;
    }
  }
  // Desert override
  if (arid > 0.62 && h > 0.41 && h < 0.58) {
    const t = Math.min(1, (arid - 0.62) / 0.15) * 0.85;
    return lerpRGB(base, [210, 188, 122], t);
  }
  return base;
}

// ─── Terrain Render (pixel-perfect with hillshading) ─────────────────────────

function renderTerrain(ctx: CanvasRenderingContext2D, hm: Float32Array, am: Float32Array, sm: Float32Array): void {
  const img = ctx.createImageData(W, H);
  const d = img.data;
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const nx = px / (W - 1), ny = py / (H - 1);
      const h = sampleGrid(hm, nx, ny);
      const arid = sampleGrid(am, nx, ny);
      const shade = Math.pow(Math.max(0, Math.min(1, sampleGrid(sm, nx, ny))), 0.65);
      let [r, g, b] = terrainColor(h, arid);
      r = r * shade + 25 * (1 - shade);
      g = g * shade + 18 * (1 - shade);
      b = b * shade + 8 * (1 - shade);
      const i = (py * W + px) * 4;
      d[i] = Math.min(255, r);
      d[i + 1] = Math.min(255, g);
      d[i + 2] = Math.min(255, b);
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

// ─── Water Waves ──────────────────────────────────────────────────────────────

function renderWaterWaves(ctx: CanvasRenderingContext2D, hm: Float32Array, seed: number): void {
  ctx.save();
  for (let gy = 0; gy < HM_H; gy++) {
    for (let gx = 0; gx < HM_W; gx++) {
      if (hm[gy * HM_W + gx] >= 0.37) continue;
      if (seededRand(gy * HM_W + gx, seed + 33333) > 0.12) continue;
      const px = (gx / HM_W) * W + seededRand(gx * 97 + gy, seed + 44444) * 6;
      const py = (gy / HM_H) * H + seededRand(gx + gy * 97, seed + 55555) * 4;
      ctx.beginPath();
      ctx.arc(px, py, 3 + seededRand(gx + gy * 11, seed) * 2, 0, Math.PI, true);
      ctx.strokeStyle = "rgba(255,255,255,0.11)";
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ─── Rivers ───────────────────────────────────────────────────────────────────

function generateRivers(hm: Float32Array, seed: number): RiverPoint[][] {
  const count = 4 + Math.floor(seededRand(seed, 77777) * 4);
  const candidates: Array<{ gx: number; gy: number }> = [];
  for (let gy = 8; gy < HM_H - 8; gy += 3)
    for (let gx = 8; gx < HM_W - 8; gx += 3)
      if (hm[gy * HM_W + gx] > 0.72) candidates.push({ gx, gy });

  candidates.sort((a, b) => seededRand(a.gx * 100 + a.gy, seed + 88888) - seededRand(b.gx * 100 + b.gy, seed + 88888));

  const rivers: RiverPoint[][] = [];
  for (let ri = 0; ri < Math.min(count, candidates.length); ri++) {
    const src = candidates[ri];
    if (rivers.some(r => Math.abs(r[0].gx - src.gx) < 18 && Math.abs(r[0].gy - src.gy) < 18)) continue;

    const path: RiverPoint[] = [src];
    const visited = new Set([`${src.gx},${src.gy}`]);
    let { gx, gy } = src;

    for (let step = 0; step < 300; step++) {
      if (hm[gy * HM_W + gx] < 0.37) break;
      if (gx <= 0 || gx >= HM_W - 1 || gy <= 0 || gy >= HM_H - 1) break;
      const dirs = [[gx-1,gy],[gx+1,gy],[gx,gy-1],[gx,gy+1],[gx-1,gy-1],[gx+1,gy-1],[gx-1,gy+1],[gx+1,gy+1]];
      let bestH = hm[gy * HM_W + gx], bx = 0, by = 0;
      for (const [nx, ny] of dirs) {
        if (nx < 0 || nx >= HM_W || ny < 0 || ny >= HM_H) continue;
        if (visited.has(`${nx},${ny}`)) continue;
        const nh = hm[ny * HM_W + nx];
        if (nh < bestH) { bestH = nh; bx = nx - gx; by = ny - gy; }
      }
      if (bx === 0 && by === 0) {
        for (const [nx, ny] of dirs) {
          if (nx < 0 || nx >= HM_W || ny < 0 || ny >= HM_H) continue;
          if (!visited.has(`${nx},${ny}`)) { bx = nx - gx; by = ny - gy; break; }
        }
      }
      if (bx === 0 && by === 0) break;
      gx += bx; gy += by;
      visited.add(`${gx},${gy}`);
      path.push({ gx, gy });
    }

    if (path.length > 8) rivers.push(path);
  }
  return rivers;
}

function renderRivers(ctx: CanvasRenderingContext2D, rivers: RiverPoint[][]): void {
  ctx.save();
  for (const river of rivers) {
    if (river.length < 2) continue;
    const pts = river.map(p => ({ x: (p.gx / HM_W) * W, y: (p.gy / HM_H) * H }));

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i+1].x) / 2, my = (pts[i].y + pts[i+1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);

    const g = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[pts.length-1].x, pts[pts.length-1].y);
    g.addColorStop(0, "rgba(100,140,170,0.65)");
    g.addColorStop(1, "rgba(82,116,140,0.88)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 4.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // shimmer
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i+1].x) / 2, my = (pts[i].y + pts[i+1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.strokeStyle = "rgba(200,225,240,0.22)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Forest ───────────────────────────────────────────────────────────────────

function drawTree(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(72,95,48,0.78)";
  ctx.fill();
  const spokes = 5 + Math.floor(size * 0.22);
  ctx.strokeStyle = "rgba(40,30,15,0.65)";
  ctx.lineWidth = 0.75;
  for (let s = 0; s < spokes; s++) {
    const a = (s / spokes) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * size * 0.1, cy + Math.sin(a) * size * 0.1);
    ctx.lineTo(cx + Math.cos(a) * size * 0.42, cy + Math.sin(a) * size * 0.42);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(35,25,12,0.55)";
  ctx.lineWidth = 0.65;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.42);
  ctx.lineTo(cx, cy + size * 0.72);
  ctx.strokeStyle = "rgba(80,58,32,0.8)";
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.restore();
}

function drawBush(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, seed: number, idx: number): void {
  ctx.save();
  const rv = (seededRand(idx, seed + 33500) * 14) | 0;
  const outlineColor = "rgba(28,48,16,0.55)";
  ctx.strokeStyle = outlineColor; ctx.lineWidth = 0.55;
  // 2-3 overlapping lobes
  for (let l = 0; l < 3; l++) {
    const la = (l / 3) * Math.PI * 2 + seededRand(idx * 3 + l, seed + 33501) * 1.2;
    const ld = r * (0.22 + seededRand(idx * 3 + l, seed + 33502) * 0.18);
    const lr = r * (0.62 + seededRand(idx * 3 + l, seed + 33503) * 0.28);
    const lv = (seededRand(idx * 3 + l, seed + 33504) * 12) | 0;
    ctx.fillStyle = `rgba(${52+rv+lv},${84+rv+lv},${36+rv+lv},0.80)`;
    ctx.beginPath(); ctx.arc(cx + Math.cos(la) * ld, cy + Math.sin(la) * ld, lr, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function placeForests(hm: Float32Array, am: Float32Array, seed: number): ForestCluster[] {
  const clusters: ForestCluster[] = [];
  const occ = new Set<string>();
  for (let gy = 2; gy < HM_H - 2; gy++) {
    for (let gx = 2; gx < HM_W - 2; gx++) {
      const h = hm[gy * HM_W + gx];
      if (h < 0.54 || h > 0.73 || am[gy * HM_W + gx] > 0.60) continue;
      if (seededRand(gy * HM_W + gx + 1, seed + 11111) > 0.17) continue;
      let clear = true;
      for (let dy = -3; dy <= 3 && clear; dy++)
        for (let dx = -3; dx <= 3 && clear; dx++)
          if (occ.has(`${gx+dx},${gy+dy}`)) clear = false;
      if (!clear) continue;
      occ.add(`${gx},${gy}`);
      clusters.push({ cx: (gx / HM_W) * W, cy: (gy / HM_H) * H });
    }
  }
  return clusters;
}

function renderForests(ctx: CanvasRenderingContext2D, clusters: ForestCluster[], seed: number): void {
  for (let i = 0; i < clusters.length; i++) {
    const { cx, cy } = clusters[i];
    const n = 3 + Math.floor(seededRand(i, seed + 22222) * 4);
    for (let t = 0; t < n; t++) {
      const a = seededRand(i * 10 + t, seed + 33333) * Math.PI * 2;
      const d = seededRand(i * 10 + t + 100, seed + 44444) * 13;
      drawTree(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 5 + seededRand(i * 10 + t + 200, seed + 55555) * 4);
    }
  }
}

// ─── Rock Texture ─────────────────────────────────────────────────────────────
// Mountains are expressed through terrain colour bands (highland → rocky →
// high peaks → snow already in BANDS[]). This adds fine stippling for cells
// above h > 0.76 to reinforce the stony texture without any geometric shapes.

function renderRockTexture(ctx: CanvasRenderingContext2D, hm: Float32Array, seed: number): void {
  ctx.save();
  for (let gy = 1; gy < HM_H - 1; gy++) {
    for (let gx = 1; gx < HM_W - 1; gx++) {
      const h = hm[gy * HM_W + gx];
      if (h < 0.76) continue;
      if (seededRand(gy * HM_W + gx, seed + 11122) > 0.18) continue;
      const px = (gx / HM_W) * W;
      const py = (gy / HM_H) * H;
      const opacity = Math.min(0.26, 0.06 + (h - 0.76) * 0.65);
      ctx.fillStyle = `rgba(58,48,36,${opacity.toFixed(2)})`;
      const r = 0.6 + seededRand(gx * 17 + gy, seed + 22244) * 1.5;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ─── Snow Caps ────────────────────────────────────────────────────────────────

function renderSnow(ctx: CanvasRenderingContext2D, hm: Float32Array, seed: number): void {
  ctx.save();
  for (let gy = 1; gy < HM_H - 1; gy++) {
    for (let gx = 1; gx < HM_W - 1; gx++) {
      const h = hm[gy * HM_W + gx];
      if (h < 0.86) continue;
      if (seededRand(gy * HM_W + gx, seed + 55566) > 0.28) continue;
      const px = (gx / HM_W) * W;
      const py = (gy / HM_H) * H;
      const opacity = Math.min(0.92, 0.28 + (h - 0.86) * 5.8);
      const r = 0.7 + seededRand(gx * 13 + gy, seed + 66677) * 2.8;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248,246,244,${opacity.toFixed(2)})`;
      ctx.fill();
    }
  }
  ctx.restore();
}

// ─── Civ Terrain ──────────────────────────────────────────────────────────────

// Flat grass terrain for civilisation mode (no mountains, no deep ocean)
function renderCivTerrain(ctx: CanvasRenderingContext2D, seed: number, size: CivSize): void {
  const gn = makeNoise(seed + 44321);
  const dn = makeNoise(seed + 55432);
  const img = ctx.createImageData(W, H);
  const d = img.data;
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const nx = px / W, ny = py / H;
      const gv = fbm(gn, nx * 9, ny * 9, 4);
      let r = (122 + gv * 44) | 0;
      let g = (148 + gv * 42) | 0;
      let b = (58 + gv * 24) | 0;
      // Dirt variation on all civ sizes (more pronounced in village)
      const dv = fbm(dn, nx * 5, ny * 5, 3);
      const dirtBase = size === "village" ? 0.62 : 0.66;
      const dirtRange = size === "village" ? 0.18 : 0.22;
      if (dv > dirtBase) {
        const t = Math.min(1, (dv - dirtBase) / dirtRange);
        r = (r + t * (178 - r)) | 0;
        g = (g + t * (152 - g)) | 0;
        b = (b + t * (96 - b)) | 0;
      }
      const i = (py * W + px) * 4;
      d[i] = Math.min(255, r); d[i+1] = Math.min(255, g); d[i+2] = Math.min(255, b); d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function renderPond(ctx: CanvasRenderingContext2D, seed: number): { cx: number; cy: number; rx: number; ry: number } {
  const pcx = (0.12 + seededRand(760, seed) * 0.76) * W;
  const pcy = (0.12 + seededRand(761, seed) * 0.76) * H;
  const rx = 28 + seededRand(762, seed) * 44;
  const ry = 22 + seededRand(763, seed) * 35;
  const angle = seededRand(764, seed) * Math.PI;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(pcx, pcy, rx, ry, angle, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(68,108,148,0.82)"; ctx.fill();
  ctx.strokeStyle = "rgba(50,82,118,0.70)"; ctx.lineWidth = 1.8; ctx.stroke();
  for (let w = 0; w < 5; w++) {
    const wa = seededRand(w + 770, seed) * Math.PI * 2;
    const wd = seededRand(w + 771, seed) * rx * 0.65;
    ctx.beginPath();
    ctx.arc(pcx + Math.cos(wa)*wd, pcy + Math.sin(wa)*wd*(ry/rx), 3 + seededRand(w+772,seed)*5, 0, Math.PI, true);
    ctx.strokeStyle = "rgba(190,215,235,0.22)"; ctx.lineWidth = 0.8; ctx.stroke();
  }
  ctx.restore();
  return { cx: pcx, cy: pcy, rx, ry };
}

// ─── Desert Dunes ─────────────────────────────────────────────────────────────

function renderDesertTexture(ctx: CanvasRenderingContext2D, hm: Float32Array, am: Float32Array, seed: number): void {
  ctx.save();
  for (let gy = 1; gy < HM_H - 1; gy += 2) {
    for (let gx = 1; gx < HM_W - 1; gx += 2) {
      const h = hm[gy * HM_W + gx], arid = am[gy * HM_W + gx];
      if (!(arid > 0.62 && h > 0.41 && h < 0.58)) continue;
      if (seededRand(gy * HM_W + gx, seed + 77777) > 0.22) continue;
      const px = (gx / HM_W) * W, py = (gy / HM_H) * H;
      const a = seededRand(gx + gy * 17, seed + 88888) * 0.6;
      ctx.beginPath();
      ctx.arc(px, py, 5 + seededRand(gx * 13 + gy, seed + 99999) * 8, Math.PI + a, Math.PI * 2 - a, false);
      ctx.strokeStyle = "rgba(175,150,78,0.32)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ─── Location Icons ───────────────────────────────────────────────────────────

function drawCityIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.fillStyle = "rgba(88,68,44,0.92)";
  ctx.strokeStyle = "rgba(28,18,8,0.9)";
  ctx.lineWidth = 1.2;

  // Central keep
  ctx.fillRect(cx - 14, cy - 22, 28, 22);
  ctx.strokeRect(cx - 14, cy - 22, 28, 22);
  // Crenellations
  for (let c = 0; c < 4; c++) {
    if (c % 2 === 0) { ctx.fillRect(cx - 14 + c * 7, cy - 27, 7, 5); }
  }
  // Side towers
  ctx.fillRect(cx - 22, cy - 16, 9, 16); ctx.strokeRect(cx - 22, cy - 16, 9, 16);
  ctx.fillRect(cx + 13, cy - 16, 9, 16); ctx.strokeRect(cx + 13, cy - 16, 9, 16);
  // Gate arch
  ctx.beginPath();
  ctx.arc(cx, cy - 5, 5, Math.PI, 0);
  ctx.fillStyle = "rgba(45,32,18,0.9)"; ctx.fill();

  ctx.restore();
}

function drawTownIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.fillStyle = "rgba(162,138,102,0.92)";
  ctx.strokeStyle = "rgba(38,28,12,0.85)";
  ctx.lineWidth = 1.0;
  ctx.fillRect(cx - 10, cy - 10, 20, 10); ctx.strokeRect(cx - 10, cy - 10, 20, 10);
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy - 10); ctx.lineTo(cx, cy - 21); ctx.lineTo(cx + 12, cy - 10); ctx.closePath();
  ctx.fillStyle = "rgba(115,88,58,0.9)"; ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(45,32,18,0.7)"; ctx.fillRect(cx - 2.5, cy - 9, 5, 4);
  ctx.restore();
}

// ─── Town Icons ───────────────────────────────────────────────────────────────

function drawTownCastleIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.fillStyle = "rgba(78,58,38,0.92)";
  ctx.strokeStyle = "rgba(28,18,8,0.9)";
  ctx.lineWidth = 0.85;
  ctx.fillRect(cx - 11, cy - 16, 22, 16); ctx.strokeRect(cx - 11, cy - 16, 22, 16);
  for (let c = 0; c < 6; c++) { if (c % 2 === 0) ctx.fillRect(cx - 11 + c * 3.7, cy - 19, 3.7, 3); }
  ctx.fillRect(cx - 16, cy - 13, 6, 13); ctx.strokeRect(cx - 16, cy - 13, 6, 13);
  ctx.fillRect(cx + 10, cy - 13, 6, 13); ctx.strokeRect(cx + 10, cy - 13, 6, 13);
  ctx.beginPath(); ctx.arc(cx, cy - 4, 3.5, Math.PI, 0); ctx.fillStyle = "rgba(40,28,14,0.9)"; ctx.fill();
  ctx.restore();
}

function drawInnIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(35,25,12,0.88)"; ctx.lineWidth = 0.85;
  // Bed frame
  ctx.fillStyle = "rgba(118,85,52,0.95)";
  ctx.fillRect(cx - 9, cy - 13, 18, 26); ctx.strokeRect(cx - 9, cy - 13, 18, 26);
  // Mattress
  ctx.fillStyle = "rgba(225,212,185,0.95)";
  ctx.fillRect(cx - 7, cy - 11, 14, 21); ctx.strokeRect(cx - 7, cy - 11, 14, 21);
  // Blanket (lower portion)
  ctx.fillStyle = "rgba(178,140,98,0.88)";
  ctx.fillRect(cx - 7, cy - 3, 14, 13); ctx.strokeRect(cx - 7, cy - 3, 14, 13);
  // Blanket fold
  ctx.beginPath(); ctx.moveTo(cx - 7, cy - 3); ctx.lineTo(cx + 7, cy - 3);
  ctx.strokeStyle = "rgba(35,25,12,0.30)"; ctx.lineWidth = 0.6; ctx.stroke();
  // Two pillows side by side
  ctx.strokeStyle = "rgba(35,25,12,0.60)"; ctx.lineWidth = 0.7;
  ctx.fillStyle = "rgba(245,235,215,0.96)";
  ctx.fillRect(cx - 7, cy - 11, 6, 6); ctx.strokeRect(cx - 7, cy - 11, 6, 6);
  ctx.fillRect(cx + 1, cy - 11, 6, 6); ctx.strokeRect(cx + 1, cy - 11, 6, 6);
  // Headboard (darker bar at top)
  ctx.fillStyle = "rgba(85,58,32,0.96)";
  ctx.fillRect(cx - 9, cy - 13, 18, 3);
  ctx.restore();
}

function drawTavernIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(38,28,14,0.82)"; ctx.lineWidth = 0.85;
  // Pint glass — wider at top, narrower at base
  ctx.beginPath();
  ctx.moveTo(cx - 5.5, cy - 10); ctx.lineTo(cx + 5.5, cy - 10); // top rim
  ctx.lineTo(cx + 4, cy + 4);   ctx.lineTo(cx - 4, cy + 4);   // base
  ctx.closePath();
  // Beer fill (amber)
  ctx.fillStyle = "rgba(195,148,38,0.88)"; ctx.fill(); ctx.stroke();
  // Foam at top
  ctx.fillStyle = "rgba(242,238,225,0.95)";
  ctx.fillRect(cx - 5.5, cy - 10, 11, 3.5); ctx.strokeRect(cx - 5.5, cy - 10, 11, 3.5);
  // Handle
  ctx.beginPath();
  ctx.arc(cx + 7, cy - 5, 3, -Math.PI*0.5, Math.PI*0.5);
  ctx.strokeStyle = "rgba(38,28,14,0.82)"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
}

function drawMerchantIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(38,28,14,0.82)"; ctx.lineWidth = 0.85;
  // Shop awning — triangular canopy
  ctx.beginPath();
  ctx.moveTo(cx - 11, cy - 4);
  ctx.lineTo(cx + 11, cy - 4);
  ctx.lineTo(cx + 9, cy + 1);
  ctx.lineTo(cx - 9, cy + 1);
  ctx.closePath();
  ctx.fillStyle = "rgba(188,55,38,0.88)"; ctx.fill(); ctx.stroke();
  // Awning scalloped edge
  ctx.fillStyle = "rgba(165,42,28,0.88)";
  for (let xi = -9; xi <= 9; xi += 6) {
    ctx.beginPath(); ctx.arc(cx + xi, cy + 1, 3, 0, Math.PI); ctx.fill();
  }
  // Shop counter / table
  ctx.fillStyle = "rgba(178,148,98,0.92)";
  ctx.fillRect(cx - 9, cy + 1, 18, 6); ctx.strokeRect(cx - 9, cy + 1, 18, 6);
  // Items on counter: 3 small circles (goods)
  ctx.fillStyle = "rgba(215,188,112,0.90)";
  for (let xi = -5; xi <= 5; xi += 5) {
    ctx.beginPath(); ctx.arc(cx + xi, cy + 4, 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // Sign hanging above awning
  ctx.fillStyle = "rgba(205,175,118,0.92)";
  ctx.fillRect(cx - 5, cy - 12, 10, 7); ctx.strokeRect(cx - 5, cy - 12, 10, 7);
  ctx.strokeStyle = "rgba(80,55,25,0.55)"; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(cx - 2, cy - 9); ctx.lineTo(cx + 2, cy - 9);
  ctx.moveTo(cx - 3, cy - 7); ctx.lineTo(cx + 3, cy - 7);
  ctx.stroke();
  ctx.restore();
}

function drawChurchIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(38,28,14,0.85)"; ctx.lineWidth = 0.85;
  // Bell body — rounded top, flared bottom
  ctx.beginPath();
  ctx.moveTo(cx - 2, cy - 14);
  ctx.bezierCurveTo(cx - 9, cy - 13, cx - 9, cy - 2, cx - 8, cy + 1);
  ctx.lineTo(cx + 8, cy + 1);
  ctx.bezierCurveTo(cx + 9, cy - 2, cx + 9, cy - 13, cx + 2, cy - 14);
  ctx.closePath();
  ctx.fillStyle = "rgba(198,172,82,0.95)"; ctx.fill(); ctx.stroke();
  // Clapper
  ctx.beginPath(); ctx.arc(cx, cy + 2, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(80,60,30,0.92)"; ctx.fill(); ctx.stroke();
  // Hanging bracket at top
  ctx.beginPath(); ctx.moveTo(cx - 3, cy - 14); ctx.lineTo(cx + 3, cy - 14);
  ctx.moveTo(cx, cy - 14); ctx.lineTo(cx, cy - 17);
  ctx.strokeStyle = "rgba(80,60,30,0.88)"; ctx.lineWidth = 1.5; ctx.stroke();
  // Shine
  ctx.beginPath(); ctx.moveTo(cx - 6, cy - 10); ctx.lineTo(cx - 5, cy - 5);
  ctx.strokeStyle = "rgba(255,240,180,0.35)"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
}

function drawBlacksmithIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.fillStyle = "rgba(85,78,68,0.92)";
  ctx.strokeStyle = "rgba(28,18,8,0.85)"; ctx.lineWidth = 0.85;
  // Hammer head (horizontal, at top)
  ctx.fillRect(cx - 7, cy - 12, 14, 6); ctx.strokeRect(cx - 7, cy - 12, 14, 6);
  // Handle (vertical, angled slightly)
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(0.18);
  ctx.fillStyle = "rgba(130,98,58,0.92)";
  ctx.fillRect(-1.8, -6, 3.6, 14); ctx.strokeRect(-1.8, -6, 3.6, 14);
  ctx.restore();
  ctx.restore();
}


function drawPotionIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(28,18,8,0.85)"; ctx.lineWidth = 0.85;
  // Bottle body (round)
  ctx.beginPath(); ctx.arc(cx, cy - 1, 6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(138,48,188,0.82)"; ctx.fill(); ctx.stroke();
  // Neck
  ctx.fillStyle = "rgba(118,38,158,0.88)";
  ctx.fillRect(cx - 2.2, cy - 11, 4.4, 6); ctx.strokeRect(cx - 2.2, cy - 11, 4.4, 6);
  // Cork
  ctx.fillStyle = "rgba(162,118,72,0.92)";
  ctx.fillRect(cx - 2.8, cy - 14, 5.6, 3.5); ctx.strokeRect(cx - 2.8, cy - 14, 5.6, 3.5);
  // Shine on bottle
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath(); ctx.arc(cx - 2, cy - 3, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawSwordIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(28,18,8,0.85)"; ctx.lineWidth = 0.85;
  // Blade (vertical)
  ctx.fillStyle = "rgba(188,192,198,0.92)";
  ctx.fillRect(cx - 1.5, cy - 13, 3, 16); ctx.strokeRect(cx - 1.5, cy - 13, 3, 16);
  // Guard (horizontal crosspiece)
  ctx.fillStyle = "rgba(155,135,80,0.92)";
  ctx.fillRect(cx - 7, cy + 2, 14, 2.5); ctx.strokeRect(cx - 7, cy + 2, 14, 2.5);
  // Handle
  ctx.fillStyle = "rgba(118,82,42,0.92)";
  ctx.fillRect(cx - 1.8, cy + 4, 3.6, 6); ctx.strokeRect(cx - 1.8, cy + 4, 3.6, 6);
  // Pommel
  ctx.beginPath(); ctx.arc(cx, cy + 10, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(155,135,80,0.92)"; ctx.fill(); ctx.stroke();
  // Blade tip
  ctx.beginPath(); ctx.moveTo(cx - 1.5, cy - 13); ctx.lineTo(cx, cy - 17); ctx.lineTo(cx + 1.5, cy - 13);
  ctx.fillStyle = "rgba(188,192,198,0.92)"; ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawDockIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(38,28,14,0.82)"; ctx.lineWidth = 0.78;
  ctx.fillStyle = "rgba(72,110,148,0.78)";
  ctx.fillRect(cx - 11, cy - 3, 22, 9);
  ctx.fillStyle = "rgba(148,118,80,0.92)";
  ctx.fillRect(cx - 9, cy - 10, 18, 8); ctx.strokeRect(cx - 9, cy - 10, 18, 8);
  ctx.strokeStyle = "rgba(55,38,18,0.30)"; ctx.lineWidth = 0.5;
  for (let pl = 0; pl < 4; pl++) {
    ctx.beginPath(); ctx.moveTo(cx - 9 + pl * 6, cy - 10);
    ctx.lineTo(cx - 9 + pl * 6, cy - 2); ctx.stroke();
  }
  ctx.fillStyle = "rgba(105,80,52,0.88)";
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 3); ctx.quadraticCurveTo(cx, cy + 7, cx + 8, cy + 3);
  ctx.quadraticCurveTo(cx + 8, cy - 1, cx, cy - 2);
  ctx.quadraticCurveTo(cx - 8, cy - 1, cx - 8, cy + 3);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(38,28,14,0.82)"; ctx.lineWidth = 0.78; ctx.stroke();
  ctx.restore();
}

// ─── Landscape Location Placement ─────────────────────────────────────────────

function placeLandscapeLocations(hm: Float32Array, rivers: RiverPoint[][], seed: number): LandscapeLocation[] {
  const locs: LandscapeLocation[] = [];
  const citiesN = 2 + Math.floor(seededRand(seed, 123) * 3);
  const townsN = 5 + Math.floor(seededRand(seed, 456) * 5);
  const riverSet = new Set(rivers.flatMap(r => r.map(p => `${p.gx},${p.gy}`)));

  const scored: Array<{ gx: number; gy: number; score: number }> = [];
  for (let gy = 5; gy < HM_H - 5; gy += 2) {
    for (let gx = 5; gx < HM_W - 5; gx += 2) {
      const h = hm[gy * HM_W + gx];
      if (h < 0.40 || h > 0.60) continue;
      let s = seededRand(gx * 1000 + gy, seed + 9999);
      if (h < 0.48) s += 2;
      for (let d = -3; d <= 3; d++) for (let e = -3; e <= 3; e++) if (riverSet.has(`${gx+d},${gy+e}`)) { s += 3; break; }
      scored.push({ gx, gy, score: s });
    }
  }
  scored.sort((a, b) => b.score - a.score);

  for (const c of scored) {
    if (locs.filter(l => l.type === "city").length >= citiesN) break;
    const px = (c.gx / HM_W) * W, py = (c.gy / HM_H) * H;
    if (locs.some(l => Math.hypot(px - l.cx, py - l.cy) < W * 0.15)) continue;
    locs.push({ type: "city", cx: px, cy: py });
  }

  const tc: Array<{gx:number;gy:number}> = [];
  for (let gy = 5; gy < HM_H - 5; gy += 3)
    for (let gx = 5; gx < HM_W - 5; gx += 3) {
      const h = hm[gy * HM_W + gx];
      if (h >= 0.41 && h <= 0.76) tc.push({ gx, gy });
    }
  tc.sort((a, b) => seededRand(a.gx * 500 + a.gy, seed + 8888) - seededRand(b.gx * 500 + b.gy, seed + 8888));
  for (const c of tc) {
    if (locs.filter(l => l.type === "town").length >= townsN) break;
    const px = (c.gx / HM_W) * W, py = (c.gy / HM_H) * H;
    if (locs.some(l => Math.hypot(px - l.cx, py - l.cy) < 45)) continue;
    locs.push({ type: "town", cx: px, cy: py });
  }
  return locs;
}

// ─── Compass Rose ─────────────────────────────────────────────────────────────

function drawCompassRose(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  const diags = [-Math.PI/4, Math.PI/4, 3*Math.PI/4, -3*Math.PI/4];
  ctx.fillStyle = "rgba(82,65,40,0.7)";
  for (const a of diags) {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * size * 0.55, cy + Math.sin(a) * size * 0.55);
    ctx.lineTo(cx + Math.cos(a + 0.28) * size * 0.12, cy + Math.sin(a + 0.28) * size * 0.12);
    ctx.lineTo(cx + Math.cos(a - 0.28) * size * 0.12, cy + Math.sin(a - 0.28) * size * 0.12);
    ctx.closePath(); ctx.fill();
  }
  const mains = [{ a: -Math.PI/2, s: 1.0 }, { a: 0, s: 0.75 }, { a: Math.PI/2, s: 0.75 }, { a: Math.PI, s: 0.75 }];
  const wx = size * 0.18;
  for (const { a, s } of mains) {
    const len = size * s;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
    ctx.lineTo(cx + Math.cos(a + Math.PI/2) * wx, cy + Math.sin(a + Math.PI/2) * wx);
    ctx.lineTo(cx, cy); ctx.closePath();
    ctx.fillStyle = "rgba(228,216,192,0.95)"; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
    ctx.lineTo(cx + Math.cos(a - Math.PI/2) * wx, cy + Math.sin(a - Math.PI/2) * wx);
    ctx.lineTo(cx, cy); ctx.closePath();
    ctx.fillStyle = "rgba(72,56,35,0.9)"; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
    ctx.lineTo(cx + Math.cos(a + Math.PI/2) * wx, cy + Math.sin(a + Math.PI/2) * wx);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a - Math.PI/2) * wx, cy + Math.sin(a - Math.PI/2) * wx);
    ctx.closePath();
    ctx.strokeStyle = "rgba(32,22,10,0.8)"; ctx.lineWidth = 0.8; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(228,216,192,0.95)"; ctx.fill();
  ctx.strokeStyle = "rgba(32,22,10,0.8)"; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.font = `bold ${size * 0.4}px 'Cinzel', serif`;
  ctx.fillStyle = "rgba(32,22,10,0.9)";
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.fillText("N", cx, cy - size * 1.12);
  ctx.restore();
}

// ─── Border ───────────────────────────────────────────────────────────────────

function drawBorder(ctx: CanvasRenderingContext2D, seed: number): void {
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(38,26,12,0.92)"; ctx.lineWidth = 2.5;
  ctx.strokeRect(3, 3, W - 6, H - 6);
  ctx.strokeStyle = "rgba(38,26,12,0.55)"; ctx.lineWidth = 0.75;
  ctx.strokeRect(13, 13, W - 26, H - 26);
  ctx.fillStyle = "rgba(38,26,12,0.72)";
  for (const [cx, cy] of [[13,13],[W-13,13],[W-13,H-13],[13,H-13]] as [number,number][]) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5, -5, 10, 10); ctx.restore();
  }
  // Worn corner scratches
  ctx.strokeStyle = "rgba(38,26,12,0.22)"; ctx.lineWidth = 0.5;
  for (let i = 0; i < 40; i++) {
    const t = seededRand(i, seed + 121212);
    const side = Math.floor(t * 4);
    let x1: number, y1: number, x2: number, y2: number;
    if (side === 0) { x1 = seededRand(i+100,seed)*W; y1 = 3; x2 = x1 + seededRand(i+200,seed)*8-4; y2 = 3 + seededRand(i+300,seed)*5; }
    else if (side === 1) { x1 = seededRand(i+100,seed)*W; y1 = H-3; x2 = x1+seededRand(i+200,seed)*8-4; y2 = H-3-seededRand(i+300,seed)*5; }
    else if (side === 2) { x1 = 3; y1 = seededRand(i+100,seed)*H; x2 = 3+seededRand(i+200,seed)*5; y2 = y1+seededRand(i+300,seed)*8-4; }
    else { x1 = W-3; y1 = seededRand(i+100,seed)*H; x2 = W-3-seededRand(i+200,seed)*5; y2 = y1+seededRand(i+300,seed)*8-4; }
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }
  ctx.restore();
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function drawLegend(ctx: CanvasRenderingContext2D, mode: "landscape" | "civilisation"): void {
  ctx.save();

  if (mode === "landscape") {
    const iconEntries: Array<{ label: string; draw: (x: number, y: number) => void }> = [
      { label: "City",  draw: (x, y) => drawCityIcon(ctx, x, y) },
      { label: "Town",  draw: (x, y) => drawTownIcon(ctx, x, y) },
    ];
    const swatches = [
      { color: "rgb(58,84,108)",   label: "Deep sea" },
      { color: "rgb(85,120,145)",  label: "Coastal water" },
      { color: "rgb(198,182,140)", label: "Shore / beach" },
      { color: "rgb(135,152,92)",  label: "Lowland grass" },
      { color: "rgb(90,120,62)",   label: "Forest" },
      { color: "rgb(148,138,118)", label: "Highland" },
      { color: "rgb(182,174,162)", label: "Stone / rock" },
      { color: "rgb(218,212,205)", label: "High peaks" },
      { color: "rgb(242,240,238)", label: "Snow" },
      { color: "rgb(210,188,122)", label: "Desert sand" },
    ];
    const sw = 14, rh = 16, pad = 7, lw = 148, iconRowH = 22;
    const lh = iconEntries.length * iconRowH + swatches.length * rh + pad * 2 + 20;
    const lx = W - lw - 20, ly = 20;
    ctx.fillStyle = "rgba(228,210,175,0.90)";
    roundRect(ctx, lx, ly, lw, lh, 4); ctx.fill();
    ctx.strokeStyle = "rgba(55,38,18,0.50)"; ctx.lineWidth = 0.8;
    roundRect(ctx, lx, ly, lw, lh, 4); ctx.stroke();
    ctx.font = "bold 8.5px 'Cinzel', serif";
    ctx.fillStyle = "rgba(50,32,12,0.90)";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("LEGEND", lx + lw / 2, ly + pad);
    ctx.beginPath(); ctx.moveTo(lx + 5, ly + pad + 12); ctx.lineTo(lx + lw - 5, ly + pad + 12);
    ctx.strokeStyle = "rgba(55,38,18,0.28)"; ctx.lineWidth = 0.6; ctx.stroke();
    // Icon rows (city + town)
    for (let i = 0; i < iconEntries.length; i++) {
      const rowY = ly + pad + 14 + i * iconRowH + iconRowH / 2;
      iconEntries[i].draw(lx + 18, rowY);
      ctx.font = "9px 'Cinzel', serif";
      ctx.fillStyle = "rgba(32,20,6,0.88)";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(iconEntries[i].label, lx + pad + 24, rowY - 1);
    }
    const divY = ly + pad + 14 + iconEntries.length * iconRowH + 2;
    ctx.beginPath(); ctx.moveTo(lx + 5, divY); ctx.lineTo(lx + lw - 5, divY);
    ctx.strokeStyle = "rgba(55,38,18,0.20)"; ctx.lineWidth = 0.6; ctx.stroke();
    // Terrain swatches
    for (let i = 0; i < swatches.length; i++) {
      const ey = divY + 3 + i * rh;
      ctx.fillStyle = swatches[i].color;
      ctx.fillRect(lx + pad, ey + 2, sw, rh - 5);
      ctx.strokeStyle = "rgba(40,26,10,0.35)"; ctx.lineWidth = 0.5;
      ctx.strokeRect(lx + pad, ey + 2, sw, rh - 5);
      ctx.fillStyle = "rgba(32,20,6,0.88)";
      ctx.font = "8px 'Cinzel', serif";
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText(swatches[i].label, lx + pad + sw + 5, ey + 3);
    }
  } else {
    // Icon legend for civilisation mode
    const iconItems: Array<{ label: string; draw: (x: number, y: number) => void }> = [
      { label: "Castle",     draw: (x, y) => drawTownCastleIcon(ctx, x, y) },
      { label: "Inn",        draw: (x, y) => drawInnIcon(ctx, x, y) },
      { label: "Tavern",     draw: (x, y) => drawTavernIcon(ctx, x, y) },
      { label: "Church",     draw: (x, y) => drawChurchIcon(ctx, x, y) },
      { label: "Blacksmith", draw: (x, y) => drawBlacksmithIcon(ctx, x, y) },
      { label: "Armoury",    draw: (x, y) => drawSwordIcon(ctx, x, y) },
      { label: "Potions",    draw: (x, y) => drawPotionIcon(ctx, x, y) },
      { label: "Merchant",   draw: (x, y) => drawMerchantIcon(ctx, x, y) },
      { label: "Dock",       draw: (x, y) => drawDockIcon(ctx, x, y) },
    ];
    const rowH = 26, lw = 134;
    const lh = iconItems.length * rowH + 20;
    const lx = W - lw - 20, ly = 20;
    ctx.fillStyle = "rgba(228,210,175,0.90)";
    roundRect(ctx, lx, ly, lw, lh, 4); ctx.fill();
    ctx.strokeStyle = "rgba(55,38,18,0.50)"; ctx.lineWidth = 0.8;
    roundRect(ctx, lx, ly, lw, lh, 4); ctx.stroke();
    ctx.font = "bold 9px 'Cinzel', serif";
    ctx.fillStyle = "rgba(55,38,18,0.88)";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("LEGEND", lx + lw / 2, ly + 5);
    ctx.beginPath(); ctx.moveTo(lx + 6, ly + 16); ctx.lineTo(lx + lw - 6, ly + 16);
    ctx.strokeStyle = "rgba(55,38,18,0.30)"; ctx.lineWidth = 0.6; ctx.stroke();
    for (let i = 0; i < iconItems.length; i++) {
      const rowY = ly + 18 + i * rowH + rowH / 2;
      iconItems[i].draw(lx + 20, rowY);
      ctx.font = "10px 'Cinzel', serif";
      ctx.fillStyle = "rgba(45,30,12,0.92)";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(iconItems[i].label, lx + 38, rowY - 2);
    }
  }
  ctx.restore();
}

// ─── Tattered Edges ───────────────────────────────────────────────────────────

function drawTatteredEdges(ctx: CanvasRenderingContext2D, seed: number): void {
  ctx.save();
  const edges = [
    { horiz: true, fixedStart: true, fixedVal: 0, len: W },
    { horiz: true, fixedStart: false, fixedVal: H, len: W },
    { horiz: false, fixedStart: true, fixedVal: 0, len: H },
    { horiz: false, fixedStart: false, fixedVal: W, len: H },
  ];
  ctx.fillStyle = "rgba(12,7,3,0.84)";
  for (let e = 0; e < 4; e++) {
    const { horiz, fixedStart, fixedVal, len } = edges[e];
    const dir = fixedStart ? 1 : -1;
    const biteCount = 65 + Math.floor(seededRand(e * 100, seed + 11111) * 28);
    let pos = 0;
    for (let b = 0; b < biteCount && pos < len; b++) {
      const bw = 8 + seededRand(e * 1000 + b, seed + 22222) * 26;
      const depth = 5 + seededRand(e * 1000 + b + 500, seed + 33333) * 20;
      const verts = 4 + Math.floor(seededRand(e * 1000 + b + 1000, seed + 44444) * 3);
      ctx.beginPath();
      if (horiz) {
        ctx.moveTo(pos, fixedVal);
        for (let v = 0; v < verts; v++) {
          const vx = pos + (bw * v) / verts + (seededRand(e*5000+b*12+v, seed)*4-2);
          const vy = fixedVal + dir * depth * seededRand(e*5000+b*12+v+100, seed+55555);
          ctx.lineTo(vx, vy);
        }
        ctx.lineTo(pos + bw, fixedVal);
      } else {
        ctx.moveTo(fixedVal, pos);
        for (let v = 0; v < verts; v++) {
          const vy = pos + (bw * v) / verts + (seededRand(e*5000+b*12+v, seed)*4-2);
          const vx = fixedVal + dir * depth * seededRand(e*5000+b*12+v+100, seed+55555);
          ctx.lineTo(vx, vy);
        }
        ctx.lineTo(fixedVal, pos + bw);
      }
      ctx.closePath(); ctx.fill();
      pos += bw * 0.62;
    }
  }
  ctx.fillStyle = "rgba(22,13,4,0.28)";
  for (let i = 0; i < 260; i++) {
    const t = seededRand(i, seed + 66666);
    const side = Math.floor(t * 4);
    let sx = 0, sy = 0;
    if (side === 0) { sx = seededRand(i+1000,seed)*W; sy = seededRand(i+2000,seed)*32; }
    else if (side === 1) { sx = seededRand(i+3000,seed)*W; sy = H - seededRand(i+4000,seed)*32; }
    else if (side === 2) { sx = seededRand(i+5000,seed)*32; sy = seededRand(i+6000,seed)*H; }
    else { sx = W - seededRand(i+7000,seed)*32; sy = seededRand(i+8000,seed)*H; }
    const r = 0.7 + seededRand(i+9000,seed) * 2.6;
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ─── Post-Processing ──────────────────────────────────────────────────────────

function drawGrain(ctx: CanvasRenderingContext2D, seed: number): void {
  const n = 4000;
  for (let i = 0; i < n; i++) {
    const x = seededRand(i, seed + 111111) * W;
    const y = seededRand(i + n, seed + 222222) * H;
    const r = 0.5 + seededRand(i + n * 2, seed + 333333) * 1.5;
    ctx.fillStyle = `rgba(38,26,12,${0.015 + seededRand(i + n * 3, seed + 444444) * 0.03})`;
    ctx.fillRect(x, y, r, r);
  }
}

function postProcess(ctx: CanvasRenderingContext2D, seed: number): void {
  drawGrain(ctx, seed);
  ctx.fillStyle = "rgba(152,112,52,0.12)"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(228,213,175,0.08)"; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W/2, H/2, H*0.17, W/2, H/2, H*0.83);
  vg.addColorStop(0, "rgba(20,12,3,0)");
  vg.addColorStop(1, "rgba(20,12,3,0.52)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  drawTatteredEdges(ctx, seed);
}

// ─── Landscape Orchestrator ───────────────────────────────────────────────────

function renderLandscape(ctx: CanvasRenderingContext2D, seed: number, scale: MapScale = "medium"): void {
  ctx.fillStyle = "rgb(230,216,180)"; ctx.fillRect(0, 0, W, H);
  const { hm, am, sm } = buildMaps(seed, scale);
  renderTerrain(ctx, hm, am, sm);
  renderWaterWaves(ctx, hm, seed);
  const rivers = generateRivers(hm, seed);
  renderRivers(ctx, rivers);
  const forests = placeForests(hm, am, seed);
  renderForests(ctx, forests, seed);
  renderRockTexture(ctx, hm, seed);
  renderSnow(ctx, hm, seed);
  renderDesertTexture(ctx, hm, am, seed);
  const locs = placeLandscapeLocations(hm, rivers, seed);
  for (const loc of locs) {
    if (loc.type === "city") drawCityIcon(ctx, loc.cx, loc.cy);
    else drawTownIcon(ctx, loc.cx, loc.cy);
  }
  drawCompassRose(ctx, 64, H - 64, 38);
  drawBorder(ctx, seed);
  drawLegend(ctx, "landscape");
  postProcess(ctx, seed);
}

// ─── Town ─────────────────────────────────────────────────────────────────────

// ─── Cubic Bézier road system ────────────────────────────────────────────────

function cubicPoint(seg: CubicSegment, t: number): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u*u*u*seg.p0.x + 3*u*u*t*seg.cp1.x + 3*u*t*t*seg.cp2.x + t*t*t*seg.p1.x,
    y: u*u*u*seg.p0.y + 3*u*u*t*seg.cp1.y + 3*u*t*t*seg.cp2.y + t*t*t*seg.p1.y,
  };
}

function cubicTangent(seg: CubicSegment, t: number): { dx: number; dy: number } {
  const u = 1 - t;
  let dx = 3*u*u*(seg.cp1.x-seg.p0.x) + 6*u*t*(seg.cp2.x-seg.cp1.x) + 3*t*t*(seg.p1.x-seg.cp2.x);
  let dy = 3*u*u*(seg.cp1.y-seg.p0.y) + 6*u*t*(seg.cp2.y-seg.cp1.y) + 3*t*t*(seg.p1.y-seg.cp2.y);
  const len = Math.sqrt(dx*dx+dy*dy) || 1;
  dx /= len; dy /= len;
  return { dx, dy };
}

interface RoadSample { x: number; y: number; tx: number; ty: number; nx: number; ny: number; }

function sampleCivRoad(road: CivRoad, totalSteps: number): RoadSample[] {
  const result: RoadSample[] = [];
  const stepsPerSeg = Math.max(4, Math.ceil(totalSteps / road.segments.length));
  for (let si = 0; si < road.segments.length; si++) {
    const seg = road.segments[si];
    const start = si === 0 ? 0 : 1; // avoid duplicating shared midpoint
    for (let s = start; s <= stepsPerSeg; s++) {
      const t = s / stepsPerSeg;
      const { x, y } = cubicPoint(seg, t);
      const { dx: tx, dy: ty } = cubicTangent(seg, Math.min(t, 0.9999));
      result.push({ x, y, tx, ty, nx: -ty, ny: tx });
    }
  }
  return result;
}

function makeCivRoad(
  from: { x: number; y: number },
  to: { x: number; y: number },
  style: CivRoad["style"],
  width: number,
  seed: number,
  idx: number
): CivRoad {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const ddx = (to.x - from.x) / dist, ddy = (to.y - from.y) / dist;
  const perpx = -ddy, perpy = ddx;
  const maxOff = dist * ORGANIC_ROAD.curviness * 0.28;

  if (!ORGANIC_ROAD.useChainedBeziers || dist < 240) {
    // Single cubic segment — independent offsets on cp1/cp2 enable natural S-curves
    const off1 = (seededRand(idx, seed + 70001) - 0.5) * 2 * maxOff;
    const off2 = (seededRand(idx + 1, seed + 70002) - 0.5) * 2 * maxOff;
    return {
      segments: [{
        p0: from,
        cp1: { x: from.x + ddx*dist*0.33 + perpx*off1, y: from.y + ddy*dist*0.33 + perpy*off1 },
        cp2: { x: from.x + ddx*dist*0.67 + perpx*off2, y: from.y + ddy*dist*0.67 + perpy*off2 },
        p1: to,
      }],
      width, style,
    };
  }

  // Chained two-segment road for longer distances — passes through an offset midpoint
  const midOff = (seededRand(idx + 2, seed + 70003) - 0.5) * 2 * maxOff * 0.6;
  const M = { x: (from.x + to.x) / 2 + perpx * midOff, y: (from.y + to.y) / 2 + perpy * midOff };

  const d1 = Math.hypot(M.x - from.x, M.y - from.y) || 1;
  const d1x = (M.x - from.x) / d1, d1y = (M.y - from.y) / d1;
  const p1x = -d1y, p1y = d1x;
  const d2 = Math.hypot(to.x - M.x, to.y - M.y) || 1;
  const d2x = (to.x - M.x) / d2, d2y = (to.y - M.y) / d2;
  const p2x = -d2y, p2y = d2x;

  const o1 = (seededRand(idx,     seed + 70001) - 0.5) * 2 * maxOff * 0.45;
  const o2 = (seededRand(idx + 1, seed + 70002) - 0.5) * 2 * maxOff * 0.45;
  const o3 = (seededRand(idx + 3, seed + 70004) - 0.5) * 2 * maxOff * 0.45;
  const o4 = (seededRand(idx + 4, seed + 70005) - 0.5) * 2 * maxOff * 0.45;

  return {
    segments: [
      {
        p0: from,
        cp1: { x: from.x + d1x*d1*0.35 + p1x*o1, y: from.y + d1y*d1*0.35 + p1y*o1 },
        cp2: { x: M.x   - d1x*d1*0.35 + p1x*o2, y: M.y   - d1y*d1*0.35 + p1y*o2 },
        p1: M,
      },
      {
        p0: M,
        cp1: { x: M.x  + d2x*d2*0.35 + p2x*o3, y: M.y  + d2y*d2*0.35 + p2y*o3 },
        cp2: { x: to.x - d2x*d2*0.35 + p2x*o4, y: to.y - d2y*d2*0.35 + p2y*o4 },
        p1: to,
      },
    ],
    width, style,
  };
}

function generateOrganicLayout(
  seed: number,
  size: CivSize,
  hx: number,
  hy: number
): { roads: CivRoad[]; anchorPts: Array<{ x: number; y: number }> } {
  const roads: CivRoad[] = [];
  const anchorPts: Array<{ x: number; y: number }> = [{ x: hx, y: hy }];

  const primaryW  = size === "village" ? 18 : size === "town" ? 24 : 32;
  const secondaryW = size === "village" ? 11 : size === "town" ? 15 : 20;
  const trackW    = size === "village" ?  7 : 9;

  // ── Anchor buildings: placed at varying distances around hub ──────────────
  const anchorCount = size === "village" ? 3 : size === "town" ? 5 : 7;
  const minAngleDelta = (ORGANIC_ROAD.minAngleDeltaDeg * Math.PI) / 180;
  const usedAngles: number[] = [];

  for (let i = 0; i < anchorCount; i++) {
    // Start with a base angle and enforce minimum angular separation
    let angle = seededRand(i + 1, seed + 71000) * Math.PI * 2;
    for (let attempt = 0; attempt < 24; attempt++) {
      const tooClose = usedAngles.some(a => {
        let d = Math.abs(a - angle) % (Math.PI * 2);
        if (d > Math.PI) d = Math.PI * 2 - d;
        return d < minAngleDelta;
      });
      if (!tooClose) break;
      angle = (angle + minAngleDelta * 1.15 + seededRand(i * 10 + attempt, seed + 71001) * 0.25) % (Math.PI * 2);
    }
    // Extra per-anchor rotation breaks uniform angular spacing (±20°)
    const extraRot = (seededRand(i + 1, seed + 71010) - 0.5) * 0.70;
    usedAngles.push(angle);
    const finalAngle = angle + extraRot;
    const dist = 130 + seededRand(i + 1, seed + 71002) * 175;
    anchorPts.push({
      x: Math.max(55, Math.min(W - 55, hx + Math.cos(finalAngle) * dist)),
      y: Math.max(55, Math.min(H - 55, hy + Math.sin(finalAngle) * dist)),
    });
  }

  // ── Primary roads: hub → every anchor ────────────────────────────────────
  for (let i = 1; i < anchorPts.length; i++) {
    roads.push(makeCivRoad(anchorPts[0], anchorPts[i], "primary", primaryW, seed, i * 10));
  }

  // ── Cross-links: connect some anchors to each other (no right angles) ────
  const crossLinks = size === "village" ? 0 : size === "town" ? 1 : 2 + Math.floor(seededRand(300, seed) * 2);
  for (let c = 0; c < crossLinks; c++) {
    const ai = 1 + (Math.floor(seededRand(c, seed + 71020) * (anchorPts.length - 1)));
    let aj = 1 + (Math.floor(seededRand(c + 1, seed + 71021) * (anchorPts.length - 1)));
    if (ai === aj) aj = (aj % (anchorPts.length - 1)) + 1;
    // Avoid near-right-angle joins by enforcing angle check
    const ax = anchorPts[ai], bx = anchorPts[aj];
    const crossAngle = Math.atan2(bx.y - ax.y, bx.x - ax.x);
    const hubAngleA = Math.atan2(hy - ax.y, hx - ax.x);
    let angDiff = Math.abs(crossAngle - hubAngleA) % Math.PI;
    if (angDiff > Math.PI / 2) angDiff = Math.PI - angDiff;
    if (angDiff < 0.40) continue; // skip roads that would meet near 90°
    roads.push(makeCivRoad(ax, bx, "secondary", secondaryW, seed, 100 + c * 10));
  }

  // ── Exit roads: extend from outermost anchors toward canvas edges ─────────
  const exitCount = size === "village" ? 2 : 3;
  for (let e = 0; e < exitCount; e++) {
    const srcIdx = 1 + (e % (anchorPts.length - 1));
    const a = anchorPts[srcIdx];
    // Exit angle = away from hub, with small random wobble to break symmetry
    const exitBase = Math.atan2(a.y - hy, a.x - hx) + (seededRand(e, seed + 71030) - 0.5) * 0.30;
    const cos = Math.cos(exitBase), sin = Math.sin(exitBase);
    let te = 1e9;
    if (Math.abs(cos) > 0.001) te = Math.min(te, cos > 0 ? (W - a.x) / cos : -a.x / cos);
    if (Math.abs(sin) > 0.001) te = Math.min(te, sin > 0 ? (H - a.y) / sin : -a.y / sin);
    const exitPt = { x: Math.max(0, Math.min(W, a.x + cos * te)), y: Math.max(0, Math.min(H, a.y + sin * te)) };
    roads.push(makeCivRoad(a, exitPt, "primary", primaryW, seed, 200 + e * 10));
  }

  // ── Wandering spur: a purposeless-looking branch for organic realism ──────
  if (size !== "village") {
    const spIdx = 1 + Math.floor(seededRand(400, seed) * (anchorPts.length - 1));
    const sp = anchorPts[spIdx];
    const spurAngle = Math.atan2(sp.y - hy, sp.x - hx) + (seededRand(401, seed) - 0.5) * 1.4;
    const spurDist = 65 + seededRand(402, seed) * 85;
    roads.push(makeCivRoad(sp, {
      x: Math.max(30, Math.min(W - 30, sp.x + Math.cos(spurAngle) * spurDist)),
      y: Math.max(30, Math.min(H - 30, sp.y + Math.sin(spurAngle) * spurDist)),
    }, "track", trackW, seed, 300));
  }

  return { roads, anchorPts };
}





function renderCastleFootprint(ctx: CanvasRenderingContext2D, b: TownBuilding): void {
  ctx.save();
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const ks = Math.min(b.w, b.h) * 0.88;
  const cseed = ((b.x * 17 + b.y * 11) | 0) + 95000;
  const wallT = ks * 0.11;

  // Outer wall fill — fully opaque stone
  ctx.fillStyle = "rgb(142,132,112)";
  ctx.fillRect(cx - ks/2, cy - ks/2, ks, ks);

  // Stone block texture on walls — dense cobblestone pattern
  for (let s = 0; s < 220; s++) {
    const sx = cx - ks/2 + seededRand(s, cseed + 1) * ks;
    const sy = cy - ks/2 + seededRand(s, cseed + 2) * ks;
    const sw = 4 + seededRand(s, cseed + 3) * 10;
    const sh = 3 + seededRand(s, cseed + 4) * 5;
    const rv = (seededRand(s, cseed + 5) * 36 - 18) | 0;
    ctx.fillStyle = `rgb(${142+rv},${132+rv},${112+rv})`;
    ctx.strokeStyle = "rgba(28,20,10,0.22)"; ctx.lineWidth = 0.5;
    ctx.fillRect(sx, sy, sw, sh); ctx.strokeRect(sx, sy, sw, sh);
  }
  // Mortar lines along wall perimeter — horizontal bands
  ctx.strokeStyle = "rgba(20,14,6,0.14)"; ctx.lineWidth = 0.7;
  for (let row = cy - ks/2 + 6; row < cy + ks/2; row += 8) {
    ctx.beginPath(); ctx.moveTo(cx - ks/2, row); ctx.lineTo(cx + ks/2, row); ctx.stroke();
  }

  // Courtyard (inner open area within walls)
  ctx.fillStyle = "rgb(178,165,135)";
  ctx.fillRect(cx - ks/2 + wallT, cy - ks/2 + wallT, ks - wallT*2, ks - wallT*2);

  // Inner keep — solid dark stone
  const ki = ks * 0.42;
  ctx.fillStyle = "rgb(78,65,46)";
  ctx.fillRect(cx - ki/2, cy - ki/2, ki, ki);
  for (let s = 0; s < 40; s++) {
    const sx = cx - ki/2 + seededRand(s, cseed + 10) * ki;
    const sy = cy - ki/2 + seededRand(s, cseed + 11) * ki;
    const rv = (seededRand(s, cseed + 12) * 22 - 11) | 0;
    ctx.fillStyle = `rgb(${78+rv},${65+rv},${46+rv})`;
    ctx.fillRect(sx, sy, 5 + seededRand(s, cseed+13)*8, 3 + seededRand(s, cseed+14)*4);
  }
  ctx.strokeStyle = "rgba(20,12,4,0.95)"; ctx.lineWidth = 2;
  ctx.strokeRect(cx - ki/2, cy - ki/2, ki, ki);

  // Battlements — merlons along curtain wall edges
  const mw = 6, mh = 5, mg = 8;
  ctx.fillStyle = "rgb(148,138,118)";
  ctx.strokeStyle = "rgba(28,20,10,0.75)"; ctx.lineWidth = 0.7;
  for (let mx = cx - ks/2 + 2; mx < cx + ks/2 - mw - 2; mx += mw + mg) {
    ctx.fillRect(mx, cy - ks/2 - mh, mw, mh); ctx.strokeRect(mx, cy - ks/2 - mh, mw, mh);
    ctx.fillRect(mx, cy + ks/2,      mw, mh); ctx.strokeRect(mx, cy + ks/2,      mw, mh);
  }
  for (let my = cy - ks/2 + 2; my < cy + ks/2 - mw - 2; my += mw + mg) {
    ctx.fillRect(cx - ks/2 - mh, my, mh, mw); ctx.strokeRect(cx - ks/2 - mh, my, mh, mw);
    ctx.fillRect(cx + ks/2,      my, mh, mw); ctx.strokeRect(cx + ks/2,      my, mh, mw);
  }

  // Curtain wall outline
  ctx.strokeStyle = "rgba(18,12,4,0.96)"; ctx.lineWidth = 4;
  ctx.strokeRect(cx - ks/2, cy - ks/2, ks, ks);

  // Corner turrets
  const turretR = Math.max(6, ks * 0.13);
  for (const [tx, ty] of [[cx-ks/2, cy-ks/2],[cx+ks/2, cy-ks/2],[cx+ks/2, cy+ks/2],[cx-ks/2, cy+ks/2]] as [number,number][]) {
    ctx.beginPath(); ctx.arc(tx, ty, turretR, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(112,98,78)"; ctx.fill();
    ctx.strokeStyle = "rgba(18,12,4,0.95)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, ty, turretR * 0.52, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(28,20,10,0.50)"; ctx.lineWidth = 0.8; ctx.stroke();
  }

  // Gatehouse — solid dark gate arch
  ctx.fillStyle = "rgb(38,28,14)";
  ctx.fillRect(cx - 7, cy + ks/2 - 14, 14, 14);
  ctx.strokeStyle = "rgba(18,12,4,0.95)"; ctx.lineWidth = 1;
  ctx.strokeRect(cx - 7, cy + ks/2 - 14, 14, 14);
  ctx.beginPath(); ctx.arc(cx, cy + ks/2 - 8, 5, Math.PI, 0);
  ctx.fillStyle = "rgb(18,12,6)"; ctx.fill();
  ctx.restore();
}

// ─── Organic road rendering ───────────────────────────────────────────────────

function drawJunctionBlob(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number,
  style: CivRoad["style"],
  seed: number, idx: number
): void {
  const nPts = 8 + Math.floor(seededRand(idx, seed + 75000) * 5);
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < nPts; i++) {
    const angle = (i / nPts) * Math.PI * 2;
    const rVar = 0.72 + seededRand(idx * nPts + i, seed + 75001) * 0.52;
    const px = x + Math.cos(angle) * r * rVar;
    const py = y + Math.sin(angle) * r * rVar;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = style === "primary" ? "rgba(104,98,84,0.98)" : "rgba(155,128,80,0.92)";
  ctx.fill();
  ctx.restore();
}

function drawOrganicRoad(
  ctx: CanvasRenderingContext2D,
  road: CivRoad,
  seed: number,
  idx: number
): void {
  const pts = sampleCivRoad(road, 64);
  if (pts.length < 2) return;

  const wobbleAmpl = ORGANIC_ROAD.wobble * 4.5;
  const baseHW = road.width / 2;
  const edgeNoise = makeNoise(seed + 70000 + idx * 7);

  // Build left/right polygon edges with width variation and Perlin wobble
  const left: Array<{ x: number; y: number }> = [];
  const right: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < pts.length; i++) {
    const frac = i / (pts.length - 1);
    const widthMod = 1 + ORGANIC_ROAD.widthVariance * 0.28 * Math.sin(frac * Math.PI * 2.7);
    const hw = baseHW * widthMod;
    const noiseL = edgeNoise(pts[i].x / W * 9,       pts[i].y / H * 9      ) * wobbleAmpl;
    const noiseR = edgeNoise(pts[i].x / W * 9 + 100, pts[i].y / H * 9 + 100) * wobbleAmpl;
    left.push ({x: pts[i].x + pts[i].nx * (hw + noiseL), y: pts[i].y + pts[i].ny * (hw + noiseL)});
    right.push({x: pts[i].x - pts[i].nx * (hw - noiseR), y: pts[i].y - pts[i].ny * (hw - noiseR)});
  }

  const fillColor = road.style === "primary"
    ? "rgba(108,102,88,0.97)"
    : road.style === "secondary"
    ? "rgba(158,132,82,0.93)"
    : "rgba(148,118,68,0.85)";

  // 1. Filled road polygon
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (const p of left) ctx.lineTo(p.x, p.y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.restore();

  // 2. Edge shadow vignette — thin dark strip inside each road edge
  ctx.save();
  ctx.globalAlpha = 0.11;
  for (let i = 0; i < pts.length - 1; i++) {
    const pt0 = pts[i], pt1 = pts[Math.min(i + 1, pts.length - 1)];
    const insetW = Math.max(2, baseHW * 0.22);
    ctx.beginPath();
    ctx.moveTo(left[i].x, left[i].y);
    ctx.lineTo(left[i + 1] ? left[i + 1].x : left[i].x, left[i + 1] ? left[i + 1].y : left[i].y);
    ctx.lineTo(left[i].x - pt0.nx * insetW, left[i].y - pt0.ny * insetW);
    ctx.closePath();
    ctx.fillStyle = "rgb(28,16,4)"; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(right[i].x, right[i].y);
    ctx.lineTo(right[i + 1] ? right[i + 1].x : right[i].x, right[i + 1] ? right[i + 1].y : right[i].y);
    ctx.lineTo(right[i].x + pt1.nx * insetW, right[i].y + pt1.ny * insetW);
    ctx.closePath();
    ctx.fillStyle = "rgb(28,16,4)"; ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // 3. Surface texture clipped to road polygon
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (const p of left) ctx.lineTo(p.x, p.y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  ctx.clip();

  if (road.style === "primary") {
    // Cobblestones — rows of individually stamped stones
    const rowCount = Math.max(2, (road.width / 8) | 0);
    for (let s = 0; s < pts.length; s++) {
      if (seededRand(s + idx * 200, seed + 71100) > ORGANIC_ROAD.cobbleDensity) continue;
      for (let row = 0; row < rowCount; row++) {
        const off = (row - rowCount / 2 + 0.5) * 7;
        const jx = (seededRand(s * rowCount + row + idx * 600,       seed + 71101) - 0.5) * 2.5;
        const jy = (seededRand(s * rowCount + row + idx * 600 + 100, seed + 71102) - 0.5) * 2.5;
        const cx2 = pts[s].x + pts[s].nx * off + jx;
        const cy2 = pts[s].y + pts[s].ny * off + jy;
        const rv  = (seededRand(s * rowCount + row + idx * 600 + 200, seed + 71103) * 30) | 0;
        ctx.save(); ctx.translate(cx2, cy2);
        ctx.fillStyle = `rgb(${102+rv},${96+rv},${86+rv})`;
        ctx.fillRect(-3, -2.5, 6, 5);
        ctx.strokeStyle = "rgba(45,35,22,0.52)"; ctx.lineWidth = 0.5;
        ctx.strokeRect(-3, -2.5, 6, 5);
        ctx.restore();
      }
    }
  } else {
    // Dirt stipple — short scratched line segments scattered across road surface
    for (let s = 0; s < pts.length; s++) {
      if (seededRand(s + idx * 200, seed + 71200) > 0.22) continue;
      const off  = (seededRand(s + idx * 200 + 1, seed + 71201) - 0.5) * road.width * 0.60;
      const tlen = 2 + seededRand(s + idx * 200 + 2, seed + 71202) * 5;
      ctx.beginPath();
      ctx.moveTo(pts[s].x + pts[s].nx * off,               pts[s].y + pts[s].ny * off);
      ctx.lineTo(pts[s].x + pts[s].nx * off + pts[s].tx * tlen, pts[s].y + pts[s].ny * off + pts[s].ty * tlen);
      ctx.strokeStyle = "rgba(98,74,38,0.22)"; ctx.lineWidth = 0.7; ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBuildingRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  p: { wr: number; wg: number; wb: number; rr: number; rg: number; rb: number },
  wt: number, seed: number, idx: number,
  thatch = false,
  doorSide: "N"|"S"|"E"|"W" = "S"
): void {
  // Wall base
  ctx.fillStyle = `rgb(${Math.min(255,p.wr)},${Math.min(255,p.wg)},${Math.min(255,p.wb)})`;
  ctx.fillRect(x, y, w, h);
  // Roof fill
  if (thatch) {
    ctx.fillStyle = "rgb(192,162,72)"; // golden straw
  } else {
    ctx.fillStyle = `rgb(${p.rr},${p.rg},${p.rb})`;
  }
  ctx.fillRect(x + wt, y + wt, w - wt * 2, h - wt * 2);
  // Roof gradient (NW bright → SE dark)
  const grd = ctx.createLinearGradient(x + wt, y + wt, x + w - wt, y + h - wt);
  grd.addColorStop(0,    "rgba(255,255,255,0.16)");
  grd.addColorStop(0.45, "rgba(255,255,255,0.03)");
  grd.addColorStop(1,    "rgba(0,0,0,0.22)");
  ctx.fillStyle = grd;
  ctx.fillRect(x + wt, y + wt, w - wt * 2, h - wt * 2);
  // Roof texture
  ctx.save();
  ctx.beginPath(); ctx.rect(x + wt, y + wt, w - wt * 2, h - wt * 2); ctx.clip();
  if (thatch) {
    // Diagonal hatching for straw/thatch
    ctx.strokeStyle = "rgba(148,112,32,0.38)"; ctx.lineWidth = 0.75;
    for (let tx2 = x + wt - h; tx2 < x + w - wt + h; tx2 += 5) {
      ctx.beginPath(); ctx.moveTo(tx2, y + wt); ctx.lineTo(tx2 + h, y + h - wt); ctx.stroke();
    }
  } else {
    // Tile texture — rows of semicircular arcs
    const tr = (p.rr * 0.58) | 0, tg = (p.rg * 0.52) | 0, tb = (p.rb * 0.48) | 0;
    ctx.strokeStyle = `rgba(${tr},${tg},${tb},0.32)`; ctx.lineWidth = 0.7;
    const tileH = 5, tileW = 9;
    for (let ty2 = y + wt + tileH; ty2 < y + h - wt; ty2 += tileH) {
      const rowNum = Math.round((ty2 - y - wt) / tileH);
      const offset = (rowNum % 2 === 0) ? 0 : tileW / 2;
      for (let tx2 = x + wt - offset; tx2 < x + w - wt + tileW; tx2 += tileW) {
        ctx.beginPath();
        ctx.arc(tx2 + tileW / 2, ty2, tileW / 2, Math.PI, 0, true);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
  // Ridge line along long axis
  ctx.strokeStyle = `rgba(${(p.rr * 0.48) | 0},${(p.rg * 0.44) | 0},${(p.rb * 0.40) | 0},0.85)`;
  ctx.lineWidth = 1.5; ctx.lineCap = "round";
  ctx.beginPath();
  if (w >= h) { ctx.moveTo(x + wt + 5, y + h / 2); ctx.lineTo(x + w - wt - 5, y + h / 2); }
  else        { ctx.moveTo(x + w / 2, y + wt + 5); ctx.lineTo(x + w / 2, y + h - wt - 5); }
  ctx.stroke();
  // Chimney (35%)
  if (w > 24 && h > 20 && seededRand(idx + 2, seed + 40012) < 0.36) {
    const cs = Math.max(4, (Math.min(w, h) * 0.12) | 0);
    const cpx2 = w >= h ? x + w * 0.38 - cs / 2 : x + wt + 4;
    const cpy2 = w >= h ? y + wt + 4 : y + h * 0.38 - cs / 2;
    ctx.fillStyle = `rgb(${Math.min(255,p.wr-30)},${Math.min(255,p.wg-24)},${Math.min(255,p.wb-20)})`;
    ctx.fillRect(cpx2, cpy2, cs, cs);
    ctx.strokeStyle = "rgba(42,28,12,0.85)"; ctx.lineWidth = 0.7; ctx.strokeRect(cpx2, cpy2, cs, cs);
  }
  // South & east wall shadow for depth
  ctx.fillStyle = "rgba(28,16,4,0.22)";
  ctx.fillRect(x, y + h - wt, w, wt);
  ctx.fillRect(x + w - wt, y, wt, h);
  // Door on the side facing the road
  if (wt >= 3) {
    ctx.fillStyle = "rgba(52,32,14,0.92)";
    const dw = Math.max(4, (w * 0.22) | 0);
    const dh = Math.max(4, (h * 0.22) | 0);
    if (doorSide === "S" && h > 16) ctx.fillRect(x + w/2 - dw/2, y + h - wt, dw, wt);
    else if (doorSide === "N" && h > 16) ctx.fillRect(x + w/2 - dw/2, y, dw, wt);
    else if (doorSide === "E" && w > 16) ctx.fillRect(x + w - wt, y + h/2 - dh/2, wt, dh);
    else if (doorSide === "W" && w > 16) ctx.fillRect(x, y + h/2 - dh/2, wt, dh);
  }
  // Windows
  if (w > 28 && wt >= 3) {
    const ws = Math.max(2, (wt * 0.7) | 0);
    ctx.fillStyle = "rgba(218,198,148,0.60)";
    ctx.fillRect(x + wt / 2 - ws / 2, y + h * 0.38, ws, ws);
    if (w > 38) ctx.fillRect(x + w - wt / 2 - ws / 2, y + h * 0.38, ws, ws);
  }
  ctx.strokeStyle = "rgba(42,26,8,0.90)"; ctx.lineWidth = 0.9;
  ctx.strokeRect(x, y, w, h);
}

function drawHouseTopDown(ctx: CanvasRenderingContext2D, b: TownBuilding, seed: number, idx: number, isVillage = false): void {
  const { x, y, w, h } = b;
  const doorSide = b.doorSide ?? "S";
  const thatch = isVillage && seededRand(idx + 9, seed + 40025) < 0.45;
  const pi = (seededRand(idx, seed + 40006) * 4) | 0;
  const rv = (seededRand(idx + 1, seed + 40015) * 18) | 0;
  const palettes = [
    { wr: 200+rv, wg: 182+rv, wb: 148+rv, rr: Math.min(255,168+rv), rg: 105,             rb: 65 },
    { wr: 188+rv, wg: 175+rv, wb: 150+rv, rr: Math.min(255,128+rv), rg: Math.min(255,118+rv), rb: Math.min(255,105+rv) },
    { wr: 190+rv, wg: 178+rv, wb: 152+rv, rr: Math.min(255,148+rv), rg: 115,             rb: 72 },
    { wr: 205+rv, wg: 194+rv, wb: 170+rv, rr: Math.min(255,168+rv), rg: Math.min(255,148+rv), rb: Math.min(255,118+rv) },
  ];
  const p = palettes[pi];
  const wt = Math.max(4, Math.min(7, (Math.min(w, h) * 0.14) | 0));

  // Drop shadow
  ctx.fillStyle = "rgba(28,16,4,0.26)"; ctx.fillRect(x + 4, y + 3, w, h);

  // L-shape variant for ~18% of large buildings
  const isL = w > 34 && h > 28 && seededRand(idx + 3, seed + 40017) < 0.18;
  if (isL) {
    // Cut one corner, choosing the side randomly
    const corner = (seededRand(idx + 4, seed + 40018) * 4) | 0; // 0=NE 1=SE 2=SW 3=NW
    const cutW = ((w * (0.28 + seededRand(idx + 5, seed + 40019) * 0.22)) | 0);
    const cutH = ((h * (0.28 + seededRand(idx + 6, seed + 40020) * 0.22)) | 0);
    ctx.save();
    ctx.beginPath();
    if (corner === 0) { // NE cut
      ctx.moveTo(x, y); ctx.lineTo(x + w - cutW, y); ctx.lineTo(x + w - cutW, y + cutH);
      ctx.lineTo(x + w, y + cutH); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
    } else if (corner === 1) { // SE cut
      ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h - cutH);
      ctx.lineTo(x + w - cutW, y + h - cutH); ctx.lineTo(x + w - cutW, y + h); ctx.lineTo(x, y + h);
    } else if (corner === 2) { // SW cut
      ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + cutW, y + h); ctx.lineTo(x + cutW, y + h - cutH); ctx.lineTo(x, y + h - cutH);
    } else { // NW cut
      ctx.moveTo(x + cutW, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h); ctx.lineTo(x, y + cutH); ctx.lineTo(x + cutW, y + cutH);
    }
    ctx.closePath();
    ctx.clip();
    drawBuildingRect(ctx, x, y, w, h, p, wt, seed, idx, thatch, doorSide);
    ctx.restore();
    // Outline the L-shape
    ctx.save();
    ctx.beginPath();
    if (corner === 0) {
      ctx.moveTo(x, y); ctx.lineTo(x + w - cutW, y); ctx.lineTo(x + w - cutW, y + cutH);
      ctx.lineTo(x + w, y + cutH); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h);
    } else if (corner === 1) {
      ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h - cutH);
      ctx.lineTo(x + w - cutW, y + h - cutH); ctx.lineTo(x + w - cutW, y + h); ctx.lineTo(x, y + h);
    } else if (corner === 2) {
      ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + cutW, y + h); ctx.lineTo(x + cutW, y + h - cutH); ctx.lineTo(x, y + h - cutH);
    } else {
      ctx.moveTo(x + cutW, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h); ctx.lineTo(x, y + cutH); ctx.lineTo(x + cutW, y + cutH);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(42,26,8,0.90)"; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.restore();
  } else {
    drawBuildingRect(ctx, x, y, w, h, p, wt, seed, idx, thatch, doorSide);
  }
}


function renderChurchBuilding(ctx: CanvasRenderingContext2D, b: TownBuilding): void {
  // Church is a regular tiled-roof building (larger than average), with a small bell badge
  const idx = ((b.x * 13 + b.y * 7) | 0) + 72000;
  // Use the standard house renderer with a warm stone palette
  drawHouseTopDown(ctx, b, idx, 0, false);
  // Small bell badge (no white circle background, just the icon directly)
  const bix = b.x + b.w / 2, biy = b.y + b.h / 2;
  const badgeR = Math.max(7, Math.min(b.w, b.h) * 0.18);
  ctx.save();
  ctx.translate(bix, biy);
  ctx.scale(badgeR / 11, badgeR / 11);
  ctx.translate(-bix, -biy);
  drawChurchIcon(ctx, bix, biy);
  ctx.restore();
}

function drawWell(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  // Stone base ring
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fillStyle = "rgb(148,135,112)"; ctx.fill();
  ctx.strokeStyle = "rgba(55,40,20,0.85)"; ctx.lineWidth = 1.8; ctx.stroke();
  // Water inside
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(88,130,168,0.80)"; ctx.fill();
  ctx.strokeStyle = "rgba(55,90,130,0.50)"; ctx.lineWidth = 0.7; ctx.stroke();
  // Wooden posts
  ctx.fillStyle = "rgb(108,78,44)";
  ctx.fillRect(cx - 12, cy - 13, 3, 10);
  ctx.fillRect(cx + 9, cy - 13, 3, 10);
  ctx.strokeStyle = "rgba(55,38,18,0.80)"; ctx.lineWidth = 0.7;
  ctx.strokeRect(cx - 12, cy - 13, 3, 10);
  ctx.strokeRect(cx + 9, cy - 13, 3, 10);
  // Cross beam
  ctx.beginPath(); ctx.moveTo(cx - 10, cy - 13); ctx.lineTo(cx + 11, cy - 13);
  ctx.strokeStyle = "rgb(108,78,44)"; ctx.lineWidth = 2.5; ctx.stroke();
  // Rope
  ctx.beginPath(); ctx.moveTo(cx, cy - 13); ctx.lineTo(cx, cy - 6);
  ctx.strokeStyle = "rgba(148,118,72,0.85)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

function drawFountain(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  // Outer basin water
  ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(88,130,168,0.65)"; ctx.fill();
  // Stone rim
  ctx.strokeStyle = "rgb(148,135,112)"; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = "rgba(55,42,25,0.70)"; ctx.lineWidth = 1.5; ctx.stroke();
  // Inner basin
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(100,148,185,0.75)"; ctx.fill();
  // Center column
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle = "rgb(158,145,122)"; ctx.fill();
  ctx.strokeStyle = "rgba(55,42,25,0.75)"; ctx.lineWidth = 0.8; ctx.stroke();
  // Water sparkles
  for (let w = 0; w < 6; w++) {
    const wa = (w / 6) * Math.PI * 2;
    ctx.beginPath(); ctx.arc(cx + Math.cos(wa)*12, cy + Math.sin(wa)*12, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,230,255,0.55)"; ctx.fill();
  }
  ctx.restore();
}

function renderDocksOnPond(ctx: CanvasRenderingContext2D, pondCx: number, pondCy: number, pondRx: number, pondRy: number, seed: number): { cx: number; cy: number; r: number } {
  ctx.save();
  const dockAngle = seededRand(800, seed) * Math.PI * 2;
  const dockLen = 28 + seededRand(802, seed) * 22;
  const dockW = 16 + seededRand(803, seed) * 10;
  const rampLen = 18;
  // Shore point (where dock meets pond edge)
  const shoreX = pondCx + Math.cos(dockAngle) * pondRx;
  const shoreY = pondCy + Math.sin(dockAngle) * pondRy;
  // Direction from shore toward pond center
  const ddx = pondCx - shoreX, ddy = pondCy - shoreY;
  const ddlen = Math.sqrt(ddx*ddx + ddy*ddy) || 1;
  const px = ddx/ddlen, py = ddy/ddlen;
  const qx = -py, qy = px;

  // Land ramp (behind shore, on dry ground)
  ctx.fillStyle = "rgba(148,118,78,0.90)";
  ctx.beginPath();
  ctx.moveTo(shoreX - qx*dockW/2 - px*rampLen, shoreY - qy*dockW/2 - py*rampLen);
  ctx.lineTo(shoreX + qx*dockW/2 - px*rampLen, shoreY + qy*dockW/2 - py*rampLen);
  ctx.lineTo(shoreX + qx*dockW/2, shoreY + qy*dockW/2);
  ctx.lineTo(shoreX - qx*dockW/2, shoreY - qy*dockW/2);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(55,38,18,0.80)"; ctx.lineWidth = 1.2; ctx.stroke();

  // Main dock planks (over water)
  ctx.fillStyle = "rgba(148,118,78,0.96)";
  ctx.beginPath();
  ctx.moveTo(shoreX - qx*dockW/2, shoreY - qy*dockW/2);
  ctx.lineTo(shoreX + qx*dockW/2, shoreY + qy*dockW/2);
  ctx.lineTo(shoreX + qx*dockW/2 + px*dockLen, shoreY + qy*dockW/2 + py*dockLen);
  ctx.lineTo(shoreX - qx*dockW/2 + px*dockLen, shoreY - qy*dockW/2 + py*dockLen);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(55,38,18,0.82)"; ctx.lineWidth = 1.2; ctx.stroke();
  // Plank lines
  ctx.strokeStyle = "rgba(55,38,18,0.28)"; ctx.lineWidth = 0.7;
  for (let pl = 4; pl <= dockLen; pl += 7) {
    ctx.beginPath();
    ctx.moveTo(shoreX - qx*dockW/2 + px*pl, shoreY - qy*dockW/2 + py*pl);
    ctx.lineTo(shoreX + qx*dockW/2 + px*pl, shoreY + qy*dockW/2 + py*pl);
    ctx.stroke();
  }
  // Mooring posts
  for (let p2 = 0; p2 < 2; p2++) {
    const pf = (p2 + 1) / 3;
    const ppx = shoreX + qx*(pf*dockW - dockW/2) + px*dockLen*0.6;
    const ppy = shoreY + qy*(pf*dockW - dockW/2) + py*dockLen*0.6;
    ctx.fillStyle = "rgba(90,65,38,0.92)";
    ctx.fillRect(ppx - 2.5, ppy - 3, 5, 6);
    ctx.strokeStyle = "rgba(45,30,12,0.88)"; ctx.lineWidth = 0.8;
    ctx.strokeRect(ppx - 2.5, ppy - 3, 5, 6);
  }
  // Small boat moored beside dock
  const boatX = shoreX + qx*(dockW/2 + 14) + px*dockLen*0.55;
  const boatY = shoreY + qy*(dockW/2 + 14) + py*dockLen*0.55;
  ctx.save(); ctx.translate(boatX, boatY); ctx.rotate(Math.atan2(py, px));
  ctx.fillStyle = "rgba(105,80,52,0.90)";
  ctx.beginPath();
  ctx.moveTo(-13, 0); ctx.quadraticCurveTo(0, 7, 13, 0);
  ctx.quadraticCurveTo(13, -5, 0, -6); ctx.quadraticCurveTo(-13, -5, -13, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(45,30,12,0.82)"; ctx.lineWidth = 0.9; ctx.stroke();
  ctx.restore();
  ctx.restore();
  return { cx: shoreX + px*dockLen/2, cy: shoreY + py*dockLen/2, r: Math.max(dockLen, dockW) + 20 };
}

function renderCivRiver(ctx: CanvasRenderingContext2D, seed: number): Array<{ x: number; y: number }> {
  if (seededRand(908, seed) > 0.38) return [];
  ctx.save();
  const side1 = Math.floor(seededRand(901, seed) * 4);
  const side2 = (side1 + 2) % 4;
  const p1pos = 0.2 + seededRand(902, seed) * 0.6;
  const p2pos = 0.2 + seededRand(903, seed) * 0.6;
  let startX = 0, startY = 0, endX = 0, endY = 0;
  if      (side1 === 0) { startX = p1pos*W; startY = 0; }
  else if (side1 === 1) { startX = W; startY = p1pos*H; }
  else if (side1 === 2) { startX = p1pos*W; startY = H; }
  else                  { startX = 0; startY = p1pos*H; }
  if      (side2 === 0) { endX = p2pos*W; endY = 0; }
  else if (side2 === 1) { endX = W; endY = p2pos*H; }
  else if (side2 === 2) { endX = p2pos*W; endY = H; }
  else                  { endX = 0; endY = p2pos*H; }
  const cp1x = startX + (endX-startX)*0.30 + (seededRand(904, seed)-0.5)*280;
  const cp1y = startY + (endY-startY)*0.30 + (seededRand(905, seed)-0.5)*230;
  const cp2x = startX + (endX-startX)*0.70 + (seededRand(906, seed)-0.5)*280;
  const cp2y = startY + (endY-startY)*0.70 + (seededRand(907, seed)-0.5)*230;
  const riverW = 10;
  // Shadow
  ctx.beginPath(); ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
  ctx.strokeStyle = "rgba(40,72,110,0.42)"; ctx.lineWidth = riverW + 4;
  ctx.lineCap = "round"; ctx.stroke();
  // Main river
  ctx.beginPath(); ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
  ctx.strokeStyle = "rgba(72,118,162,0.80)"; ctx.lineWidth = riverW;
  ctx.lineCap = "round"; ctx.stroke();
  // Highlight
  ctx.beginPath(); ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
  ctx.strokeStyle = "rgba(145,195,235,0.18)"; ctx.lineWidth = riverW * 0.38;
  ctx.stroke();
  ctx.restore();
  // Return sampled center-line points for exclusion
  const pts: Array<{x: number; y: number}> = [];
  for (let s = 0; s <= 60; s++) {
    const t = s / 60, mt = 1 - t;
    pts.push({
      x: mt**3*startX + 3*mt**2*t*cp1x + 3*mt*t**2*cp2x + t**3*endX,
      y: mt**3*startY + 3*mt**2*t*cp1y + 3*mt*t**2*cp2y + t**3*endY,
    });
  }
  return pts;
}

function renderFarms(ctx: CanvasRenderingContext2D, seed: number, farmAreas: FarmArea[], allBuildings: Array<{b: TownBuilding}>): void {
  for (const { fx, fy, fw, fh, f } of farmAreas) {
    // Skip farm if it overlaps any building
    if (allBuildings.some(({ b }) => fx < b.x + b.w + 10 && fx + fw > b.x - 10 && fy < b.y + b.h + 10 && fy + fh > b.y - 10)) continue;
    const farmType = seededRand(f, seed + 82005) < 0.55 ? "crops" : "animal";
    ctx.fillStyle = farmType === "crops" ? "rgba(158,175,98,0.70)" : "rgba(185,168,122,0.65)";
    ctx.fillRect(fx, fy, fw, fh);
    ctx.fillStyle = "rgba(142,105,55,0.92)";
    for (let fp = fx; fp <= fx + fw + 1; fp += 14) {
      ctx.fillRect(fp - 1.5, fy - 5, 3, 10);
      ctx.fillRect(fp - 1.5, fy + fh - 5, 3, 10);
    }
    for (let fp = fy + 14; fp < fy + fh - 4; fp += 14) {
      ctx.fillRect(fx - 5, fp - 1.5, 10, 3);
      ctx.fillRect(fx + fw - 5, fp - 1.5, 10, 3);
    }
    ctx.strokeStyle = "rgba(142,105,55,0.88)"; ctx.lineWidth = 1.5;
    ctx.strokeRect(fx, fy, fw, fh);
    if (farmType === "crops") {
      ctx.strokeStyle = "rgba(55,92,32,0.48)"; ctx.lineWidth = 0.8;
      for (let row = fy + 10; row < fy + fh - 5; row += 9) {
        ctx.beginPath(); ctx.moveTo(fx + 6, row); ctx.lineTo(fx + fw - 6, row); ctx.stroke();
        for (let pc = fx + 11; pc < fx + fw - 6; pc += 12) {
          const pv = (seededRand((pc | 0) + (row | 0) * 77 + f * 300, seed + 82010) * 16) | 0;
          ctx.fillStyle = `rgba(${48+pv},${94+pv},${32+pv},0.78)`;
          ctx.beginPath(); ctx.arc(pc, row, 2.2, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else {
      const animalCount = 2 + (seededRand(f, seed + 82011) * 5 | 0);
      for (let a = 0; a < animalCount; a++) {
        const ax = fx + 12 + seededRand(a + f * 10, seed + 82012) * (fw - 24);
        const ay = fy + 10 + seededRand(a + f * 10, seed + 82013) * (fh - 20);
        const aAngle = seededRand(a + f * 10, seed + 82015) * Math.PI;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(ax, ay, 7, 5, aAngle, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(228,218,200,0.92)"; ctx.fill();
        ctx.strokeStyle = "rgba(82,65,38,0.70)"; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.beginPath();
        ctx.arc(ax + Math.cos(aAngle) * 7, ay + Math.sin(aAngle) * 5, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(185,172,148,0.92)"; ctx.fill(); ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function drawBridge(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, roadWidth: number): void {
  const bridgeLen = 32;
  const bw = roadWidth + 6;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  // Stone abutments on each end
  ctx.fillStyle = "rgba(130,118,98,0.95)";
  ctx.fillRect(-bw/2 - 3, -bridgeLen/2 - 6, bw + 6, 7);
  ctx.fillRect(-bw/2 - 3, bridgeLen/2 - 1, bw + 6, 7);
  ctx.strokeStyle = "rgba(70,58,38,0.80)"; ctx.lineWidth = 0.9;
  ctx.strokeRect(-bw/2 - 3, -bridgeLen/2 - 6, bw + 6, 7);
  ctx.strokeRect(-bw/2 - 3, bridgeLen/2 - 1, bw + 6, 7);
  // Deck planks
  ctx.fillStyle = "rgba(155,122,75,0.96)";
  ctx.fillRect(-bw/2, -bridgeLen/2, bw, bridgeLen);
  ctx.strokeStyle = "rgba(80,58,28,0.72)"; ctx.lineWidth = 1.0;
  ctx.strokeRect(-bw/2, -bridgeLen/2, bw, bridgeLen);
  ctx.strokeStyle = "rgba(80,58,28,0.28)"; ctx.lineWidth = 0.8;
  for (let y = -bridgeLen/2 + 5; y < bridgeLen/2; y += 6) {
    ctx.beginPath(); ctx.moveTo(-bw/2, y); ctx.lineTo(bw/2, y); ctx.stroke();
  }
  // Railing posts
  ctx.fillStyle = "rgba(108,78,42,0.92)";
  for (let y = -bridgeLen/2 + 3; y <= bridgeLen/2 - 3; y += 9) {
    ctx.fillRect(-bw/2 - 4, y - 2.5, 5, 5);
    ctx.fillRect(bw/2 - 1, y - 2.5, 5, 5);
    ctx.strokeStyle = "rgba(55,38,16,0.80)"; ctx.lineWidth = 0.6;
    ctx.strokeRect(-bw/2 - 4, y - 2.5, 5, 5);
    ctx.strokeRect(bw/2 - 1, y - 2.5, 5, 5);
  }
  ctx.restore();
}

function renderCivilisation(ctx: CanvasRenderingContext2D, seed: number, size: CivSize): void {
  const hx = W / 2 + (seededRand(200, seed) - 0.5) * 120;
  const hy = H / 2 + (seededRand(201, seed) - 0.5) * 80;

  // ── Step 1: Generate organic layout — anchors placed first, roads second ─
  const { roads: civRoads, anchorPts } = generateOrganicLayout(seed, size, hx, hy);

  // ── Road mask — sampled per-road with per-road margin ────────────────────
  const MASK_W = 200, MASK_H = 134;
  const roadMask = new Uint8Array(MASK_W * MASK_H);

  function paintRoadMask(road: CivRoad): void {
    const marginPx = road.width / 2 + 4;
    const maskR2 = Math.ceil((marginPx / W) * MASK_W);
    for (const pt of sampleCivRoad(road, 80)) {
      const mgx = ((pt.x / W) * MASK_W) | 0;
      const mgy = ((pt.y / H) * MASK_H) | 0;
      for (let dy = -maskR2; dy <= maskR2; dy++) {
        for (let dx = -maskR2; dx <= maskR2; dx++) {
          if (dx*dx + dy*dy > maskR2*maskR2) continue;
          const mx = mgx + dx, my = mgy + dy;
          if (mx >= 0 && mx < MASK_W && my >= 0 && my < MASK_H) roadMask[my * MASK_W + mx] = 1;
        }
      }
    }
  }
  for (const road of civRoads) paintRoadMask(road);

  const isOnRoad = (cpx: number, cpy: number): boolean => {
    const mgx = ((cpx / W) * MASK_W) | 0;
    const mgy = ((cpy / H) * MASK_H) | 0;
    return mgx >= 0 && mgx < MASK_W && mgy >= 0 && mgy < MASK_H && roadMask[mgy * MASK_W + mgx] === 1;
  };
  const rectOnRoad = (rx: number, ry: number, rw: number, rh: number): boolean =>
    isOnRoad(rx + rw/2, ry + rh/2) || isOnRoad(rx, ry) || isOnRoad(rx+rw, ry) || isOnRoad(rx, ry+rh) || isOnRoad(rx+rw, ry+rh);

  // ── Pre-compute farm areas (filter out road-overlapping farms) ───────────
  const farmAreas: FarmArea[] = [];
  if (size !== "city") {
    const farmCount = size === "village" ? 3 + (seededRand(820, seed) * 3 | 0) : 1 + (seededRand(820, seed) * 2 | 0);
    for (let f = 0; f < farmCount; f++) {
      const fa = (f / farmCount) * Math.PI * 2 + seededRand(f, seed + 82001) * 1.0;
      const fd = 200 + seededRand(f, seed + 82002) * 200;
      const fx = Math.max(25, Math.min(W - 135, hx + Math.cos(fa) * fd));
      const fy = Math.max(25, Math.min(H - 110, hy + Math.sin(fa) * fd));
      const fw = 75 + seededRand(f, seed + 82003) * 85;
      const fh = 55 + seededRand(f, seed + 82004) * 60;
      if (rectOnRoad(fx, fy, fw, fh)) continue;
      farmAreas.push({ fx, fy, fw, fh, f });
    }
  }
  const isOnFarm = (bx: number, by2: number, bw: number, bh: number): boolean =>
    farmAreas.some(fa => bx < fa.fx + fa.fw + 8 && bx + bw > fa.fx - 8 && by2 < fa.fy + fa.fh + 8 && by2 + bh > fa.fy - 8);

  // ── Pond: every settlement has a nearby water source ─────────────────────
  const rawHasPond = true;
  const pondCx = (0.12 + seededRand(760, seed) * 0.76) * W;
  const pondCy = (0.12 + seededRand(761, seed) * 0.76) * H;
  const pondRx = 28 + seededRand(762, seed) * 44;
  const pondRy = 22 + seededRand(763, seed) * 35;
  const hasPond = rawHasPond && !farmAreas.some(fa => pondCx > fa.fx && pondCx < fa.fx + fa.fw && pondCy > fa.fy && pondCy < fa.fy + fa.fh);

  // ── Layer 0: Terrain + water ──────────────────────────────────────────────
  renderCivTerrain(ctx, seed, size);
  if (hasPond) renderPond(ctx, seed);

  // ── River (occasional) ────────────────────────────────────────────────────
  const riverPts = renderCivRiver(ctx, seed);
  const riverExR = 18;
  const isOnRiver = (px2: number, py2: number): boolean =>
    riverPts.some(p => Math.hypot(px2 - p.x, py2 - p.y) < riverExR);

  // ── Layer 1: Docks — only on large water ─────────────────────────────────
  const isLake = hasPond && (pondRx > 56 || pondRy > 42);
  let dockExcl: { cx: number; cy: number; r: number } | null = null;
  if (isLake && size !== "village") {
    dockExcl = renderDocksOnPond(ctx, pondCx, pondCy, pondRx, pondRy, seed);
  }
  const isOnDock = (px2: number, py2: number): boolean =>
    dockExcl !== null && Math.hypot(px2 - dockExcl.cx, py2 - dockExcl.cy) < dockExcl.r;
  const isOnPond = (px2: number, py2: number): boolean =>
    hasPond && Math.hypot((px2-pondCx)/pondRx, (py2-pondCy)/pondRy) < 1.0;

  // ── Layer 2a: Junction blobs at multi-road anchor points ──────────────────
  for (let ai = 0; ai < anchorPts.length; ai++) {
    const { x: ax, y: ay } = anchorPts[ai];
    const connRoads = civRoads.filter(r => {
      const p0 = r.segments[0].p0, p1 = r.segments[r.segments.length - 1].p1;
      return Math.hypot(p0.x - ax, p0.y - ay) < 10 || Math.hypot(p1.x - ax, p1.y - ay) < 10;
    });
    if (connRoads.length < 2) continue;
    const maxW = connRoads.reduce((m, r) => Math.max(m, r.width), 0);
    const jStyle = connRoads.some(r => r.style === "primary") ? "primary" : "secondary";
    drawJunctionBlob(ctx, ax, ay, maxW * 0.80, jStyle, seed, ai);
  }

  // ── Layer 2b: Road fills — widest drawn first so narrower overlay cleanly ─
  const sortedForDraw = [...civRoads].sort((a, b) => b.width - a.width);
  for (let i = 0; i < sortedForDraw.length; i++) {
    drawOrganicRoad(ctx, sortedForDraw[i], seed, i);
  }

  // ── Layer 2.5: Bridges at river×road intersections ────────────────────────
  if (riverPts.length > 0) {
    const bridgeDone = new Set<string>();
    for (const road of civRoads) {
      for (const pt of sampleCivRoad(road, 100)) {
        if (!riverPts.some(rp => Math.hypot(pt.x - rp.x, pt.y - rp.y) < riverExR)) continue;
        const key = `${(pt.x / 20) | 0},${(pt.y / 20) | 0}`;
        if (bridgeDone.has(key)) continue;
        bridgeDone.add(key);
        drawBridge(ctx, pt.x, pt.y, Math.atan2(pt.ty, pt.tx), road.width);
      }
    }
  }

  // ── Layer 2.6: Bridges at pond×road intersections ────────────────────────
  if (hasPond) {
    const pondBridgeDone = new Set<string>();
    for (const road of civRoads) {
      for (const pt of sampleCivRoad(road, 100)) {
        if (!isOnPond(pt.x, pt.y)) continue;
        const key = `${(pt.x / 20) | 0},${(pt.y / 20) | 0}`;
        if (pondBridgeDone.has(key)) continue;
        pondBridgeDone.add(key);
        drawBridge(ctx, pt.x, pt.y, Math.atan2(pt.ty, pt.tx), road.width);
      }
    }
  }

  // ── Hub plaza ─────────────────────────────────────────────────────────────
  const hubR = size === "village" ? 30 + seededRand(217, seed) * 15 :
               size === "town"    ? 42 + seededRand(217, seed) * 18 :
                                    55 + seededRand(217, seed) * 22;
  ctx.save();
  ctx.beginPath(); ctx.arc(hx, hy, hubR, 0, Math.PI * 2);
  if (size === "village") {
    ctx.fillStyle = "rgba(172,148,100,0.92)"; ctx.fill();
    ctx.strokeStyle = "rgba(72,52,28,0.58)"; ctx.lineWidth = 1.5; ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(108,102,90,0.97)"; ctx.fill();
    ctx.strokeStyle = "rgba(62,50,32,0.68)"; ctx.lineWidth = 2; ctx.stroke();
    const hubStones = size === "city" ? 200 : 140;
    for (let s = 0; s < hubStones; s++) {
      const angle = seededRand(s, seed + 90001) * Math.PI * 2;
      const dist = Math.sqrt(seededRand(s + hubStones, seed + 90002)) * (hubR - 4);
      const hcx2 = hx + Math.cos(angle) * dist;
      const hcy2 = hy + Math.sin(angle) * dist;
      const rv = (seededRand(s, seed + 90003) * 24) | 0;
      ctx.fillStyle = `rgb(${100+rv},${93+rv},${83+rv})`;
      ctx.fillRect(hcx2 - 3, hcy2 - 2.5, 6, 5);
      ctx.strokeStyle = "rgba(45,35,22,0.45)"; ctx.lineWidth = 0.5;
      ctx.strokeRect(hcx2 - 3, hcy2 - 2.5, 6, 5);
    }
  }
  ctx.restore();

  if (size === "village") drawWell(ctx, hx, hy);
  else if (size === "town") drawTree(ctx, hx, hy, 38 + seededRand(218, seed) * 10);
  else drawFountain(ctx, hx, hy);

  // ── Layer 3: Castle (city only) ───────────────────────────────────────────
  let castleCx = -9999, castleCy = -9999;
  const castleW = 188, castleH = 168;
  if (size === "city") {
    const baseAngle = seededRand(220, seed) * Math.PI * 2;
    const castleDist = hubR + 185 + seededRand(221, seed) * 55;
    let bestAngle = baseAngle, bestHits = Infinity;
    for (let ai = 0; ai < 12; ai++) {
      const tryAngle = baseAngle + (ai / 12) * Math.PI * 2;
      const tryCx = Math.max(castleW/2+32, Math.min(W-castleW/2-32, hx + Math.cos(tryAngle)*castleDist));
      const tryCy = Math.max(castleH/2+32, Math.min(H-castleH/2-32, hy + Math.sin(tryAngle)*castleDist));
      let hits = 0;
      for (let sy = -castleH/2; sy <= castleH/2; sy += 10)
        for (let sx = -castleW/2; sx <= castleW/2; sx += 10)
          if (isOnRoad(tryCx + sx, tryCy + sy)) hits++;
      if (hits < bestHits) { bestHits = hits; bestAngle = tryAngle; }
    }
    castleCx = Math.max(castleW/2+32, Math.min(W-castleW/2-32, hx + Math.cos(bestAngle)*castleDist));
    castleCy = Math.max(castleH/2+32, Math.min(H-castleH/2-32, hy + Math.sin(bestAngle)*castleDist));
    const castleToHub = Math.atan2(hy - castleCy, hx - castleCx);
    ctx.save();
    ctx.translate(castleCx, castleCy);
    ctx.rotate(castleToHub + Math.PI / 2);
    ctx.translate(-castleCx, -castleCy);
    renderCastleFootprint(ctx, { x: castleCx-castleW/2, y: castleCy-castleH/2, w: castleW, h: castleH, type: "castle" });
    ctx.restore();
    const gateX = castleCx + Math.cos(castleToHub) * (castleH / 2);
    const gateY = castleCy + Math.sin(castleToHub) * (castleH / 2);
    const driveEndX = hx - Math.cos(castleToHub) * (hubR + 1);
    const driveEndY = hy - Math.sin(castleToHub) * (hubR + 1);
    const driveRoad = makeCivRoad({ x: gateX, y: gateY }, { x: driveEndX, y: driveEndY }, "primary", 20, seed, 998);
    drawOrganicRoad(ctx, driveRoad, seed, 999);
    paintRoadMask(driveRoad);
  }

  // ── Layer 4: Buildings — placed along roads, facing road direction ─────────
  const allBuildings: Array<{ b: TownBuilding; lotCx: number; lotCy: number }> = [];
  const bSteps = size === "village" ? 28 : size === "town" ? 38 : 50;
  const density = size === "village" ? 0.38 : size === "town" ? 0.55 : 0.68;
  const minBSize = size === "village" ? 22 : size === "town" ? 26 : 30;
  const maxBSize = size === "village" ? 38 : size === "town" ? 48 : 58;

  for (let pi = 0; pi < civRoads.length; pi++) {
    const road = civRoads[pi];
    const roadPts = sampleCivRoad(road, bSteps);
    // sideOffset: building centre must clear the road edge + half the smallest building side
    // so even the minimum building doesn't visually overlap the road polygon
    const sideOffset = road.width / 2 + minBSize / 2 + 4;
    const accessPathColor = (road.style === "track" || size === "village")
      ? "rgba(148,120,72,0.50)" : "rgba(112,106,93,0.55)";

    for (let si = 1; si < roadPts.length - 1; si++) {
      const pt = roadPts[si];
      const ppx = pt.x, ppy = pt.y;
      const nnx = pt.nx, nny = pt.ny;

      for (const side of [1, -1] as const) {
        const placeSeed = pi * 10000 + si * 20 + (side === 1 ? 0 : 1);
        if (seededRand(placeSeed, seed + 41000) > density) continue;

        const isSquare = seededRand(placeSeed + 1, seed + 41001) < 0.65;
        const baseSize = minBSize + seededRand(placeSeed + 2, seed + 41002) * (maxBSize - minBSize);
        const bw = (isSquare ? baseSize : baseSize * (1.2 + seededRand(placeSeed + 3, seed + 41003) * 0.5)) | 0;
        const bh = (isSquare ? baseSize : baseSize * (1.2 + seededRand(placeSeed + 4, seed + 41004) * 0.5)) | 0;

        const offsetDist = sideOffset + seededRand(placeSeed + 5, seed + 41005) * 14;
        const bcx = ppx + nnx * side * offsetDist;
        const bcy = ppy + nny * side * offsetDist;
        const bx = (bcx - bw / 2) | 0;
        const by2 = (bcy - bh / 2) | 0;

        if (bx < 22 || by2 < 22 || bx + bw > W - 22 || by2 + bh > H - 22) continue;
        if (Math.hypot(bcx - hx, bcy - hy) < hubR + 12) continue;
        if (size === "city" && Math.abs(bcx - castleCx) < castleW/2 + 22 && Math.abs(bcy - castleCy) < castleH/2 + 22) continue;
        if (isOnRoad(bcx, bcy)) continue;
        if (isOnFarm(bx, by2, bw, bh)) continue;
        if (isOnRiver(bcx, bcy) || isOnPond(bcx, bcy)) continue;
        if (allBuildings.some(({ b }) => bx < b.x + b.w + 5 && bx + bw > b.x - 5 && by2 < b.y + b.h + 5 && by2 + bh > b.y - 5)) continue;

        const doorSide = getDoorSide(ppx - bcx, ppy - bcy);
        const b: TownBuilding = { x: bx, y: by2, w: bw, h: bh, type: "normal", doorSide };

        const facingAngle = Math.atan2(-nny * side, -nnx * side);
        const doorDefaultAngles: Record<string, number> = { S: Math.PI/2, N: -Math.PI/2, E: 0, W: Math.PI };
        const doorBaseAngle = doorDefaultAngles[doorSide] ?? Math.PI/2;
        const extraRot = (seededRand(placeSeed + 6, seed + 41006) - 0.5) * 0.30;
        const buildingAngle = (facingAngle - doorBaseAngle) + extraRot;

        // Dirt access path from building to road edge when set back far enough
        if (offsetDist > road.width / 2 + 8) {
          const roadEdgeX = ppx + nnx * side * (road.width / 2 + 2);
          const roadEdgeY = ppy + nny * side * (road.width / 2 + 2);
          ctx.save();
          ctx.beginPath(); ctx.moveTo(bcx, bcy); ctx.lineTo(roadEdgeX, roadEdgeY);
          ctx.strokeStyle = accessPathColor;
          ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.translate(bcx, bcy); ctx.rotate(buildingAngle); ctx.translate(-bcx, -bcy);
        drawHouseTopDown(ctx, b, seed, pi * 200 + si * 2 + (side === 1 ? 0 : 1), size === "village");
        ctx.restore();
        allBuildings.push({ b, lotCx: bcx, lotCy: bcy });
      }
    }
  }

  // ── Layer 4.5: Farms ──────────────────────────────────────────────────────
  renderFarms(ctx, seed, farmAreas, allBuildings);

  // ── Layer 5: Trees + bushes — avoid roads, buildings, water, farms, river ─
  const isOnBuilding = (tx: number, ty: number): boolean =>
    allBuildings.some(({ b }) => tx >= b.x - 5 && tx <= b.x + b.w + 5 && ty >= b.y - 5 && ty <= b.y + b.h + 5);
  const isOnFarmPt = (tx: number, ty: number): boolean =>
    farmAreas.some(fa => tx >= fa.fx - 4 && tx <= fa.fx + fa.fw + 4 && ty >= fa.fy - 4 && ty <= fa.fy + fa.fh + 4);
  const treeNoise = makeNoise(seed + 77551);
  let plantIdx = 0;
  for (let py2 = 4; py2 < H - 4; py2 += 8) {
    for (let px2 = 4; px2 < W - 4; px2 += 8) {
      const nv = fbm(treeNoise, px2 / W * 14, py2 / H * 14, 3);
      // Outskirt boost: trees get denser farther from hub
      const distFromHub = Math.hypot(px2 - hx, py2 - hy);
      const outerBoost = Math.min(0.50, Math.max(0, (distFromHub / (Math.min(W, H) * 0.42) - 0.55) * 1.0));
      const nThreshold = 0.49 - outerBoost * 0.18;
      if (nv < nThreshold) continue;
      const treeProb = 0.30 + outerBoost * 0.52;
      if (seededRand(py2 * W / 8 + px2 / 8, seed + 22111) > treeProb) continue;
      if (distFromHub < hubR + 10) continue;
      if (size === "city" && Math.abs(px2 - castleCx) < castleW/2 + 8 && Math.abs(py2 - castleCy) < castleH/2 + 8) continue;
      if (isOnRoad(px2, py2)) continue;
      if (isOnBuilding(px2, py2)) continue;
      if (isOnFarmPt(px2, py2)) continue;
      if (isOnPond(px2, py2)) continue;
      if (isOnDock(px2, py2)) continue;
      if (isOnRiver(px2, py2)) continue;
      if (nv < 0.56 && seededRand(plantIdx, seed + 44211) < 0.55) {
        drawBush(ctx, px2, py2, 4 + seededRand(plantIdx, seed + 44212) * 4, seed, plantIdx);
      } else {
        drawTree(ctx, px2, py2, 5 + seededRand(py2 * W / 8 + px2 / 8, seed + 33111) * 5);
      }
      plantIdx++;
    }
  }

  // ── Layer 7: Special building icons ──────────────────────────────────────
  const sorted = allBuildings
    .map((entry, i) => ({ i, d: Math.hypot(entry.lotCx - hx, entry.lotCy - hy) }))
    .sort((a, b) => a.d - b.d);
  const specialOrder: BuildingType[] = size === "village"
    ? ["inn", "tavern", "blacksmith", "potions", "merchant"]
    : size === "town"
    ? ["church", "inn", "inn", "tavern", "tavern", "blacksmith", "armoury", "potions", "potions", "merchant"]
    : ["church", "inn", "inn", "tavern", "tavern", "tavern", "blacksmith", "blacksmith", "armoury", "potions", "potions", "merchant", "merchant"];
  // Size constraints per type: [minArea, maxArea]
  const sizeRange: Partial<Record<BuildingType, [number, number]>> = {
    church:     [900, Infinity],
    inn:        [700, Infinity],
    blacksmith: [600, Infinity],
    armoury:    [550, Infinity],
    potions:    [0, 750],
  };
  const usedLots = new Set<string>();
  let si = 0;
  for (const { i } of sorted) {
    if (si >= specialOrder.length) break;
    const { b, lotCx, lotCy } = allBuildings[i];
    const lotKey = `${lotCx | 0},${lotCy | 0}`;
    if (usedLots.has(lotKey)) continue;
    // Check building area fits this special type
    const area = b.w * b.h;
    const [minA, maxA] = sizeRange[specialOrder[si]] ?? [0, Infinity];
    if (area < minA || area > maxA) continue;
    usedLots.add(lotKey);
    const icx = b.x + b.w / 2, icy = b.y + b.h / 2;
    if (specialOrder[si] === "church") {
      // Church renders as a fortified stone building, not just an icon badge
      renderChurchBuilding(ctx, b);
    } else {
      // Small badge circle with scaled icon
      const badgeR = Math.max(6, Math.min(b.w, b.h) * 0.18);
      ctx.save();
      ctx.beginPath(); ctx.arc(icx, icy, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(248,242,225,0.84)"; ctx.fill();
      ctx.strokeStyle = "rgba(55,38,18,0.55)"; ctx.lineWidth = 0.7; ctx.stroke();
      const iconS = badgeR / 11;
      ctx.translate(icx, icy); ctx.scale(iconS, iconS); ctx.translate(-icx, -icy);
      switch (specialOrder[si]) {
        case "inn":        drawInnIcon(ctx, icx, icy); break;
        case "tavern":     drawTavernIcon(ctx, icx, icy); break;
        case "blacksmith": drawBlacksmithIcon(ctx, icx, icy); break;
        case "armoury":    drawSwordIcon(ctx, icx, icy); break;
        case "potions":    drawPotionIcon(ctx, icx, icy); break;
        case "merchant":   drawMerchantIcon(ctx, icx, icy); break;
      }
      ctx.restore();
    }
    si++;
  }

  // ── Perimeter border ─────────────────────────────────────────────────────
  ctx.save();
  if (size === "village") {
    // Hedgerow border — thick dark green line with bush-bump texture
    const mg = 14;
    ctx.strokeStyle = "rgba(38,68,22,0.88)"; ctx.lineWidth = 9;
    ctx.strokeRect(mg, mg, W - mg * 2, H - mg * 2);
    ctx.strokeStyle = "rgba(58,95,34,0.50)"; ctx.lineWidth = 4;
    ctx.strokeRect(mg, mg, W - mg * 2, H - mg * 2);
    // Hedge bumps along perimeter
    ctx.fillStyle = "rgba(48,82,28,0.62)";
    const bumps = 88;
    for (let hb = 0; hb < bumps; hb++) {
      const side = hb % 4;
      const frac = (Math.floor(hb / 4)) / (bumps / 4);
      let hbx: number, hby: number;
      if      (side === 0) { hbx = mg + frac * (W - mg*2); hby = mg; }
      else if (side === 1) { hbx = W - mg; hby = mg + frac * (H - mg*2); }
      else if (side === 2) { hbx = (W - mg) - frac * (W - mg*2); hby = H - mg; }
      else                 { hbx = mg; hby = (H - mg) - frac * (H - mg*2); }
      const br = 5 + seededRand(hb, seed + 97001) * 5;
      ctx.beginPath(); ctx.arc(hbx, hby, br, 0, Math.PI * 2); ctx.fill();
    }
    // Wooden fence posts
    ctx.fillStyle = "rgba(120,88,48,0.80)";
    for (let fp = mg; fp <= W - mg; fp += 22) {
      ctx.fillRect(fp - 2, mg - 5, 4, 10);
      ctx.fillRect(fp - 2, H - mg - 5, 4, 10);
    }
    for (let fp = mg; fp <= H - mg; fp += 22) {
      ctx.fillRect(mg - 5, fp - 2, 10, 4);
      ctx.fillRect(W - mg - 5, fp - 2, 10, 4);
    }
  } else {
    // Stone curtain wall for town/city
    ctx.strokeStyle = "rgba(45,35,18,0.94)"; ctx.lineWidth = 7;
    ctx.strokeRect(8, 8, W - 16, H - 16);
    ctx.strokeStyle = "rgba(88,75,55,0.38)"; ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, W - 44, H - 44);
    // Corner towers
    for (const [tx, ty] of [[8,8],[W-8,8],[W-8,H-8],[8,H-8]] as [number,number][]) {
      ctx.fillStyle = "rgba(45,35,18,0.95)"; ctx.fillRect(tx - 10, ty - 10, 20, 20);
      ctx.strokeStyle = "rgba(18,12,6,0.90)"; ctx.lineWidth = 1.0; ctx.strokeRect(tx - 10, ty - 10, 20, 20);
    }
  }
  ctx.restore();

  drawCompassRose(ctx, W - 64, H - 64, 38);
  drawBorder(ctx, seed);
  drawLegend(ctx, "civilisation");
  postProcess(ctx, seed);
}

// ─── Pin Drawing ──────────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPins(ctx: CanvasRenderingContext2D, pins: UserPin[]): void {
  for (const pin of pins) {
    const px = pin.nx * W, py = pin.ny * H;
    ctx.save();
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(185,52,42,0.95)"; ctx.fill();
    ctx.strokeStyle = "rgba(28,16,8,0.9)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.fill();
    if (pin.label) {
      ctx.font = "bold 12px 'Cinzel', serif";
      const tw = ctx.measureText(pin.label).width;
      const pad = 5, lh = 14;
      const lx = px - tw / 2 - pad, ly = py - 22 - lh;
      roundRect(ctx, lx, ly, tw + pad * 2, lh + pad, 3);
      ctx.fillStyle = "rgba(20,12,4,0.84)"; ctx.fill();
      ctx.fillStyle = "rgba(235,220,172,0.96)";
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(pin.label, px, ly + 3);
    }
    ctx.restore();
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DnDMapGenerator() {
  const [mode, setMode] = useState<"landscape" | "civilisation">("landscape");
  const [scale, setScale] = useState<MapScale>("medium");
  const [civSize, setCivSize] = useState<CivSize>("town");
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 999983));
  const [pinsLandscape, setPinsLandscape] = useState<UserPin[]>([]);
  const [pinsCivilisation, setPinsCivilisation] = useState<UserPin[]>([]);
  const pins = mode === "landscape" ? pinsLandscape : pinsCivilisation;
  const setPins = (mode === "landscape" ? setPinsLandscape : setPinsCivilisation) as (v: UserPin[] | ((prev: UserPin[]) => UserPin[])) => void;
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ nx: number; ny: number } | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const labelRef = useRef<HTMLInputElement>(null);

  // Load Cinzel font
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // Crosshair cursor override (site has global cursor:none from StarCursor)
  useEffect(() => {
    if (!isAddingPin) return;
    const style = document.createElement("style");
    style.textContent = ".dnd-overlay { cursor: crosshair !important; }";
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [isAddingPin]);

  // Map generation
  useEffect(() => {
    const canvas = mapRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsGenerating(true);
    const tid = setTimeout(() => {
      ctx.clearRect(0, 0, W, H);
      if (mode === "landscape") renderLandscape(ctx, seed, scale);
      else renderCivilisation(ctx, seed, civSize);
      setIsGenerating(false);
    }, 0);
    return () => clearTimeout(tid);
  }, [seed, mode, scale, civSize]);

  // Pin overlay
  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!pendingPin && pins.length === 0) { ctx.clearRect(0, 0, W, H); return; }
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      drawPins(ctx, pins);
      if (pendingPin) {
        const t = (Date.now() % 1200) / 1200;
        const pulse = Math.sin(t * Math.PI * 2);
        const px = pendingPin.nx * W, py = pendingPin.ny * H;
        ctx.beginPath();
        ctx.arc(px, py, 14 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220,75,55,${0.45 + pulse * 0.3})`;
        ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(220,75,55,0.88)"; ctx.fill();
      }
      id = requestAnimationFrame(draw);
      animRef.current = id;
    };
    draw();
    return () => cancelAnimationFrame(id);
  }, [pins, pendingPin]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAddingPin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (W / rect.width);
    const py = (e.clientY - rect.top) * (H / rect.height);
    const existing = pins.find(p => Math.hypot(p.nx * W - px, p.ny * H - py) < 16);
    if (existing) { setPins(prev => prev.filter(p => p.id !== existing.id)); return; }
    setPendingPin({ nx: px / W, ny: py / H });
    setLabelInput("");
    setTimeout(() => labelRef.current?.focus(), 50);
  };

  const confirmPin = () => {
    if (!pendingPin) return;
    setPins(prev => [...prev, { id: `p${Date.now()}`, nx: pendingPin.nx, ny: pendingPin.ny, label: labelInput.trim() }]);
    setPendingPin(null); setLabelInput("");
  };
  const cancelPin = () => { setPendingPin(null); setLabelInput(""); };

  const handleExport = () => {
    const mc = mapRef.current, oc = overlayRef.current;
    if (!mc || !oc) return;
    const out = document.createElement("canvas");
    out.width = W; out.height = H;
    const ctx = out.getContext("2d")!;
    ctx.drawImage(mc, 0, 0); ctx.drawImage(oc, 0, 0);
    const a = document.createElement("a");
    a.download = `dnd-map-${seed}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded overflow-hidden border border-neutral-800 text-xs font-mono">
          {(["landscape", "civilisation"] as const).map((m, i) => (
            <button
              key={m}
              onClick={() => { setMode(m); setPendingPin(null); setIsAddingPin(false); }}
              className={cn(
                "px-3 py-1.5 transition-colors",
                i > 0 && "border-l border-neutral-800",
                mode === m ? "bg-accent text-white" : "text-neutral-400 hover:bg-neutral-800"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "landscape" && (
          <div className="flex rounded overflow-hidden border border-neutral-800 text-xs font-mono">
            {(["small", "medium", "large"] as const).map((s, i) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={cn(
                  "px-2.5 py-1.5 transition-colors",
                  i > 0 && "border-l border-neutral-800",
                  scale === s ? "bg-accent text-white" : "text-neutral-400 hover:bg-neutral-800"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {mode === "civilisation" && (
          <div className="flex rounded overflow-hidden border border-neutral-800 text-xs font-mono">
            {(["village", "town", "city"] as const).map((s, i) => (
              <button
                key={s}
                onClick={() => setCivSize(s)}
                className={cn(
                  "px-2.5 py-1.5 transition-colors",
                  i > 0 && "border-l border-neutral-800",
                  civSize === s ? "bg-accent text-white" : "text-neutral-400 hover:bg-neutral-800"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => { setSeed(Math.floor(Math.random() * 999983)); setPins([]); setPendingPin(null); setIsAddingPin(false); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono border border-neutral-800 rounded hover:border-accent hover:text-accent transition-colors"
        >
          <RefreshCw size={11} /> new map
        </button>

        <button
          onClick={() => { setIsAddingPin(v => !v); setPendingPin(null); }}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono border rounded transition-colors",
            isAddingPin ? "border-accent text-accent bg-accent/10" : "border-neutral-800 hover:border-accent hover:text-accent"
          )}
        >
          <MapPin size={11} /> {isAddingPin ? "adding pin" : "add pin"}
        </button>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono border border-neutral-800 rounded hover:border-accent hover:text-accent transition-colors ml-auto"
        >
          <Download size={11} /> export PNG
        </button>
      </div>

      {/* Canvas container */}
      <div className="relative w-full rounded-sm overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "rgb(225,210,175)" }}>
            <span className="font-mono text-xs tracking-widest animate-pulse" style={{ color: "rgb(100,80,48)" }}>
              charting unknown lands…
            </span>
          </div>
        )}
        <canvas ref={mapRef} width={W} height={H} className="absolute inset-0 w-full h-full" />
        <canvas
          ref={overlayRef}
          width={W}
          height={H}
          className="absolute inset-0 w-full h-full dnd-overlay"
          onClick={handleCanvasClick}
        />
        {pendingPin && (
          <div
            className="absolute z-20 flex gap-1 items-center"
            style={{
              left: `${Math.min(pendingPin.nx * 100, 68)}%`,
              top: `${Math.max(pendingPin.ny * 100 - 8, 2)}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <input
              ref={labelRef}
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") confirmPin(); if (e.key === "Escape") cancelPin(); }}
              placeholder="add label (optional)"
              maxLength={30}
              className="px-2 py-1 text-xs font-mono rounded border border-neutral-700 bg-neutral-900 text-neutral-100 w-36 outline-none focus:border-accent"
            />
            <button onClick={confirmPin} className="p-1 bg-accent text-white rounded hover:opacity-80"><Check size={10} /></button>
            <button onClick={cancelPin} className="p-1 border border-neutral-700 rounded hover:border-accent text-neutral-400"><X size={10} /></button>
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] text-neutral-600 text-center select-none">
        {isAddingPin
          ? "click the map to place a pin · click an existing pin to remove · esc to cancel"
          : mode === "landscape"
            ? `landscape map · ${scale} scale · seed ${seed}`
            : `civilisation map · ${civSize} · seed ${seed}`}
      </p>
    </div>
  );
}
