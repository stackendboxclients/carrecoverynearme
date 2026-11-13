"use client";

import { useEffect, useRef } from "react";

const depth = 42;
const spacing = 4;

export function HighwayBackground({ playing }: { playing: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!surface || !context) return;

    let width = 0;
    let height = 0;
    let distance = 0;
    let frame = 0;
    let previous = 0;

    function draw() {
      if (!context || !width || !height) return;
      const horizon = height * .37;
      const roadScale = Math.min(height * .84, width * .48);
      const project = (z: number, lane: number, elevation = 0) => {
        const perspective = 1 / (1 + z * .14);
        const curve = Math.sin(z * .045) * z * .018;
        return [
          width * .57 + (lane - curve) * roadScale * perspective,
          horizon + (height - horizon - elevation * roadScale) * perspective,
        ] as const;
      };
      const polygon = (color: string, points: ReadonlyArray<readonly [number, number]>) => {
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(...points[0]);
        for (const point of points.slice(1)) context.lineTo(...point);
        context.closePath();
        context.fill();
      };
      const strip = (z: number, end: number, left: number, right: number, color: string, elevation = 0) =>
        polygon(color, [project(z, left, elevation), project(end, left, elevation), project(end, right, elevation), project(z, right, elevation)]);

      const sky = context.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#0a1119");
      sky.addColorStop(.39, "#352921");
      sky.addColorStop(.55, "#171a1c");
      sky.addColorStop(1, "#101518");
      context.fillStyle = sky;
      context.fillRect(0, 0, width, height);

      const offset = distance % spacing;
      for (let z = depth * spacing - offset; z > -spacing; z -= spacing) {
        const near = Math.max(0, z);
        const far = z + spacing;
        const segment = Math.round((distance + z) / spacing);
        strip(near, far, -1.23, 1.23, "#26282a");
        strip(near, far, -1, 1, segment % 2 ? "#222629" : "#23272a");
        for (const side of [-1, 1]) {
          strip(near, far, side - .008, side + .008, "#ab9b7f");
          strip(near, far, side * 1.12 - .055, side * 1.12 + .055, "#474542", .075);
          polygon("#393836", [project(near, side * 1.065), project(far, side * 1.065), project(far, side * 1.065, .075), project(near, side * 1.065, .075)]);
          if (segment % 2 === 0) strip(near, Math.min(far, near + 1), side * 1.08, side * 1.14, "#dc8950", .078);
        }
        for (const lane of [-.33, .33]) {
          const markerEnd = Math.min(far, z + 1.65);
          if (markerEnd > near) strip(near, markerEnd, lane - .012, lane + .012, "#b8b5a7");
        }
        if (segment % 4 === 0 && z >= 0) {
          const base = project(z, -1.21);
          const top = project(z, -1.21, .47);
          const lamp = project(z, -.99, .47);
          const scale = roadScale / (1 + z * .14);
          context.beginPath();
          context.moveTo(...base);
          context.lineTo(...top);
          context.lineTo(...lamp);
          context.strokeStyle = "#65605a";
          context.lineWidth = Math.max(.6, scale * .006);
          context.stroke();
          const reach = Math.max(2, scale * .095);
          const light = context.createRadialGradient(...lamp, 0, ...lamp, reach);
          light.addColorStop(0, "#ffbb747c");
          light.addColorStop(1, "#ff8c4200");
          context.fillStyle = light;
          context.fillRect(lamp[0] - reach, lamp[1] - reach, reach * 2, reach * 2);
          context.fillStyle = "#ffd8a0";
          context.fillRect(lamp[0] - reach * .13, lamp[1], reach * .26, Math.max(1, reach * .08));
        }
      }

      // Stagger the vehicles so their lamps and reflections travel together.
      for (const [index, lane] of [-.65, .02, .66].entries()) {
        const z = 5 + (distance * (index === 0 ? 1.16 : .67) + index * 28) % 87;
        const fade = Math.min(1, (z - 5) / 10, (92 - z) / 14);
        context.globalAlpha = fade;
        const [x, y] = project(z, lane, .035);
        const size = Math.max(1, roadScale * .038 / (1 + z * .14));
        const tone = index === 0 ? "255,213,156" : "255,94,45";
        const glow = context.createRadialGradient(x, y, 0, x, y, size * 3);
        glow.addColorStop(0, "rgba(" + tone + ",.55)");
        glow.addColorStop(1, "rgba(" + tone + ",0)");
        context.fillStyle = glow;
        context.fillRect(x - size * 3, y - size * 3, size * 6, size * 6);
        strip(z, z + 5, lane - .048, lane + .048, "rgba(" + tone + ",.12)");
        context.fillStyle = "rgb(" + tone + ")";
        context.fillRect(x - size, y, size * .55, Math.max(1, size * .2));
        context.fillRect(x + size * .45, y, size * .55, Math.max(1, size * .2));
      }
      context.globalAlpha = 1;
    }

    const tick = (now: number) => {
      if (previous) distance += Math.min(now - previous, 55) * .017;
      previous = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      width = surface.clientWidth;
      height = surface.clientHeight;
      const ratio = Math.min(devicePixelRatio, 1.5);
      surface.width = Math.round(width * ratio);
      surface.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (playing && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    resize();
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [playing]);

  return (
    <div className="highway-background" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
