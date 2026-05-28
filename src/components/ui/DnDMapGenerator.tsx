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
interface MountainFeature { cx: number; cy: number; size: number; }
interface LandscapeLocation { type: "city" | "town"; cx: number; cy: number; }
interface RiverPoint { gx: number; gy: number; }

type BuildingType = "normal" | "castle" | "inn" | "tavern" | "market" | "church" | "blacksmith";
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

function buildMaps(seed: number): { hm: Float32Array; am: Float32Array; sm: Float32Array } {
  const tn = makeNoise(seed);
  const an = makeNoise(seed + 99991);
  const dn = makeNoise(seed + 49999);

  const hm = new Float32Array(HM_W * HM_H);
  const am = new Float32Array(HM_W * HM_H);

  const marginX = 0.06 + seededRand(10, seed) * 0.05;
  const marginY = 0.08 + seededRand(11, seed) * 0.05;

  let maxH = 0;
  for (let gy = 0; gy < HM_H; gy++) {
    for (let gx = 0; gx < HM_W; gx++) {
      const nx = gx / HM_W, ny = gy / HM_H;
      const raw = fbm(tn, nx * 2.0, ny * 2.0, 6) + fbm(dn, nx * 8, ny * 8, 3) * 0.08;
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
  { t: 0.75, rgb: [142, 130, 90] },
  { t: 0.82, rgb: [168, 158, 138] },
  { t: 0.90, rgb: [205, 196, 180] },
  { t: 1.01, rgb: [238, 234, 226] },
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
  if (arid > 0.62 && h > 0.41 && h < 0.65) {
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
  const count = 2 + Math.floor(seededRand(seed, 77777) * 4);
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
    ctx.lineWidth = 2.8;
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
    ctx.lineWidth = 0.9;
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

// ─── Mountains ────────────────────────────────────────────────────────────────

function drawMountain(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const hw = size, h = size * 1.45, base = cy + size * 0.3, peak = cy - h;

  // Cast shadow
  ctx.beginPath();
  ctx.moveTo(cx - hw * 0.8, base + 3);
  ctx.lineTo(cx + hw + 5, base + 3);
  ctx.lineTo(cx + hw * 0.5 + 5, peak + h * 0.3 + 3);
  ctx.closePath();
  ctx.fillStyle = "rgba(18,12,5,0.16)";
  ctx.fill();

  // Dark (shadow) face
  ctx.beginPath();
  ctx.moveTo(cx, peak); ctx.lineTo(cx + hw, base); ctx.lineTo(cx - hw * 0.08, base); ctx.closePath();
  ctx.fillStyle = "rgb(100,85,65)";
  ctx.fill();

  // Light face
  ctx.beginPath();
  ctx.moveTo(cx, peak); ctx.lineTo(cx - hw, base); ctx.lineTo(cx - hw * 0.08, base); ctx.closePath();
  ctx.fillStyle = "rgb(192,180,160)";
  ctx.fill();

  // Snow cap
  const sh = h * 0.27, sy = peak + sh, sw = hw * (sh / h);
  ctx.beginPath();
  ctx.moveTo(cx, peak); ctx.lineTo(cx - sw, sy); ctx.lineTo(cx + sw, sy); ctx.closePath();
  ctx.fillStyle = "rgba(238,234,226,0.96)";
  ctx.fill();

  // Hatching on dark face
  const hc = 3 + Math.floor(size / 8);
  ctx.strokeStyle = "rgba(68,52,36,0.48)";
  ctx.lineWidth = 0.65;
  for (let i = 0; i < hc; i++) {
    const t = (i + 1) / (hc + 1);
    ctx.beginPath();
    ctx.moveTo(cx + t * hw * 0.88, peak + h * t);
    ctx.lineTo(cx + t * hw * 0.88 - hw * 0.16, peak + h * t + size * 0.2);
    ctx.stroke();
  }

  // Ridge outline
  ctx.beginPath();
  ctx.moveTo(cx - hw, base); ctx.lineTo(cx, peak); ctx.lineTo(cx + hw, base);
  ctx.strokeStyle = "rgba(38,28,16,0.82)";
  ctx.lineWidth = 0.95;
  ctx.stroke();

  ctx.restore();
}

function placeMountains(hm: Float32Array, seed: number): MountainFeature[] {
  const mts: MountainFeature[] = [];
  const occ = new Set<string>();
  for (let gy = 3; gy < HM_H - 3; gy++) {
    for (let gx = 3; gx < HM_W - 3; gx++) {
      if (hm[gy * HM_W + gx] < 0.75) continue;
      if (seededRand(gy * HM_W + gx + 2, seed + 66666) > 0.11) continue;
      let clear = true;
      for (let dy = -5; dy <= 5 && clear; dy++)
        for (let dx = -5; dx <= 5 && clear; dx++)
          if (occ.has(`${gx+dx},${gy+dy}`)) clear = false;
      if (!clear) continue;
      occ.add(`${gx},${gy}`);
      mts.push({ cx: (gx / HM_W) * W, cy: (gy / HM_H) * H, size: 14 + seededRand(mts.length * 3, seed) * 20 });
    }
  }
  return mts;
}

function renderMountains(ctx: CanvasRenderingContext2D, mts: MountainFeature[]): void {
  for (const mt of [...mts].sort((a, b) => a.cy - b.cy))
    drawMountain(ctx, mt.cx, mt.cy, mt.size);
}

// ─── Desert Dunes ─────────────────────────────────────────────────────────────

function renderDesertTexture(ctx: CanvasRenderingContext2D, hm: Float32Array, am: Float32Array, seed: number): void {
  ctx.save();
  for (let gy = 1; gy < HM_H - 1; gy += 2) {
    for (let gx = 1; gx < HM_W - 1; gx += 2) {
      const h = hm[gy * HM_W + gx], arid = am[gy * HM_W + gx];
      if (!(arid > 0.62 && h > 0.41 && h < 0.65)) continue;
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
  ctx.lineWidth = 0.8;

  // Central keep
  ctx.fillRect(cx - 9, cy - 14, 18, 14);
  ctx.strokeRect(cx - 9, cy - 14, 18, 14);
  // Crenellations
  for (let c = 0; c < 4; c++) {
    if (c % 2 === 0) { ctx.fillRect(cx - 9 + c * 4.5, cy - 17, 4.5, 3); }
  }
  // Side towers
  ctx.fillRect(cx - 14, cy - 10, 6, 10); ctx.strokeRect(cx - 14, cy - 10, 6, 10);
  ctx.fillRect(cx + 8, cy - 10, 6, 10); ctx.strokeRect(cx + 8, cy - 10, 6, 10);
  // Gate arch
  ctx.beginPath();
  ctx.arc(cx, cy - 3, 3, Math.PI, 0);
  ctx.fillStyle = "rgba(45,32,18,0.9)"; ctx.fill();

  ctx.restore();
}

function drawTownIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.fillStyle = "rgba(162,138,102,0.92)";
  ctx.strokeStyle = "rgba(38,28,12,0.85)";
  ctx.lineWidth = 0.75;
  ctx.fillRect(cx - 6, cy - 6, 12, 6); ctx.strokeRect(cx - 6, cy - 6, 12, 6);
  ctx.beginPath();
  ctx.moveTo(cx - 7.5, cy - 6); ctx.lineTo(cx, cy - 13); ctx.lineTo(cx + 7.5, cy - 6); ctx.closePath();
  ctx.fillStyle = "rgba(115,88,58,0.9)"; ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(45,32,18,0.7)"; ctx.fillRect(cx - 2, cy - 5, 4, 3);
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

function renderLandscape(ctx: CanvasRenderingContext2D, seed: number): void {
  ctx.fillStyle = "rgb(230,216,180)"; ctx.fillRect(0, 0, W, H);
  const { hm, am, sm } = buildMaps(seed);
  renderTerrain(ctx, hm, am, sm);
  renderWaterWaves(ctx, hm, seed);
  const rivers = generateRivers(hm, seed);
  renderRivers(ctx, rivers);
  const forests = placeForests(hm, am, seed);
  renderForests(ctx, forests, seed);
  const mts = placeMountains(hm, seed);
  renderMountains(ctx, mts);
  renderDesertTexture(ctx, hm, am, seed);
  const locs = placeLandscapeLocations(hm, rivers, seed);
  for (const loc of locs) {
    if (loc.type === "city") drawCityIcon(ctx, loc.cx, loc.cy);
    else drawTownIcon(ctx, loc.cx, loc.cy);
  }
  drawCompassRose(ctx, 64, H - 64, 38);
  drawBorder(ctx, seed);
  postProcess(ctx, seed);
}

// ─── Town ─────────────────────────────────────────────────────────────────────

interface TownRoad {
  p0: { x: number; y: number };
  cp: { x: number; y: number };
  p1: { x: number; y: number };
}

interface TownPark { cx: number; cy: number; rx: number; ry: number; angle: number; }

function generateTownRoads(seed: number): TownRoad[] {
  const roads: TownRoad[] = [];
  const hx = W / 2 + (seededRand(200, seed) - 0.5) * 120;
  const hy = H / 2 + (seededRand(201, seed) - 0.5) * 80;
  const spokeCount = 5 + Math.floor(seededRand(202, seed) * 3);

  for (let i = 0; i < spokeCount; i++) {
    const baseAngle = (i / spokeCount) * Math.PI * 2 + (seededRand(i, seed + 20003) - 0.5) * (Math.PI / spokeCount * 0.7);
    const cos = Math.cos(baseAngle), sin = Math.sin(baseAngle);
    let t = 1e9;
    if (Math.abs(cos) > 0.001) t = Math.min(t, cos > 0 ? (W - hx) / cos : -hx / cos);
    if (Math.abs(sin) > 0.001) t = Math.min(t, sin > 0 ? (H - hy) / sin : -hy / sin);
    const ex = Math.max(0, Math.min(W, hx + cos * t));
    const ey = Math.max(0, Math.min(H, hy + sin * t));
    const cpx = (hx + ex) / 2 + (-sin) * (seededRand(i, seed + 20004) - 0.5) * 160;
    const cpy = (hy + ey) / 2 + cos * (seededRand(i, seed + 20005) - 0.5) * 120;
    roads.push({ p0: { x: hx, y: hy }, cp: { x: cpx, y: cpy }, p1: { x: ex, y: ey } });
  }

  const ringCount = 1 + Math.floor(seededRand(206, seed) * 2);
  for (let r = 0; r < ringCount; r++) {
    const i1 = (r * 2) % spokeCount;
    const i2 = (i1 + 2) % spokeCount;
    const r1 = roads[i1], r2 = roads[i2];
    const t1 = 0.4 + seededRand(r, seed + 20009) * 0.2;
    const t2 = 0.4 + seededRand(r, seed + 20010) * 0.2;
    const p1x = (1-t1)**2*r1.p0.x + 2*(1-t1)*t1*r1.cp.x + t1**2*r1.p1.x;
    const p1y = (1-t1)**2*r1.p0.y + 2*(1-t1)*t1*r1.cp.y + t1**2*r1.p1.y;
    const p2x = (1-t2)**2*r2.p0.x + 2*(1-t2)*t2*r2.cp.x + t2**2*r2.p1.x;
    const p2y = (1-t2)**2*r2.p0.y + 2*(1-t2)*t2*r2.cp.y + t2**2*r2.p1.y;
    const cpx = (p1x + p2x) / 2 + (seededRand(r, seed + 20011) - 0.5) * 80;
    const cpy = (p1y + p2y) / 2 + (seededRand(r, seed + 20012) - 0.5) * 80;
    roads.push({ p0: { x: p1x, y: p1y }, cp: { x: cpx, y: cpy }, p1: { x: p2x, y: p2y } });
  }

  return roads;
}

function generateParks(seed: number): TownPark[] {
  const parks: TownPark[] = [];
  const count = 3 + Math.floor(seededRand(300, seed) * 3);
  for (let i = 0; parks.length < count && i < count * 4; i++) {
    const cx = 60 + seededRand(i, seed + 30001) * (W - 120);
    const cy = 50 + seededRand(i, seed + 30002) * (H - 100);
    if (Math.hypot(cx - W / 2, cy - H / 2) < 90) continue;
    parks.push({
      cx, cy,
      rx: 40 + seededRand(i, seed + 30003) * 50,
      ry: 30 + seededRand(i, seed + 30004) * 40,
      angle: seededRand(i, seed + 30005) * Math.PI,
    });
  }
  return parks;
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

function renderTown(ctx: CanvasRenderingContext2D, seed: number): void {
  ctx.fillStyle = "rgb(228,213,178)";
  ctx.fillRect(0, 0, W, H);

  // Layer 1: building coverage across full canvas
  const allBuildings: Array<{ b: TownBuilding; lotCx: number; lotCy: number }> = [];
  const COLS = 18, ROWS = 14;
  const lotW = W / COLS, lotH = H / ROWS;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      const lx = col * lotW + (seededRand(idx, seed + 40001) - 0.5) * 4;
      const ly = row * lotH + (seededRand(idx, seed + 40002) - 0.5) * 4;
      const lw = lotW - 6 + (seededRand(idx, seed + 40003) - 0.5) * 8;
      const lh = lotH - 5 + (seededRand(idx, seed + 40004) - 0.5) * 6;
      if (lw < 20 || lh < 20) continue;
      const buildings = subdivideBlock(lx + 3, ly + 3, lw - 6, lh - 6, idx);
      for (const b of buildings) {
        const rv = seededRand((b.x | 0) * 7 + (b.y | 0), seed + 40005) * 18 | 0;
        ctx.fillStyle = `rgb(${200 + rv},${183 + rv},${152 + rv})`;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = "rgba(130,105,78,0.35)";
        ctx.fillRect(b.x, b.y + b.h - 3, b.w, 3);
        ctx.fillRect(b.x + b.w - 3, b.y, 3, b.h);
        ctx.strokeStyle = "rgba(38,28,12,0.58)";
        ctx.lineWidth = 0.6;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        allBuildings.push({ b, lotCx: lx + lw / 2, lotCy: ly + lh / 2 });
      }
    }
  }

  // Layer 2: parks (green ellipses with trees)
  const parks = generateParks(seed);
  for (let i = 0; i < parks.length; i++) {
    const p = parks[i];
    ctx.save();
    ctx.translate(p.cx, p.cy);
    ctx.rotate(p.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(108,138,72,0.88)";
    ctx.fill();
    ctx.strokeStyle = "rgba(68,95,42,0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    const treeCount = 4 + Math.floor(seededRand(i, seed + 30010) * 5);
    for (let t = 0; t < treeCount; t++) {
      const a = seededRand(i * 20 + t, seed + 30011) * Math.PI * 2;
      const dr = seededRand(i * 20 + t + 100, seed + 30012);
      drawTree(ctx, p.cx + Math.cos(a) * dr * p.rx * 0.72, p.cy + Math.sin(a) * dr * p.ry * 0.72, 5 + seededRand(i * 20 + t + 200, seed + 30013) * 4);
    }
  }

  // Layer 3: organic roads (Bézier, cut through buildings)
  const roads = generateTownRoads(seed);
  for (const road of roads) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(road.p0.x, road.p0.y);
    ctx.quadraticCurveTo(road.cp.x, road.cp.y, road.p1.x, road.p1.y);
    ctx.strokeStyle = "rgba(112,100,82,0.95)";
    ctx.lineWidth = 22;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(road.p0.x, road.p0.y);
    ctx.quadraticCurveTo(road.cp.x, road.cp.y, road.p1.x, road.p1.y);
    ctx.strokeStyle = "rgba(145,132,110,0.45)";
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.restore();
  }

  // Layer 4: open town center plaza
  const hx = W / 2 + (seededRand(200, seed) - 0.5) * 120;
  const hy = H / 2 + (seededRand(201, seed) - 0.5) * 80;
  const plazaW = 80 + seededRand(213, seed) * 30;
  const plazaH = 60 + seededRand(214, seed) * 28;
  ctx.fillStyle = "rgba(215,200,165,0.95)";
  ctx.fillRect(hx - plazaW / 2, hy - plazaH / 2, plazaW, plazaH);
  ctx.strokeStyle = "rgba(80,60,30,0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(hx - plazaW / 2, hy - plazaH / 2, plazaW, plazaH);

  // Layer 5: special building icons nearest the hub (drawn over roads)
  const sorted = allBuildings
    .map((entry, i) => ({ i, d: Math.hypot(entry.lotCx - hx, entry.lotCy - hy) }))
    .sort((a, b) => a.d - b.d);
  const specialOrder: BuildingType[] = ["castle", "church", "inn", "inn", "tavern", "tavern", "tavern", "market", "blacksmith", "blacksmith"];
  const usedLots = new Set<string>();
  let si = 0;
  for (const { i } of sorted) {
    if (si >= specialOrder.length) break;
    const { b, lotCx, lotCy } = allBuildings[i];
    const lotKey = `${lotCx | 0},${lotCy | 0}`;
    if (usedLots.has(lotKey)) continue;
    usedLots.add(lotKey);
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2 + 4;
    switch (specialOrder[si]) {
      case "castle": drawTownCastleIcon(ctx, cx, cy); break;
      case "inn": drawInnIcon(ctx, cx, cy); break;
      case "tavern": drawTavernIcon(ctx, cx, cy); break;
      case "market": drawMarketIcon(ctx, cx, cy); break;
      case "church": drawChurchIcon(ctx, cx, cy); break;
      case "blacksmith": drawBlacksmithIcon(ctx, cx, cy); break;
    }
    si++;
  }

  // Town wall (full canvas perimeter)
  ctx.save();
  ctx.strokeStyle = "rgba(55,40,20,0.88)";
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.strokeStyle = "rgba(75,55,28,0.55)";
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, W - 40, H - 40);
  for (const [tx, ty] of [[8, 8], [W - 8, 8], [W - 8, H - 8], [8, H - 8]] as [number, number][]) {
    ctx.fillStyle = "rgba(55,40,20,0.9)";
    ctx.fillRect(tx - 8, ty - 8, 16, 16);
    ctx.strokeStyle = "rgba(28,18,8,0.88)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(tx - 8, ty - 8, 16, 16);
  }
  ctx.restore();

  drawCompassRose(ctx, W - 64, H - 64, 38);
  drawBorder(ctx, seed);
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
  const [mode, setMode] = useState<"landscape" | "town">("landscape");
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 999983));
  const [pins, setPins] = useState<UserPin[]>([]);
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
      if (mode === "landscape") renderLandscape(ctx, seed);
      else renderTown(ctx, seed);
      setIsGenerating(false);
    }, 0);
    return () => clearTimeout(tid);
  }, [seed, mode]);

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
          {(["landscape", "town"] as const).map((m, i) => (
            <button
              key={m}
              onClick={() => { setMode(m); setPendingPin(null); }}
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

        <button
          onClick={() => { setSeed(Math.floor(Math.random() * 999983)); setPins([]); setPendingPin(null); }}
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
          : `${mode} map · seed ${seed}`}
      </p>
    </div>
  );
}
