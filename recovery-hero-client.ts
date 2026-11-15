import { createHighway } from "./recovery-highway-background";

const routeSamples = 48;
const hero = document.querySelector<HTMLElement>(".recovery-hero");
if (hero) startHeroMotion(hero);

function startHeroMotion(hero: HTMLElement) {
  const canvas = hero.querySelector<HTMLCanvasElement>(".highway-background canvas");
  const route = hero.querySelector<SVGPathElement>(".route-bed");
  const trace = hero.querySelector<SVGPathElement>(".route-trace");
  const truck = hero.querySelector<SVGGElement>(".route-truck");
  const label = hero.querySelector<HTMLElement>(".route-label-drop");
  const scene = hero.querySelector<HTMLElement>(".route-scene");
  const pulse = hero.querySelector<SVGCircleElement>(".map-pin-pulse");
  if (!canvas || !route || !trace || !truck || !label || !scene || !pulse) return;
  const highway = createHighway(canvas);
  const wheels = Array.from(hero.querySelectorAll<SVGGElement>(".route-wheel"));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 850px)");
  const cycle = 9000;
  const travel = cycle * .76;
  const step = 1000 / 30;
  let positions: DOMPoint[] = [];
  let heroVisible = false;
  let mapVisible = false;
  let delivered = false;
  let phase = 0;
  let frame = 0;
  let previous = 0;
  let roadElapsed = 0;

  function drawRoute(progress: number, showPulse: boolean) {
    if (!positions.length) {
      // Sample the fixed SVG path once, then interpolate between samples.
      const length = route!.getTotalLength();
      positions = Array.from({ length: routeSamples + 1 }, (_, index) => route!.getPointAtLength(length * index / routeSamples));
    }
    const index = progress * (positions.length - 1);
    const whole = Math.floor(index);
    const point = positions[whole];
    const next = positions[Math.min(whole + 1, positions.length - 1)];
    const fraction = index - whole;
    const x = point.x + (next.x - point.x) * fraction;
    const y = point.y + (next.y - point.y) * fraction;
    truck!.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    trace!.setAttribute("stroke-dashoffset", String(1 - progress));
    for (const wheel of wheels) {
      wheel.setAttribute("transform", `rotate(${progress * 1500} ${wheel.dataset.center})`);
    }

    const complete = progress === 1;
    if (complete === delivered) return;
    delivered = complete;
    label!.dataset.delivered = String(complete);
    scene!.toggleAttribute("data-arrived", complete);
    if (complete && showPulse) {
      pulse!.animate([{ transform: "scale(1)", opacity: .85 }, { transform: "scale(2.9)", opacity: 0 }],
        { duration: 900, easing: "ease-out" });
    }
  }

  function tick(now: number) {
    if (now - previous >= step - 1) {
      const elapsed = Math.min(now - previous, 100);
      previous = now;
      if (heroVisible) {
        roadElapsed += elapsed;
        if (roadElapsed >= 64) {
          highway?.advance(roadElapsed);
          roadElapsed = 0;
        }
      }
      if (mapVisible) {
        phase = (phase + elapsed) % cycle;
        const progress = Math.min(phase / travel, 1);
        if (progress < 1 || !delivered) drawRoute(progress, true);
      }
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    const motionAllowed = !document.hidden && !reduced.matches;
    const playing = (heroVisible || mapVisible) && motionAllowed;
    hero.dataset.playing = String(heroVisible && motionAllowed);
    if (playing && !frame) {
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    } else if (!playing && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  function updateMotion() {
    phase = 0;
    pulse!.getAnimations().forEach(animation => animation.cancel());
    drawRoute(reduced.matches ? 1 : 0, false);
    sync();
  }

  const resize = () => highway?.resize(canvas!.clientWidth, canvas!.clientHeight, compact.matches);
  resize();
  new ResizeObserver(resize).observe(hero);
  compact.addEventListener("change", resize);
  reduced.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", sync);

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === hero) heroVisible = entry.isIntersecting;
      if (entry.target === scene) mapVisible = entry.isIntersecting;
    }
    sync();
  });
  observer.observe(hero);
  observer.observe(scene);
  updateMotion();
}
