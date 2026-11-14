import { createHighway } from "./recovery-highway-background";

const hero = document.querySelector<HTMLElement>(".recovery-hero");
if (hero) {
  const highway = createHighway(hero.querySelector("canvas")!);
  const route = hero.querySelector<SVGPathElement>(".route-bed")!;
  const trace = hero.querySelector<SVGPathElement>(".route-trace")!;
  const truck = hero.querySelector<SVGGElement>(".route-truck")!;
  const wheels = [...hero.querySelectorAll<SVGGElement>(".route-wheel")];
  const label = hero.querySelector<HTMLElement>(".route-label-drop")!;
  const scene = hero.querySelector<HTMLElement>(".route-scene")!;
  const pulse = hero.querySelector<SVGCircleElement>(".map-pin-pulse")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 850px), (pointer: coarse)");
  const length = route.getTotalLength();
  const cycle = 9000;
  const travel = cycle * .76;
  let visible = false;
  let mapVisible = false;
  let delivered = false;
  let phase = 0;
  let frame = 0;
  let previous = 0;
  let pendingRoadTime = 0;
  let lastProgress = -1;
  let lastRouteDraw = 0;

  function drawRoute(progress: number, showPulse: boolean) {
    if (progress !== lastProgress) {
      lastProgress = progress;
      const point = route.getPointAtLength(length * progress);
      truck.setAttribute("transform", `translate(${point.x} ${point.y})`);
      trace.setAttribute("stroke-dashoffset", String(1 - progress));
      for (const wheel of wheels) {
        wheel.setAttribute("transform", `rotate(${progress * 1500} ${wheel.dataset.center})`);
      }
    }
    const complete = progress === 1;
    if (complete !== delivered) {
      delivered = complete;
      label.dataset.delivered = String(complete);
      scene.toggleAttribute("data-arrived", complete);
      if (complete && showPulse) {
        pulse.animate([{ scale: 1, opacity: .85 }, { scale: 2.9, opacity: 0 }], { duration: 900, easing: "ease-out" });
      }
    }
  }

  function tick(now: number) {
    const elapsed = previous ? Math.min(now - previous, 100) : 0;
    previous = now;
    pendingRoadTime += elapsed;
    if (pendingRoadTime >= (compact.matches ? 41 : 31)) {
      highway?.advance(pendingRoadTime);
      pendingRoadTime = 0;
    }
    if (mapVisible) {
      phase = (phase + elapsed) % cycle;
      if (now - lastRouteDraw >= (compact.matches ? 30 : 15)) {
        lastRouteDraw = now;
        drawRoute(Math.min(phase / travel, 1), true);
      }
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    const playing = visible && !document.hidden && !reduced.matches;
    hero!.dataset.playing = String(playing);
    if (playing && !frame) frame = requestAnimationFrame(tick);
    if (!playing && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      pendingRoadTime = 0;
    }
  }

  function updateMotion() {
    phase = 0;
    for (const animation of pulse.getAnimations()) animation.cancel();
    drawRoute(reduced.matches ? 1 : 0, false);
    sync();
  }

  const resize = () => highway?.resize(compact.matches);
  resize();
  new ResizeObserver(resize).observe(hero);
  compact.addEventListener("change", resize);
  reduced.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", sync);
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === hero) visible = entry.isIntersecting;
      if (entry.target === scene) mapVisible = entry.isIntersecting;
    }
    sync();
  });
  observer.observe(hero);
  observer.observe(scene);
  updateMotion();
}
