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
type BuildingType = "normal" | "castle" | "inn" | "tavern" | "market" | "church" | "blacksmith" | "shop";
interface TownBuilding { x: number; y: number; w: number; h: number; type: BuildingType; }

type RGB = [number, number, number];

// ─── Seeded RNG ──────────────────────────────────────────────────────────────

function seededRand(n: number, seed: number): number {
  let h = ((n | 0) ^ (Math.imul(seed | 0, 2654435761) | 0)) | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) | 0;
  h = Math.imul(h ^ (h >>> 15), 0x45d9f3b) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff;
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
      if (size === "village") {
        const dv = fbm(dn, nx * 5, ny * 5, 3);
        if (dv > 0.62) {
          const t = Math.min(1, (dv - 0.62) / 0.18);
          r = (r + t * (178 - r)) | 0;
          g = (g + t * (152 - g)) | 0;
          b = (b + t * (96 - b)) | 0;
        }
      }
      const i = (py * W + px) * 4;
      d[i] = Math.min(255, r); d[i+1] = Math.min(255, g); d[i+2] = Math.min(255, b); d[i+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (seededRand(751, seed) < (size === "city" ? 0.18 : 0.30)) renderPond(ctx, seed);
}

function renderPond(ctx: CanvasRenderingContext2D, seed: number): void {
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
  ctx.fillStyle = "rgba(145,115,80,0.9)";
  ctx.strokeStyle = "rgba(35,25,12,0.82)";
  ctx.lineWidth = 0.78;
  ctx.fillRect(cx - 7, cy - 11, 14, 11); ctx.strokeRect(cx - 7, cy - 11, 14, 11);
  ctx.beginPath();
  ctx.moveTo(cx + 7, cy - 9); ctx.lineTo(cx + 12, cy - 9); ctx.lineTo(cx + 12, cy - 4);
  ctx.stroke();
  ctx.fillStyle = "rgba(185,155,108,0.9)";
  ctx.fillRect(cx + 10, cy - 7, 5, 4); ctx.strokeRect(cx + 10, cy - 7, 5, 4);
  ctx.restore();
}

function drawTavernIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.fillStyle = "rgba(148,118,82,0.9)";
  ctx.strokeStyle = "rgba(38,28,14,0.82)";
  ctx.lineWidth = 0.78;
  ctx.beginPath(); ctx.ellipse(cx, cy - 11, 7, 2.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillRect(cx - 6, cy - 11, 12, 10); ctx.strokeRect(cx - 6, cy - 11, 12, 10);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 8.5 + i * 3); ctx.lineTo(cx + 6, cy - 8.5 + i * 3);
    ctx.strokeStyle = "rgba(90,68,42,0.45)"; ctx.lineWidth = 0.6; ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(cx, cy - 1, 7, 2.5, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(38,28,14,0.82)"; ctx.lineWidth = 0.78; ctx.stroke();
  ctx.restore();
}

function drawMarketIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.strokeStyle = "rgba(38,28,14,0.82)"; ctx.lineWidth = 0.78;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 5);
  for (let i = 0; i <= 4; i++) {
    const x = cx - 8 + i * 4, y = i % 2 === 0 ? cy - 10 : cy - 5;
    ctx.lineTo(x, y);
  }
  ctx.fillStyle = "rgba(185,155,100,0.88)"; ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy);
  ctx.stroke();
  ctx.restore();
}

function drawChurchIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.fillStyle = "rgba(155,135,105,0.9)";
  ctx.strokeStyle = "rgba(38,28,14,0.82)"; ctx.lineWidth = 0.78;
  ctx.fillRect(cx - 6, cy - 10, 12, 10); ctx.strokeRect(cx - 6, cy - 10, 12, 10);
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 10); ctx.lineTo(cx, cy - 16); ctx.lineTo(cx + 7, cy - 10); ctx.closePath();
  ctx.fillStyle = "rgba(118,95,68,0.9)"; ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18); ctx.lineTo(cx, cy - 24);
  ctx.moveTo(cx - 3, cy - 21); ctx.lineTo(cx + 3, cy - 21);
  ctx.strokeStyle = "rgba(38,28,14,0.88)"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
}

function drawBlacksmithIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.fillStyle = "rgba(100,90,80,0.88)";
  ctx.strokeStyle = "rgba(38,28,14,0.82)"; ctx.lineWidth = 0.78;
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 5);
  ctx.bezierCurveTo(cx - 7, cy - 12, cx + 7, cy - 12, cx + 7, cy - 5);
  ctx.lineTo(cx + 4, cy - 5); ctx.lineTo(cx + 4, cy - 3);
  ctx.lineTo(cx - 4, cy - 3); ctx.lineTo(cx - 4, cy - 5);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillRect(cx - 5, cy - 3, 10, 4); ctx.strokeRect(cx - 5, cy - 3, 10, 4);
  ctx.restore();
}

function drawShopIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.fillStyle = "rgba(175,138,88,0.9)";
  ctx.strokeStyle = "rgba(38,28,14,0.82)";
  ctx.lineWidth = 0.8;
  // Awning arc
  ctx.beginPath(); ctx.arc(cx, cy - 10, 8, Math.PI, 0); ctx.fill(); ctx.stroke();
  // Body
  ctx.fillStyle = "rgba(155,125,88,0.9)";
  ctx.fillRect(cx - 7, cy - 10, 14, 10); ctx.strokeRect(cx - 7, cy - 10, 14, 10);
  // Door
  ctx.fillStyle = "rgba(80,58,32,0.85)"; ctx.fillRect(cx - 2.5, cy - 7, 5, 7);
  // Windows
  ctx.fillStyle = "rgba(200,185,140,0.7)"; ctx.fillRect(cx - 6, cy - 9, 3, 3);
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
      { label: "Market",     draw: (x, y) => drawMarketIcon(ctx, x, y) },
      { label: "Church",     draw: (x, y) => drawChurchIcon(ctx, x, y) },
      { label: "Blacksmith", draw: (x, y) => drawBlacksmithIcon(ctx, x, y) },
      { label: "Shop",       draw: (x, y) => drawShopIcon(ctx, x, y) },
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

interface TownRoad {
  p0: { x: number; y: number };
  cp: { x: number; y: number };
  p1: { x: number; y: number };
}


function generateCivPaths(seed: number, size: CivSize): TownRoad[] {
  const roads: TownRoad[] = [];
  const hx = W / 2 + (seededRand(200, seed) - 0.5) * 120;
  const hy = H / 2 + (seededRand(201, seed) - 0.5) * 80;
  const spokeCount = size === "village" ? 3 + Math.floor(seededRand(202, seed) * 2) :
                     size === "town"    ? 4 + Math.floor(seededRand(202, seed) * 3) :
                                         5 + Math.floor(seededRand(202, seed) * 3);
  for (let i = 0; i < spokeCount; i++) {
    const baseAngle = (i / spokeCount) * Math.PI * 2 + (seededRand(i, seed + 20003) - 0.5) * (Math.PI / spokeCount * 0.75);
    const cos = Math.cos(baseAngle), sin = Math.sin(baseAngle);
    let t = 1e9;
    if (Math.abs(cos) > 0.001) t = Math.min(t, cos > 0 ? (W - hx) / cos : -hx / cos);
    if (Math.abs(sin) > 0.001) t = Math.min(t, sin > 0 ? (H - hy) / sin : -hy / sin);
    const ex = Math.max(0, Math.min(W, hx + cos * t));
    const ey = Math.max(0, Math.min(H, hy + sin * t));
    const cpx = (hx + ex) / 2 + (-sin) * (seededRand(i, seed + 20004) - 0.5) * 280;
    const cpy = (hy + ey) / 2 + cos * (seededRand(i, seed + 20005) - 0.5) * 220;
    roads.push({ p0: { x: hx, y: hy }, cp: { x: cpx, y: cpy }, p1: { x: ex, y: ey } });
  }
  const ringCount = size === "village" ? 0 :
                    size === "town" ? 1 + Math.floor(seededRand(206, seed) * 2) :
                    2 + Math.floor(seededRand(206, seed) * 2);
  for (let r = 0; r < ringCount; r++) {
    const i1 = r % spokeCount;
    const i2 = (i1 + Math.max(1, Math.floor(spokeCount / 2.2)) + r) % spokeCount;
    const r1 = roads[i1], r2 = roads[i2];
    const t1 = 0.30 + seededRand(r, seed + 20009) * 0.28;
    const t2 = 0.30 + seededRand(r, seed + 20010) * 0.28;
    const p1x = (1-t1)**2*r1.p0.x + 2*(1-t1)*t1*r1.cp.x + t1**2*r1.p1.x;
    const p1y = (1-t1)**2*r1.p0.y + 2*(1-t1)*t1*r1.cp.y + t1**2*r1.p1.y;
    const p2x = (1-t2)**2*r2.p0.x + 2*(1-t2)*t2*r2.cp.x + t2**2*r2.p1.x;
    const p2y = (1-t2)**2*r2.p0.y + 2*(1-t2)*t2*r2.cp.y + t2**2*r2.p1.y;
    const cpx = (p1x + p2x) / 2 + (seededRand(r, seed + 20011) - 0.5) * 160;
    const cpy = (p1y + p2y) / 2 + (seededRand(r, seed + 20012) - 0.5) * 130;
    roads.push({ p0: { x: p1x, y: p1y }, cp: { x: cpx, y: cpy }, p1: { x: p2x, y: p2y } });
  }
  return roads;
}


function subdivideBlock(bx: number, by: number, bw: number, bh: number, idx: number): TownBuilding[] {
  const n = 2 + Math.floor(seededRand(idx, 999) * 4);
  const gap = 2;
  const buildings: TownBuilding[] = [];
  if (bw >= bh) {
    const avgW = (bw - gap * (n - 1)) / n;
    let x = bx;
    for (let i = 0; i < n; i++) {
      const w = Math.max(14, avgW + (seededRand(idx * 10 + i, 888) - 0.5) * avgW * 0.35);
      const actual = Math.min(w, bx + bw - x - gap * (n - 1 - i));
      if (actual > 14) buildings.push({ x, y: by, w: actual, h: bh, type: "normal" });
      x += actual + gap;
    }
  } else {
    const avgH = (bh - gap * (n - 1)) / n;
    let y = by;
    for (let i = 0; i < n; i++) {
      const h = Math.max(14, avgH + (seededRand(idx * 10 + i + 500, 777) - 0.5) * avgH * 0.35);
      const actual = Math.min(h, by + bh - y - gap * (n - 1 - i));
      if (actual > 14) buildings.push({ x: bx, y, w: bw, h: actual, type: "normal" });
      y += actual + gap;
    }
  }
  return buildings;
}

function drawWagon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.fillStyle = "rgba(145,108,68,0.85)";
  ctx.strokeStyle = "rgba(55,38,18,0.88)"; ctx.lineWidth = 0.8;
  // Body
  ctx.fillRect(cx - 10, cy - 5, 20, 7); ctx.strokeRect(cx - 10, cy - 5, 20, 7);
  // Wheels
  for (const wx of [cx - 7, cx + 7]) {
    ctx.beginPath(); ctx.arc(wx, cy + 4, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(88,62,32,0.88)"; ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(55,38,18,0.65)"; ctx.lineWidth = 0.6;
    for (let s = 0; s < 4; s++) {
      const a = s * Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(wx, cy + 4);
      ctx.lineTo(wx + Math.cos(a) * 4, cy + 4 + Math.sin(a) * 4); ctx.stroke();
    }
  }
  ctx.restore();
}

function drawProduce(ctx: CanvasRenderingContext2D, cx: number, cy: number, seed: number, idx: number): void {
  ctx.save();
  const n = 2 + Math.floor(seededRand(idx, seed + 70001) * 3);
  for (let i = 0; i < n; i++) {
    const ox = (i % 2) * 9 - 4, oy = Math.floor(i / 2) * -7;
    const rv = seededRand(idx * 5 + i, seed + 70002) * 30 | 0;
    ctx.fillStyle = `rgba(${165 + rv},${130 + (rv >> 1)},82,0.88)`;
    ctx.strokeStyle = "rgba(55,38,18,0.72)"; ctx.lineWidth = 0.6;
    ctx.fillRect(cx + ox - 4, cy + oy - 4, 8, 7);
    ctx.strokeRect(cx + ox - 4, cy + oy - 4, 8, 7);
    // Stave line
    ctx.beginPath();
    ctx.moveTo(cx + ox - 4, cy + oy - 1); ctx.lineTo(cx + ox + 4, cy + oy - 1);
    ctx.strokeStyle = "rgba(90,65,30,0.35)"; ctx.stroke();
  }
  ctx.restore();
}

function renderCastleFootprint(ctx: CanvasRenderingContext2D, b: TownBuilding): void {
  ctx.save();
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const ks = Math.min(b.w, b.h) * 0.88;
  // Courtyard fill
  ctx.fillStyle = "rgba(185,170,140,0.85)";
  ctx.fillRect(cx - ks / 2, cy - ks / 2, ks, ks);
  // Curtain wall
  ctx.strokeStyle = "rgba(45,32,15,0.90)"; ctx.lineWidth = 3.5;
  ctx.strokeRect(cx - ks / 2, cy - ks / 2, ks, ks);
  // Inner keep
  const ki = ks * 0.44;
  ctx.fillStyle = "rgba(88,72,50,0.92)"; ctx.fillRect(cx - ki / 2, cy - ki / 2, ki, ki);
  ctx.strokeStyle = "rgba(35,25,10,0.92)"; ctx.lineWidth = 1.4; ctx.strokeRect(cx - ki / 2, cy - ki / 2, ki, ki);
  // Corner turrets (circles at outer wall corners)
  const turretR = Math.max(5, ks * 0.12);
  for (const [tx, ty] of [[cx - ks / 2, cy - ks / 2], [cx + ks / 2, cy - ks / 2], [cx + ks / 2, cy + ks / 2], [cx - ks / 2, cy + ks / 2]] as [number, number][]) {
    ctx.beginPath(); ctx.arc(tx, ty, turretR, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(78,62,42,0.95)"; ctx.fill();
    ctx.strokeStyle = "rgba(35,25,10,0.90)"; ctx.lineWidth = 1; ctx.stroke();
  }
  // Gatehouse (south side centre)
  ctx.fillStyle = "rgba(35,25,10,0.88)"; ctx.fillRect(cx - 5, cy + ks / 2 - 10, 10, 11);
  ctx.restore();
}

function drawPath(ctx: CanvasRenderingContext2D, road: TownRoad, seed: number, idx: number, style: "dirt" | "cobble", width: number): void {
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (style === "dirt") {
    ctx.beginPath();
    ctx.moveTo(road.p0.x, road.p0.y);
    ctx.quadraticCurveTo(road.cp.x, road.cp.y, road.p1.x, road.p1.y);
    ctx.strokeStyle = "rgba(82,62,36,0.55)"; ctx.lineWidth = width + 4; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(road.p0.x, road.p0.y);
    ctx.quadraticCurveTo(road.cp.x, road.cp.y, road.p1.x, road.p1.y);
    ctx.strokeStyle = "rgba(175,150,100,0.90)"; ctx.lineWidth = width; ctx.stroke();
    const steps = 55;
    for (let s = 0; s <= steps; s++) {
      if (seededRand(s + idx * 100, seed + 60010) > 0.20) continue;
      const t = s / steps;
      const px = (1-t)**2*road.p0.x + 2*(1-t)*t*road.cp.x + t**2*road.p1.x;
      const py = (1-t)**2*road.p0.y + 2*(1-t)*t*road.cp.y + t**2*road.p1.y;
      const dx = 2*(1-t)*(road.cp.x-road.p0.x)+2*t*(road.p1.x-road.cp.x);
      const dy = 2*(1-t)*(road.cp.y-road.p0.y)+2*t*(road.p1.y-road.cp.y);
      const dlen = Math.sqrt(dx*dx+dy*dy)||1;
      const nx2 = -dy/dlen, ny2 = dx/dlen;
      const off = (seededRand(s + idx*100+1, seed+60011)-0.5)*width*0.65;
      const tlen = 3 + seededRand(s + idx*100+2, seed+60012)*7;
      ctx.beginPath();
      ctx.moveTo(px+nx2*off, py+ny2*off);
      ctx.lineTo(px+nx2*off+dx/dlen*tlen, py+ny2*off+dy/dlen*tlen);
      ctx.strokeStyle = "rgba(128,102,62,0.26)"; ctx.lineWidth = 0.7; ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(road.p0.x, road.p0.y);
    ctx.quadraticCurveTo(road.cp.x, road.cp.y, road.p1.x, road.p1.y);
    ctx.strokeStyle = "rgba(65,52,35,0.70)"; ctx.lineWidth = width + 4; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(road.p0.x, road.p0.y);
    ctx.quadraticCurveTo(road.cp.x, road.cp.y, road.p1.x, road.p1.y);
    ctx.strokeStyle = "rgba(110,104,91,0.96)"; ctx.lineWidth = width; ctx.stroke();
    const rowCount = Math.max(2, Math.floor(width / 8));
    const steps = Math.max(60, width * 2.2 | 0);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = (1-t)**2*road.p0.x + 2*(1-t)*t*road.cp.x + t**2*road.p1.x;
      const py = (1-t)**2*road.p0.y + 2*(1-t)*t*road.cp.y + t**2*road.p1.y;
      const dx = 2*(1-t)*(road.cp.x-road.p0.x)+2*t*(road.p1.x-road.cp.x);
      const dy = (2*(1-t)*(road.cp.y-road.p0.y)+2*t*(road.p1.y-road.cp.y));
      const dlen = Math.sqrt(dx*dx+dy*dy)||1;
      const nx2 = -dy/dlen, ny2 = dx/dlen;
      for (let row = 0; row < rowCount; row++) {
        const off = (row - rowCount/2 + 0.5) * 7;
        const jx = (seededRand(s*rowCount+row+idx*600, seed+60001)-0.5)*2.5;
        const jy = (seededRand(s*rowCount+row+idx*600+100, seed+60002)-0.5)*2.5;
        const cx2 = px + nx2*off + jx;
        const cy2 = py + ny2*off + jy;
        const rv = (seededRand(s*rowCount+row+idx*600+200, seed+60003)*28)|0;
        ctx.save(); ctx.translate(cx2, cy2);
        ctx.fillStyle = `rgb(${104+rv},${97+rv},${87+rv})`;
        ctx.fillRect(-3, -2.5, 6, 5);
        ctx.strokeStyle = "rgba(45,35,22,0.52)"; ctx.lineWidth = 0.5;
        ctx.strokeRect(-3, -2.5, 6, 5);
        ctx.restore();
      }
    }
  }
  ctx.restore();
}

function drawHouseTopDown(ctx: CanvasRenderingContext2D, b: TownBuilding, seed: number, idx: number): void {
  const { x, y, w, h } = b;
  const pi = (seededRand(idx, seed + 40006) * 4) | 0;
  const rv = (seededRand(idx + 1, seed + 40015) * 18) | 0;
  const palettes = [
    { wr: 200+rv, wg: 182+rv, wb: 148+rv, rr: Math.min(255,168+rv), rg: 105, rb: 65 },
    { wr: 188+rv, wg: 175+rv, wb: 150+rv, rr: Math.min(255,128+rv), rg: Math.min(255,118+rv), rb: Math.min(255,105+rv) },
    { wr: 190+rv, wg: 178+rv, wb: 152+rv, rr: Math.min(255,148+rv), rg: 115, rb: 72 },
    { wr: 205+rv, wg: 194+rv, wb: 170+rv, rr: Math.min(255,168+rv), rg: Math.min(255,148+rv), rb: Math.min(255,118+rv) },
  ];
  const p = palettes[pi];
  const wt = Math.max(3, Math.min(6, (Math.min(w, h) * 0.13) | 0));
  // Drop shadow
  ctx.fillStyle = "rgba(28,16,4,0.28)";
  ctx.fillRect(x + 4, y + 3, w, h);
  // Wall base
  ctx.fillStyle = `rgb(${Math.min(255,p.wr)},${Math.min(255,p.wg)},${Math.min(255,p.wb)})`;
  ctx.fillRect(x, y, w, h);
  // Roof
  ctx.fillStyle = `rgb(${p.rr},${p.rg},${p.rb})`;
  ctx.fillRect(x + wt, y + wt, w - wt * 2, h - wt * 2);
  // Roof gradient highlight
  const grd = ctx.createLinearGradient(x + wt, y + wt, x + w - wt, y + h - wt);
  grd.addColorStop(0, "rgba(255,255,255,0.14)");
  grd.addColorStop(0.45, "rgba(255,255,255,0.03)");
  grd.addColorStop(1, "rgba(0,0,0,0.20)");
  ctx.fillStyle = grd;
  ctx.fillRect(x + wt, y + wt, w - wt * 2, h - wt * 2);
  // Ridge line along long axis
  ctx.strokeStyle = `rgba(${(p.rr * 0.52) | 0},${(p.rg * 0.48) | 0},${(p.rb * 0.44) | 0},0.82)`;
  ctx.lineWidth = 1.4; ctx.lineCap = "round";
  ctx.beginPath();
  if (w >= h) { ctx.moveTo(x + wt + 4, y + h / 2); ctx.lineTo(x + w - wt - 4, y + h / 2); }
  else        { ctx.moveTo(x + w / 2, y + wt + 4); ctx.lineTo(x + w / 2, y + h - wt - 4); }
  ctx.stroke();
  // Chimney (35% of buildings large enough)
  if (w > 22 && h > 18 && seededRand(idx + 2, seed + 40012) < 0.36) {
    const cs = Math.max(3, (Math.min(w, h) * 0.11) | 0);
    const cpx2 = w >= h ? x + w / 2 - cs / 2 : x + wt + 3;
    const cpy2 = w >= h ? y + wt + 3 : y + h / 2 - cs / 2;
    ctx.fillStyle = `rgb(${Math.min(255,p.wr-28)},${Math.min(255,p.wg-22)},${Math.min(255,p.wb-18)})`;
    ctx.fillRect(cpx2, cpy2, cs, cs);
    ctx.strokeStyle = "rgba(42,28,12,0.82)"; ctx.lineWidth = 0.7;
    ctx.strokeRect(cpx2, cpy2, cs, cs);
  }
  // South & east wall darker (depth)
  ctx.fillStyle = "rgba(28,16,4,0.20)";
  ctx.fillRect(x, y + h - wt, w, wt);
  ctx.fillRect(x + w - wt, y, wt, h);
  // Door on south wall
  if (h > 14 && wt >= 3) {
    const dw = Math.max(3, (w * 0.22) | 0);
    ctx.fillStyle = "rgba(52,32,14,0.90)";
    ctx.fillRect(x + w / 2 - dw / 2, y + h - wt, dw, wt);
  }
  // Windows in wall band
  if (w > 24 && wt >= 3) {
    const ws = Math.max(2, (wt * 0.68) | 0);
    ctx.fillStyle = "rgba(215,195,145,0.58)";
    ctx.fillRect(x + wt / 2 - ws / 2, y + h * 0.38, ws, ws);
    if (w > 32) ctx.fillRect(x + w - wt / 2 - ws / 2, y + h * 0.38, ws, ws);
  }
  // Strong outline
  ctx.strokeStyle = "rgba(42,26,8,0.88)"; ctx.lineWidth = 0.9;
  ctx.strokeRect(x, y, w, h);
}

function renderMarketStalls(ctx: CanvasRenderingContext2D, cx: number, cy: number, seed: number, idx: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 62, 48, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(185,162,118,0.80)"; ctx.fill();
  const stalls = 3 + Math.floor(seededRand(idx, seed + 85001) * 4);
  for (let s = 0; s < stalls; s++) {
    const a = (s / stalls) * Math.PI * 2 + seededRand(s + idx * 10, seed + 85002) * 0.4;
    const d = 20 + seededRand(s + idx * 10, seed + 85003) * 26;
    const scx = cx + Math.cos(a) * d;
    const scy = cy + Math.sin(a) * d;
    const sw = 18 + seededRand(s + idx * 10, seed + 85004) * 14;
    const rv = (seededRand(s + idx * 10, seed + 85006) * 44) | 0;
    ctx.fillStyle = `rgb(${168 + rv},${120 + (rv >> 1)},${52})`;
    ctx.beginPath();
    ctx.moveTo(scx - sw / 2 - 3, scy - 13); ctx.lineTo(scx + sw / 2 + 3, scy - 13);
    ctx.lineTo(scx + sw / 2, scy - 7);      ctx.lineTo(scx - sw / 2, scy - 7);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(55,38,18,0.72)"; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = "rgba(148,118,78,0.92)";
    ctx.fillRect(scx - sw / 2, scy - 7, sw, 10);
    ctx.strokeStyle = "rgba(55,38,18,0.72)"; ctx.lineWidth = 0.8;
    ctx.strokeRect(scx - sw / 2, scy - 7, sw, 10);
    for (let g = 0; g < 3; g++) {
      const gx2 = scx - sw / 2 + 3 + g * ((sw - 6) / 3);
      const gv = (seededRand(s * 10 + g + idx * 100, seed + 85007) * 32) | 0;
      ctx.fillStyle = `rgb(${148 + gv},${98 + (gv >> 1)},42)`;
      ctx.fillRect(gx2, scy - 6, 5, 4);
    }
    ctx.strokeStyle = "rgba(88,62,32,0.88)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(scx, scy - 7); ctx.lineTo(scx, scy + 6); ctx.stroke();
  }
  ctx.restore();
}

function renderDocks(ctx: CanvasRenderingContext2D, seed: number): void {
  ctx.save();
  const side = Math.floor(seededRand(800, seed) * 4);
  const pos  = 0.25 + seededRand(801, seed) * 0.50;
  const dockLen = 95 + seededRand(802, seed) * 65;
  const dockW   = 42 + seededRand(803, seed) * 28;
  const piers   = 2 + Math.floor(seededRand(804, seed) * 3);
  let bx: number, by: number, px: number, py: number, qx: number, qy: number;
  if      (side === 0) { bx = pos*W; by = 0;    px =  0; py =  1; qx = 1; qy = 0; }
  else if (side === 1) { bx = W;     by = pos*H; px = -1; py =  0; qx = 0; qy = 1; }
  else if (side === 2) { bx = pos*W; by = H;     px =  0; py = -1; qx = 1; qy = 0; }
  else                 { bx = 0;     by = pos*H; px =  1; py =  0; qx = 0; qy = 1; }
  const wl = dockLen * 0.42;
  ctx.fillStyle = "rgba(68,105,140,0.80)";
  ctx.beginPath();
  ctx.moveTo(bx - qx*dockW/2,         by - qy*dockW/2);
  ctx.lineTo(bx + qx*dockW/2,         by + qy*dockW/2);
  ctx.lineTo(bx + qx*dockW/2 - px*wl, by + qy*dockW/2 - py*wl);
  ctx.lineTo(bx - qx*dockW/2 - px*wl, by - qy*dockW/2 - py*wl);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "rgba(148,118,78,0.94)";
  ctx.beginPath();
  ctx.moveTo(bx - qx*dockW/2,              by - qy*dockW/2);
  ctx.lineTo(bx + qx*dockW/2,              by + qy*dockW/2);
  ctx.lineTo(bx + qx*dockW/2 + px*dockLen, by + qy*dockW/2 + py*dockLen);
  ctx.lineTo(bx - qx*dockW/2 + px*dockLen, by - qy*dockW/2 + py*dockLen);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(55,38,18,0.82)"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = "rgba(55,38,18,0.28)"; ctx.lineWidth = 0.7;
  for (let pl = 0; pl <= dockLen; pl += 9) {
    ctx.beginPath();
    ctx.moveTo(bx - qx*dockW/2 + px*pl, by - qy*dockW/2 + py*pl);
    ctx.lineTo(bx + qx*dockW/2 + px*pl, by + qy*dockW/2 + py*pl);
    ctx.stroke();
  }
  for (let p2 = 0; p2 < piers; p2++) {
    const t = (p2 + 1) / (piers + 1);
    const ppx = bx + qx*(t*dockW - dockW/2);
    const ppy = by + qy*(t*dockW - dockW/2);
    ctx.fillStyle = "rgba(90,65,38,0.92)";
    ctx.fillRect(ppx - 3, ppy - 4, 6, 8);
    ctx.strokeStyle = "rgba(45,30,12,0.88)"; ctx.lineWidth = 0.8;
    ctx.strokeRect(ppx - 3, ppy - 4, 6, 8);
  }
  const boatCx = bx - qx*(dockW/2 + 22) + px*dockLen*0.55;
  const boatCy = by - qy*(dockW/2 + 22) + py*dockLen*0.55;
  const boatAngle = Math.atan2(-py, -px);
  ctx.save(); ctx.translate(boatCx, boatCy); ctx.rotate(boatAngle);
  ctx.fillStyle = "rgba(105,80,52,0.90)";
  ctx.beginPath();
  ctx.moveTo(-18, 0); ctx.quadraticCurveTo(0, 10, 18, 0);
  ctx.quadraticCurveTo(18, -7, 0, -8); ctx.quadraticCurveTo(-18, -7, -18, 0);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "rgba(45,30,12,0.82)"; ctx.lineWidth = 0.9; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -26);
  ctx.strokeStyle = "rgba(80,58,32,0.90)"; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function renderCivilisation(ctx: CanvasRenderingContext2D, seed: number, size: CivSize): void {
  const hx = W / 2 + (seededRand(200, seed) - 0.5) * 120;
  const hy = H / 2 + (seededRand(201, seed) - 0.5) * 80;

  // ── Layer 0: Flat grass terrain (no mountains, no ocean) ─────────────────
  renderCivTerrain(ctx, seed, size);

  // ── Generate paths first — build proximity bitmap for collision checks ───
  const civPaths = generateCivPaths(seed, size);
  const pathStyle: "dirt" | "cobble" = size === "village" ? "dirt" : "cobble";
  const pathWidth = size === "village" ? 26 : size === "town" ? 36 : 48;
  const MASK_W = 200, MASK_H = 134;
  const roadMask = new Uint8Array(MASK_W * MASK_H);
  const maskMarginPx = pathWidth / 2 + 10;
  const maskR = Math.ceil((maskMarginPx / W) * MASK_W);
  for (const road of civPaths) {
    for (let s = 0; s <= 120; s++) {
      const t = s / 120;
      const spx = (1-t)**2*road.p0.x + 2*(1-t)*t*road.cp.x + t**2*road.p1.x;
      const spy = (1-t)**2*road.p0.y + 2*(1-t)*t*road.cp.y + t**2*road.p1.y;
      const mgx = ((spx / W) * MASK_W) | 0;
      const mgy = ((spy / H) * MASK_H) | 0;
      for (let dy = -maskR; dy <= maskR; dy++) {
        for (let dx = -maskR; dx <= maskR; dx++) {
          if (dx*dx + dy*dy > maskR*maskR) continue;
          const mx = mgx + dx, my = mgy + dy;
          if (mx >= 0 && mx < MASK_W && my >= 0 && my < MASK_H)
            roadMask[my * MASK_W + mx] = 1;
        }
      }
    }
  }
  const isOnRoad = (cpx: number, cpy: number): boolean => {
    const mgx = ((cpx / W) * MASK_W) | 0;
    const mgy = ((cpy / H) * MASK_H) | 0;
    return mgx >= 0 && mgx < MASK_W && mgy >= 0 && mgy < MASK_H && roadMask[mgy * MASK_W + mgx] === 1;
  };

  // ── Layer 1: Docks (town/city only, 38% chance) ──────────────────────────
  if (size !== "village" && seededRand(710, seed) < 0.38) renderDocks(ctx, seed);

  // ── Layer 2: Paths ───────────────────────────────────────────────────────
  for (let i = 0; i < civPaths.length; i++) drawPath(ctx, civPaths[i], seed, i, pathStyle, pathWidth);

  // Hub plaza
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

  // ── Layer 3: Castle (city only) ──────────────────────────────────────────
  let castleCx = -9999, castleCy = -9999;
  const castleW = 188, castleH = 168;
  if (size === "city") {
    const castleAngle = seededRand(220, seed) * Math.PI * 2;
    const castleDist = hubR + 95;
    castleCx = Math.max(castleW/2 + 28, Math.min(W - castleW/2 - 28, hx + Math.cos(castleAngle) * castleDist));
    castleCy = Math.max(castleH/2 + 28, Math.min(H - castleH/2 - 28, hy + Math.sin(castleAngle) * castleDist));
    renderCastleFootprint(ctx, { x: castleCx - castleW/2, y: castleCy - castleH/2, w: castleW, h: castleH, type: "castle" });
  }

  // ── Layer 4: Buildings ───────────────────────────────────────────────────
  const COLS = size === "village" ? 8  : size === "town" ? 11 : 14;
  const ROWS = size === "village" ? 6  : size === "town" ? 8  : 10;
  const skipRate = size === "village" ? 0.35 : size === "town" ? 0.18 : 0.12;
  const lotW = W / COLS, lotH = H / ROWS;
  const allBuildings: Array<{ b: TownBuilding; lotCx: number; lotCy: number }> = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      const lx = col * lotW + (seededRand(idx, seed + 40001) - 0.5) * 4;
      const ly = row * lotH + (seededRand(idx, seed + 40002) - 0.5) * 4;
      const lw = lotW - 4 + (seededRand(idx, seed + 40003) - 0.5) * 8;
      const lh = lotH - 4 + (seededRand(idx, seed + 40004) - 0.5) * 6;
      if (lw < 22 || lh < 22) continue;
      const lcx = lx + lw / 2, lcy = ly + lh / 2;
      if (Math.hypot(lcx - hx, lcy - hy) < hubR + 14) continue;
      if (size === "city" && Math.abs(lcx - castleCx) < castleW/2 + 14 && Math.abs(lcy - castleCy) < castleH/2 + 14) continue;
      if (isOnRoad(lcx, lcy)) continue;
      if (seededRand(idx, seed + 45001) < skipRate) continue;

      const maxSubdivide = size === "village" ? 2 : size === "town" ? 3 : 4;
      const buildings = subdivideBlock(lx + 2, ly + 2, lw - 4, lh - 4, idx);
      const usedBuildings = buildings.slice(0, maxSubdivide);
      for (let bi = 0; bi < usedBuildings.length; bi++) {
        const b = usedBuildings[bi];
        drawHouseTopDown(ctx, b, seed, idx * 10 + bi);
        allBuildings.push({ b, lotCx: lcx, lotCy: lcy });
      }
    }
  }

  // ── Layer 5: Trees (noise-based, not on roads) ───────────────────────────
  const treeNoise = makeNoise(seed + 77551);
  for (let py2 = 4; py2 < H - 4; py2 += 9) {
    for (let px2 = 4; px2 < W - 4; px2 += 9) {
      const nv = fbm(treeNoise, px2 / W * 14, py2 / H * 14, 3);
      if (nv < 0.54) continue;
      if (seededRand(py2 * W / 9 + px2 / 9, seed + 22111) > 0.22) continue;
      if (Math.hypot(px2 - hx, py2 - hy) < hubR + 10) continue;
      if (size === "city" && Math.abs(px2 - castleCx) < castleW/2 + 8 && Math.abs(py2 - castleCy) < castleH/2 + 8) continue;
      if (isOnRoad(px2, py2)) continue;
      drawTree(ctx, px2, py2, 5 + seededRand(py2 * W / 9 + px2 / 9, seed + 33111) * 5);
    }
  }

  // ── Layer 5.5: Market stalls (town/city 35% chance) ─────────────────────
  if (size !== "village" && seededRand(700, seed) < 0.35) {
    const mCount = 1 + (seededRand(701, seed) < 0.45 ? 1 : 0);
    for (let m = 0; m < mCount; m++) {
      const mAngle = seededRand(m * 37 + 702, seed) * Math.PI * 2;
      const mDist = hubR + 50 + seededRand(m * 37 + 703, seed) * 85;
      const mcx = Math.max(72, Math.min(W - 72, hx + Math.cos(mAngle) * mDist));
      const mcy = Math.max(56, Math.min(H - 56, hy + Math.sin(mAngle) * mDist));
      renderMarketStalls(ctx, mcx, mcy, seed, m + 20);
    }
  }

  // ── Layer 6: Environmental props ─────────────────────────────────────────
  const propCount = 5 + Math.floor(seededRand(215, seed) * 6);
  for (let w = 0; w < propCount; w++) {
    const t = seededRand(w + 500, seed + 50001);
    const road = civPaths[Math.floor(t * civPaths.length)];
    const bt = 0.25 + seededRand(w + 501, seed + 50002) * 0.5;
    const wx = (1-bt)**2*road.p0.x + 2*(1-bt)*bt*road.cp.x + bt**2*road.p1.x + (seededRand(w+502,seed+50003)-0.5)*24;
    const wy = (1-bt)**2*road.p0.y + 2*(1-bt)*bt*road.cp.y + bt**2*road.p1.y + (seededRand(w+503,seed+50004)-0.5)*18;
    if (Math.hypot(wx - hx, wy - hy) < hubR + 12) continue;
    if (seededRand(w, seed + 50005) > 0.5) drawWagon(ctx, wx, wy);
    else drawProduce(ctx, wx, wy, seed, w);
  }

  // ── Layer 7: Special building icons ──────────────────────────────────────
  const sorted = allBuildings
    .map((entry, i) => ({ i, d: Math.hypot(entry.lotCx - hx, entry.lotCy - hy) }))
    .sort((a, b) => a.d - b.d);
  const specialOrder: BuildingType[] = size === "village"
    ? ["inn", "tavern", "blacksmith", "shop"]
    : size === "town"
    ? ["church", "inn", "inn", "tavern", "tavern", "blacksmith", "blacksmith", "shop", "shop"]
    : ["church", "inn", "inn", "tavern", "tavern", "tavern", "blacksmith", "blacksmith", "shop", "shop", "shop"];
  const usedLots = new Set<string>();
  let si = 0;
  for (const { i } of sorted) {
    if (si >= specialOrder.length) break;
    const { b, lotCx, lotCy } = allBuildings[i];
    const lotKey = `${lotCx | 0},${lotCy | 0}`;
    if (usedLots.has(lotKey)) continue;
    usedLots.add(lotKey);
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2 + 4;
    const iconScale = Math.max(1.4, Math.min(b.w, b.h) / 16);
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(iconScale, iconScale); ctx.translate(-cx, -cy);
    switch (specialOrder[si]) {
      case "inn":        drawInnIcon(ctx, cx, cy); break;
      case "tavern":     drawTavernIcon(ctx, cx, cy); break;
      case "church":     drawChurchIcon(ctx, cx, cy); break;
      case "blacksmith": drawBlacksmithIcon(ctx, cx, cy); break;
      case "shop":       drawShopIcon(ctx, cx, cy); break;
    }
    ctx.restore();
    si++;
  }

  // ── Town perimeter wall ───────────────────────────────────────────────────
  ctx.save();
  ctx.strokeStyle = "rgba(55,40,20,0.88)"; ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.strokeStyle = "rgba(75,55,28,0.55)"; ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  for (const [tx, ty] of [[8,8],[W-8,8],[W-8,H-8],[8,H-8]] as [number,number][]) {
    ctx.fillStyle = "rgba(55,40,20,0.9)"; ctx.fillRect(tx-8, ty-8, 16, 16);
    ctx.strokeStyle = "rgba(28,18,8,0.88)"; ctx.lineWidth = 0.8; ctx.strokeRect(tx-8, ty-8, 16, 16);
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
