const depth = 144;

export function createHighway(surface: HTMLCanvasElement) {
  const base = surface.getContext("2d", { alpha: false });
  const motion = document.createElement("canvas");
  const effects = motion.getContext("2d");
  if (!base || !effects) return;
  const backdrop = base;
  const traffic = effects;
  motion.className = "highway-motion";
  surface.after(motion);
  let width = 0;
  let height = 0;
  let horizon = 0;
  let scale = 0;
  let compact = false;
  let cssWidth = 0;
  let cssHeight = 0;
  let distance = 0;

  function point(z: number, lane: number, lift = 0): [number, number] {
    const perspective = 1 / (1 + z * .14);
    const curve = Math.sin(z * .045) * z * .018;
    return [
      width * (compact ? .63 : .57) + (lane - curve) * scale * perspective,
      horizon + (height - horizon - lift * scale) * perspective,
    ];
  }

  function ribbon(left: number, right: number, color: string, lift = 0) {
    const path = new Path2D();
    path.moveTo(...point(0, left, lift));
    for (let z = 4; z <= depth; z += 4) path.lineTo(...point(z, left, lift));
    for (let z = depth; z >= 0; z -= 4) path.lineTo(...point(z, right, lift));
    path.closePath();
    backdrop.fillStyle = color;
    backdrop.fill(path);
  }

  function drawBackdrop() {
    const sky = backdrop.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#f4f8fc");
    sky.addColorStop(.44, "#e8edf0");
    sky.addColorStop(1, "#b9c7cf");
    backdrop.fillStyle = sky;
    backdrop.fillRect(0, 0, width, height);
    ribbon(-1.23, 1.23, "#acbcc8");
    ribbon(-1, 1, "#8496a2");

    for (const side of [-1, 1]) {
      ribbon(side - .012, side + .012, "#f3e9d8");
      ribbon(side * 1.12 - .058, side * 1.12 + .058, "#cfdae2", .075);
    }

    for (const z of [9, 22, 42, 69, 106]) {
      const lamp = point(z, -1.01, .47);
      const pole = scale / (1 + z * .14);
      backdrop.beginPath();
      backdrop.moveTo(...point(z, -1.23));
      backdrop.lineTo(...point(z, -1.23, .47));
      backdrop.lineTo(...lamp);
      backdrop.strokeStyle = "#657983";
      backdrop.lineWidth = Math.max(.7, pole * .007);
      backdrop.stroke();
      backdrop.fillStyle = "#ffab5c";
      backdrop.fillRect(lamp[0] - pole * .025, lamp[1], Math.max(1, pole * .045), Math.max(1, pole * .009));
    }
  }

  function strip(path: Path2D, near: number, far: number, left: number, right: number, lift = 0) {
    path.moveTo(...point(near, left, lift));
    path.lineTo(...point(far, left, lift));
    path.lineTo(...point(far, right, lift));
    path.lineTo(...point(near, right, lift));
    path.closePath();
  }

  function drawTraffic() {
    traffic.clearRect(0, 0, width, height);
    const lanes = new Path2D();
    const reflectors = new Path2D();
    const spacing = compact ? 8 : 5;
    for (let z = 90 - distance % spacing; z > -2; z -= spacing) {
      const near = Math.max(z, 0);
      strip(lanes, near, z + 2, -.348, -.312);
      strip(lanes, near, z + 2, .312, .348);
      if (z + 1 > near) {
        strip(reflectors, near, z + 1, -1.15, -1.085, .078);
        strip(reflectors, near, z + 1, 1.085, 1.15, .078);
      }
    }
    traffic.fillStyle = "#f8f6e9";
    traffic.fill(lanes);
    traffic.fillStyle = "#ed8b45";
    traffic.fill(reflectors);
    for (const [index, lane] of [-.64, .02, .65].entries()) {
      const z = 4 + (distance * (index === 0 ? 1.15 : .67) + index * 27) % 86;
      const [x, y] = point(z, lane, .033);
      const size = Math.max(1, scale * .043 / (1 + z * .14));
      traffic.globalAlpha = Math.min(1, (z - 4) / 8, (90 - z) / 12);
      traffic.fillStyle = index === 0 ? "#ffe2a3" : "#e96136";
      traffic.fillRect(x - size, y, size * .6, Math.max(1, size * .28));
      traffic.fillRect(x + size * .4, y, size * .6, Math.max(1, size * .28));
    }
    traffic.globalAlpha = 1;
  }

  function resize(nextWidth: number, nextHeight: number, small: boolean) {
    if (!nextWidth || !nextHeight || (cssWidth === nextWidth && cssHeight === nextHeight && compact === small)) return;
    cssWidth = nextWidth;
    cssHeight = nextHeight;
    compact = small;
    const ratio = Math.min(1, (small ? 420 : 720) / cssWidth, 520 / cssHeight);
    width = surface.width = Math.round(cssWidth * ratio);
    height = surface.height = Math.round(cssHeight * ratio);
    horizon = height * (compact ? .25 : .34);
    scale = Math.min(height * .84, width * (compact ? .52 : .46));
    drawBackdrop();
    // Only the marks and lights change. Keep their separate layer small.
    motion.width = Math.max(1, Math.round(width * (compact ? .65 : .72)));
    motion.height = Math.max(1, Math.round(height * (compact ? .65 : .72)));
    traffic.setTransform(motion.width / width, 0, 0, motion.height / height, 0, 0);
    drawTraffic();
  }

  function advance(elapsed: number) {
    if (!width || !height) return;
    distance += elapsed * .017;
    drawTraffic();
  }

  return { resize, advance };
}
