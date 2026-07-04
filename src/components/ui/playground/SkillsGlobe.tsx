import { useEffect, useRef } from "react";
import {
  siReact,
  siTypescript,
  siJavascript,
  siVite,
  siTailwindcss,
  siPnpm,
  siTurborepo,
  siFigma,
  siGit,
  siGithub,
  siStorybook,
  siNodedotjs,
  siCplusplus,
  siCmake,
  siJenkins,
  siBitbucket,
  siDocker,
  siPython,
  siLinux,
  siArduino,
  siHtml5,
  siCss,
} from "simple-icons";

interface SkillIcon {
  key: string;
  path: string;
  hex: string;
}

interface IconNode {
  el: HTMLDivElement;
  baseX: number;
  baseY: number;
  baseZ: number;
}

interface GlobeState {
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
  rafId: number;
  centerX: number;
  centerY: number;
}

const SKILLS: SkillIcon[] = [
  { key: "React",        path: siReact.path,       hex: siReact.hex },
  { key: "TypeScript",   path: siTypescript.path,   hex: siTypescript.hex },
  { key: "JavaScript",   path: siJavascript.path,   hex: siJavascript.hex },
  { key: "Vite",         path: siVite.path,         hex: siVite.hex },
  { key: "Tailwind CSS", path: siTailwindcss.path,  hex: siTailwindcss.hex },
  { key: "pnpm",         path: siPnpm.path,         hex: siPnpm.hex },
  { key: "Turborepo",    path: siTurborepo.path,    hex: siTurborepo.hex },
  { key: "Figma",        path: siFigma.path,        hex: siFigma.hex },
  { key: "Git",          path: siGit.path,          hex: siGit.hex },
  { key: "GitHub",       path: siGithub.path,       hex: siGithub.hex },
  { key: "Storybook",    path: siStorybook.path,    hex: siStorybook.hex },
  { key: "Node.js",      path: siNodedotjs.path,    hex: siNodedotjs.hex },
  { key: "C++",          path: siCplusplus.path,    hex: siCplusplus.hex },
  { key: "CMake",        path: siCmake.path,        hex: siCmake.hex },
  { key: "Jenkins",      path: siJenkins.path,      hex: siJenkins.hex },
  { key: "Bitbucket",    path: siBitbucket.path,    hex: siBitbucket.hex },
  { key: "Docker",       path: siDocker.path,       hex: siDocker.hex },
  { key: "Python",       path: siPython.path,       hex: siPython.hex },
  { key: "Linux",        path: siLinux.path,        hex: siLinux.hex },
  { key: "Arduino",      path: siArduino.path,      hex: siArduino.hex },
  { key: "HTML5",        path: siHtml5.path,        hex: siHtml5.hex },
  { key: "CSS",          path: siCss.path,          hex: siCss.hex },
];

const RADIUS     = 150;
const ICON_SIZE  = 36;
const AUTO_ROT_Y = 0.0012;
const AUTO_ROT_X = 0.0004;
const INERTIA    = 0.95;
const DRAG       = 0.007;
const CULL_Z     = -RADIUS * 0.3;
const SCALE_MIN  = 0.45;

function fibonacciSphere(n: number, r: number): [number, number, number][] {
  const phi = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y  = 1 - (i / (n - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const t  = phi * i;
    return [Math.cos(t) * rr * r, y * r, Math.sin(t) * rr * r];
  });
}

function rotatePoint(
  bx: number, by: number, bz: number,
  rotX: number, rotY: number
): [number, number, number] {
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const x1 =  cosY * bx + sinY * bz;
  const z1 = -sinY * bx + cosY * bz;

  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const y2 =  cosX * by - sinX * z1;
  const z2 =  sinX * by + cosX * z1;

  return [x1, y2, z2];
}

export function SkillsGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current!;

    const state: GlobeState = {
      rotX: 0.3, rotY: 0,
      velX: 0,   velY: 0,
      dragging: false,
      lastX: 0,  lastY: 0,
      rafId: 0,
      centerX: 0, centerY: 0,
    };

    const updateCenter = () => {
      const rect = container.getBoundingClientRect();
      state.centerX = rect.width  / 2;
      state.centerY = rect.height / 2;
    };
    updateCenter();

    const ro = new ResizeObserver(updateCenter);
    ro.observe(container);

    const positions = fibonacciSphere(SKILLS.length, RADIUS);
    const svgNS = "http://www.w3.org/2000/svg";

    const nodes: IconNode[] = SKILLS.map((skill, i) => {
      const [bx, by, bz] = positions[i];

      const wrapper = document.createElement("div");
      wrapper.style.cssText = [
        "position:absolute",
        "top:0",
        "left:0",
        `width:${ICON_SIZE}px`,
        `height:${ICON_SIZE}px`,
        "border-radius:50%",
        "background:rgba(255,255,255,0.06)",
        "border:1px solid rgba(var(--accent-rgb,166,144,196),0.25)",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "will-change:transform,opacity",
        "backdrop-filter:blur(2px)",
        "-webkit-backdrop-filter:blur(2px)",
        "transition:border-color 300ms ease",
      ].join(";");
      wrapper.setAttribute("aria-label", skill.key);
      wrapper.setAttribute("title", skill.key);

      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("width", "20");
      svg.setAttribute("height", "20");
      svg.setAttribute("fill", `#${skill.hex}`);
      svg.style.cssText = "pointer-events:none;display:block;";

      const pathEl = document.createElementNS(svgNS, "path");
      pathEl.setAttribute("d", skill.path);
      svg.appendChild(pathEl);
      wrapper.appendChild(svg);
      container.appendChild(wrapper);

      return { el: wrapper, baseX: bx, baseY: by, baseZ: bz };
    });

    const animate = () => {
      if (!state.dragging) {
        const moving = Math.abs(state.velX) > 0.0002 || Math.abs(state.velY) > 0.0002;
        if (moving) {
          state.rotX += state.velX;
          state.rotY += state.velY;
          state.velX *= INERTIA;
          state.velY *= INERTIA;
        } else {
          state.velX = 0;
          state.velY = 0;
          state.rotX += AUTO_ROT_X;
          state.rotY += AUTO_ROT_Y;
        }
      }

      const projected = nodes.map((node) => {
        const [rx, ry, rz] = rotatePoint(
          node.baseX, node.baseY, node.baseZ,
          state.rotX, state.rotY
        );
        return { node, rx, ry, rz };
      });

      projected.sort((a, b) => a.rz - b.rz);

      projected.forEach(({ node, rx, ry, rz }, zIndex) => {
        const depth   = (rz + RADIUS) / (2 * RADIUS);
        const scale   = SCALE_MIN + depth * (1 - SCALE_MIN);
        const opacity = rz < CULL_Z ? 0 : SCALE_MIN + depth * (1 - SCALE_MIN);

        const screenX = state.centerX + rx;
        const screenY = state.centerY - ry;

        const el = node.el;
        el.style.transform     = `translate(${screenX - ICON_SIZE / 2}px, ${screenY - ICON_SIZE / 2}px) scale(${scale.toFixed(4)})`;
        el.style.opacity       = opacity.toFixed(4);
        el.style.zIndex        = String(zIndex);
        el.style.pointerEvents = rz < CULL_Z ? "none" : "auto";
      });

      state.rafId = requestAnimationFrame(animate);
    };

    state.rafId = requestAnimationFrame(animate);

    const onMouseDown = (e: MouseEvent) => {
      state.dragging = true;
      state.velX = 0;
      state.velY = 0;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      container.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!state.dragging) return;
      const dx = e.clientX - state.lastX;
      const dy = e.clientY - state.lastY;
      state.rotY += dx * DRAG;
      state.rotX += dy * DRAG;
      state.velY  = dx * DRAG;
      state.velX  = dy * DRAG;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    };

    const onMouseUp = () => {
      state.dragging = false;
      container.style.cursor = "grab";
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      state.dragging = true;
      state.velX = 0;
      state.velY = 0;
      state.lastX = t.clientX;
      state.lastY = t.clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!state.dragging) return;
      const t = e.touches[0];
      const dx = t.clientX - state.lastX;
      const dy = t.clientY - state.lastY;
      state.rotY += dx * DRAG;
      state.rotX += dy * DRAG;
      state.velY  = dx * DRAG;
      state.velX  = dy * DRAG;
      state.lastX = t.clientX;
      state.lastY = t.clientY;
    };

    const onTouchEnd = () => {
      state.dragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(state.rafId);
      ro.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      nodes.forEach((n) => n.el.remove());
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "clamp(280px, 100%, 400px)",
          aspectRatio: "1 / 1",
          cursor: "grab",
          overflow: "hidden",
        }}
        aria-label="Interactive skills globe — drag to rotate"
        role="img"
      />
      <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest select-none">
        drag to rotate
      </p>
    </div>
  );
}
