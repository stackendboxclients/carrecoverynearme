const depth = 144;
const spacing = 5;

export function createHighway(surface: HTMLCanvasElement) {
  const context = surface.getContext("2d", { alpha: false });
  const backdrop = document.createElement("canvas");
  const background = backdrop.getContext("2d", { alpha: false });
  if (!context || !background) return;

  const road = context;
  const base = background;
  let width = 0;
  let height = 0;
  let horizon = 0;
  let scale = 0;
  let distance = 0;
  let compact = false;

  function point(z: number, lane: number, lift = 0): [number, number] {
    const perspective = 1 / (1 + z * .14);
    const curve = Math.sin(z * .045) * z * .018;
    return [
      width * (compact ? .63 : .57) + (lane - curve) * scale * perspective,
      horizon + (height - horizon - lift * scale) * perspective,
    ];
  }

  function strip(path: Path2D, near: number, far: number, left: number, right: number, lift = 0) {
    path.moveTo(...point(near, left, lift));
    path.lineTo(...point(far, left, lift));
    path.lineTo(...point(far, right, lift));
    path.lineTo(...point(near, right, lift));
    path.closePath();
  }

  function ribbon(left: number, right: number, color: string, lift = 0) {
    const path = new Path2D();
    path.moveTo(...point(0, left, lift));
    for (let z = 4; z <= depth; z += 4) path.lineTo(...point(z, left, lift));
    for (let z = depth; z >= 0; z -= 4) path.lineTo(...point(z, right, lift));
    path.closePath();
    base.fillStyle = color;
    base.fill(path);
  }

  function drawBackdrop() {
    const sky = base.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#f4f8fc");
    sky.addColorStop(.44, "#e8edf0");
    sky.addColorStop(1, "#b9c7cf");
    base.fillStyle = sky;
    base.fillRect(0, 0, width, height);
    ribbon(-1.23, 1.23, "#acbcc8");
    ribbon(-1, 1, "#8496a2");

    for (const side of [-1, 1]) {
      ribbon(side - .012, side + .012, "#f3e9d8");
      ribbon(side * 1.12 - .058, side * 1.12 + .058, "#cfdae2", .075);
    }

    for (const z of [9, 22, 42, 69, 106]) {
      const lamp = point(z, -1.01, .47);
      const pole = scale / (1 + z * .14);
      base.beginPath();
      base.moveTo(...point(z, -1.23));
      base.lineTo(...point(z, -1.23, .47));
      base.lineTo(...lamp);
      base.strokeStyle = "#657983";
      base.lineWidth = Math.max(.7, pole * .007);
      base.stroke();
      base.fillStyle = "#ffab5c";
      base.fillRect(lamp[0] - pole * .025, lamp[1], Math.max(1, pole * .045), Math.max(1, pole * .009));
    }
  }

  function draw() {
    if (!width || !height) return;
    road.drawImage(backdrop, 0, 0);
    const lanes = new Path2D();
    const reflectors = new Path2D();
    const offset = distance % (spacing * 2);
    for (let z = depth - offset; z > -spacing; z -= spacing) {
      const near = Math.max(z, 0);
      const far = z + 2;
      if (near >= far) continue;
      strip(lanes, near, far, -.348, -.312);
      strip(lanes, near, far, .312, .348);
      if (z + 1 > near) {
        strip(reflectors, near, z + 1, -1.15, -1.085, .078);
        strip(reflectors, near, z + 1, 1.085, 1.15, .078);
      }
    }
    road.fillStyle = "#f8f6e9";
    road.fill(lanes);
    road.fillStyle = "#ed8b45";
    road.fill(reflectors);

    for (const [index, lane] of [-.64, .02, .65].entries()) {
      const z = 4 + (distance * (index === 0 ? 1.15 : .67) + index * 27) % 86;
      const [x, y] = point(z, lane, .033);
      const size = Math.max(1, scale * .043 / (1 + z * .14));
      road.globalAlpha = Math.min(1, (z - 4) / 8, (90 - z) / 12);
      road.fillStyle = index === 0 ? "#ffe2a3" : "#e96136";
      road.fillRect(x - size, y, size * .6, Math.max(1, size * .28));
      road.fillRect(x + size * .4, y, size * .6, Math.max(1, size * .28));
    }
    road.globalAlpha = 1;
  }

  function resize(cssWidth: number, cssHeight: number, small: boolean) {
    if (!cssWidth || !cssHeight) return;
    const ratio = Math.min(1, (small ? 420 : 720) / cssWidth, 520 / cssHeight);
    const nextWidth = Math.round(cssWidth * ratio);
    const nextHeight = Math.round(cssHeight * ratio);
    if (width === nextWidth && height === nextHeight && compact === small) return;
    compact = small;
    width = surface.width = backdrop.width = nextWidth;
    height = surface.height = backdrop.height = nextHeight;
    horizon = height * (compact ? .25 : .34);
    scale = Math.min(height * .84, width * (compact ? .52 : .46));
    drawBackdrop();
    draw();
  }

  function advance(elapsed: number) {
    distance += elapsed * .017;
    draw();
  }

  return { resize, advance };
}
