const depth = 42;
const spacing = 4;

export function createHighway(surface: HTMLCanvasElement) {
  const drawingContext = surface.getContext("2d", { alpha: false });
  if (!drawingContext) return;
  const context = drawingContext;
  let width = 0;
  let height = 0;
  let sky: CanvasGradient;
  let distance = 0;

  function draw() {
    if (!width || !height) return;
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
      for (let index = 1; index < points.length; index++) {
        context.lineTo(points[index][0], points[index][1]);
      }
      context.closePath();
      context.fill();
    };
    const strip = (z: number, end: number, left: number, right: number, color: string, elevation = 0) =>
      polygon(color, [project(z, left, elevation), project(end, left, elevation), project(end, right, elevation), project(z, right, elevation)]);

    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    const offset = distance % spacing;
    for (let z = depth * spacing - offset; z > -spacing; z -= spacing) {
      const near = Math.max(0, z);
      const far = z + spacing;
      const segment = Math.round((distance + z) / spacing);
      strip(near, far, -1.23, 1.23, "#b9c5cd");
      strip(near, far, -1, 1, segment % 2 ? "#8797a1" : "#8a9aa4");
      for (const side of [-1, 1]) {
        strip(near, far, side - .008, side + .008, "#ddd3be");
        strip(near, far, side * 1.12 - .055, side * 1.12 + .055, "#adbcc5", .075);
        polygon("#80919b", [project(near, side * 1.065), project(far, side * 1.065), project(far, side * 1.065, .075), project(near, side * 1.065, .075)]);
        if (segment % 2 === 0) strip(near, Math.min(far, near + 1), side * 1.08, side * 1.14, "#ef9b58", .078);
      }
      for (const lane of [-.33, .33]) {
        const markerEnd = Math.min(far, z + 1.65);
        if (markerEnd > near) strip(near, markerEnd, lane - .012, lane + .012, "#eff0e8");
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
        context.strokeStyle = "#7d8586";
        context.lineWidth = Math.max(.6, scale * .006);
        context.stroke();
        const reach = Math.max(2, scale * .095);
        const light = context.createRadialGradient(...lamp, 0, ...lamp, reach);
        light.addColorStop(0, "#ffad5caa");
        light.addColorStop(1, "#ff8c4200");
        context.fillStyle = light;
        context.fillRect(lamp[0] - reach, lamp[1] - reach, reach * 2, reach * 2);
        context.fillStyle = "#fff0cc";
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

  function resize(compact: boolean) {
    width = surface.clientWidth;
    height = surface.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio, compact ? 1 : 1.25);
    surface.width = Math.round(width * ratio);
    surface.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#fcfefe");
    sky.addColorStop(.39, "#f5f3f0");
    sky.addColorStop(.55, "#dce4e9");
    sky.addColorStop(1, "#b9c7cf");
    draw();
  }

  function advance(elapsed: number) {
    distance += elapsed * .017;
    draw();
  }

  return { resize, advance };
}
