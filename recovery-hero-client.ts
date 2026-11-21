import { createHighway } from "./recovery-highway-background";

const routeSamples = 48;
const hero = document.querySelector<HTMLElement>(".recovery-hero");
if (hero) startHeroMotion(hero);

function startHeroMotion(hero: HTMLElement) {
  const canvas = hero.querySelector<HTMLCanvasElement>(".highway-background canvas");
  const scene = hero.querySelector<HTMLElement>(".route-scene");
  const journeys = Array.from(hero.querySelectorAll<SVGGElement>(".map-journey")).flatMap((group, index) => {
    const trace = scene?.querySelector<SVGPathElement>(`.route-trace[data-route="${group.dataset.journey}"]`);
    const route = trace;
    const truck = group.querySelector<SVGGElement>(".route-truck");
    const pulse = group.querySelector<SVGCircleElement>(".map-pin-pulse");
    if (!route || !trace || !truck || !pulse) return [];
    const length = route.getTotalLength();
    return [{ group, trace, truck, pulse, delivered: false,
      positions: Array.from({ length: routeSamples + 1 }, (_, sample) => route.getPointAtLength(length * sample / routeSamples)),
      wheels: Array.from(group.querySelectorAll<SVGGElement>(".route-wheel")),
      cycle: 11000 + index * 2500, delay: index * 1400,
    }];
  });
  if (!canvas || !scene || !journeys.length) return;
  const highway = document.body.classList.contains("has-site-video") ? null : createHighway(canvas);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 850px)");
  const step = 1000 / 30;
  let heroVisible = false;
  let mapVisible = false;
  let phase = 0;
  let frame = 0;
  let previous = 0;
  let roadElapsed = 0;

  function drawRoute(journey: typeof journeys[number], progress: number, showPulse: boolean) {
    const index = progress * (journey.positions.length - 1);
    const whole = Math.floor(index);
    const point = journey.positions[whole];
    const next = journey.positions[Math.min(whole + 1, journey.positions.length - 1)];
    const fraction = index - whole;
    const x = point.x + (next.x - point.x) * fraction;
    const y = point.y + (next.y - point.y) * fraction;
    journey.truck.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    journey.trace.setAttribute("stroke-dashoffset", String(1 - progress));
    for (const wheel of journey.wheels) {
      wheel.setAttribute("transform", `rotate(${progress * 1500} ${wheel.dataset.center})`);
    }
    const complete = progress === 1;
    if (complete === journey.delivered) return;
    journey.delivered = complete;
    journey.group.dataset.delivered = String(complete);
    if (complete && showPulse) {
      journey.pulse.animate([{ transform: "scale(1)", opacity: .85 }, { transform: "scale(2.9)", opacity: 0 }],
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
        phase += elapsed;
        for (const journey of journeys) {
          const local = Math.max(0, phase - journey.delay) % journey.cycle;
          const progress = Math.min(local / (journey.cycle * .76), 1);
          if (progress < 1 || !journey.delivered) drawRoute(journey, progress, true);
        }
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
    for (const journey of journeys) {
      journey.pulse.getAnimations().forEach(animation => animation.cancel());
      drawRoute(journey, reduced.matches ? 1 : 0, false);
    }
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
