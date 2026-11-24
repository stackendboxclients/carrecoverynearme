// Pause the map border shimmer when its section is offscreen.
const mapSurround = document.querySelector<HTMLElement>(".recovery-map");
if (mapSurround && "IntersectionObserver" in window) {
  new IntersectionObserver(entries => {
    mapSurround.dataset.seamsVisible = String(entries.some(entry => entry.isIntersecting));
  }).observe(mapSurround);
}


const routeSamples = 96;
const hero = document.querySelector<HTMLElement>(".recovery-hero");
if (hero) {
  startTruckEntrance(hero);
  startHeroMotion(hero);
}

function startTruckEntrance(hero: HTMLElement) {
  const visual = hero.querySelector<HTMLElement>(".hero-ad-visual");
  const drive = hero.querySelector<HTMLElement>(".hero-drive");
  if (!visual || !drive || !("IntersectionObserver" in window)) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let armed = false;
  // Observe the fixed figure, not the moving truck, so its entrance cannot
  // retrigger its own observer. Fully leaving the viewport arms one replay.
  new IntersectionObserver(entries => {
    const entry = entries[0];
    if (!entry.isIntersecting) { armed = true; return; }
    if (entry.intersectionRatio < .2 || !armed) return;
    armed = false;
    if (reduced.matches) return;
    for (const element of [drive, ...drive.querySelectorAll<SVGGElement>(".hero-rim-spin")]) {
      for (const animation of element.getAnimations()) {
        animation.currentTime = 0;
        animation.play();
      }
    }
  }, { threshold: [0, .2] }).observe(visual);
}

function startHeroMotion(hero: HTMLElement) {
  const scene = document.querySelector<HTMLElement>(".recovery-map .route-scene");
  const journeys = Array.from(document.querySelectorAll<SVGGElement>(".recovery-map .map-journey")).flatMap((group, index) => {
    const trace = scene?.querySelector<SVGPathElement>(`.route-trace[data-route="${group.dataset.journey}"]`);
    const route = trace;
    const truck = group.querySelector<SVGGElement>(".route-truck");
    const pulse = group.querySelector<SVGCircleElement>(".map-pin-pulse");
    if (!route || !trace || !truck || !pulse) return [];
    const length = route.getTotalLength();
    return [{ group, trace, truck, pulse, body: group.querySelector<SVGGElement>(".route-truck-body"), facingRight: true, delivered: false,
      positions: Array.from({ length: routeSamples + 1 }, (_, sample) => route.getPointAtLength(length * sample / routeSamples)),
      wheels: Array.from(group.querySelectorAll<SVGGElement>(".route-wheel")),
      cycle: 11000 + index * 2500, delay: index * 1400,
    }];
  });
  if (!scene || !journeys.length) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const step = 1000 / 30;
  let heroVisible = false;
  let mapVisible = false;
  let phase = 0;
  let frame = 0;
  let previous = 0;

  function drawRoute(journey: typeof journeys[number], progress: number, showPulse: boolean) {
    const index = progress * (journey.positions.length - 1);
    const whole = Math.floor(index);
    const point = journey.positions[whole];
    const next = journey.positions[Math.min(whole + 1, journey.positions.length - 1)];
    const fraction = index - whole;
    const x = point.x + (next.x - point.x) * fraction;
    const y = point.y + (next.y - point.y) * fraction;
    // Keep the wide truck artwork inside the map along roads near its edge.
    const truckX = Math.max(127, Math.min(1321, x));
    journey.truck.setAttribute("transform", `translate(${truckX.toFixed(2)} ${y.toFixed(2)})`);
    const dx = next.x - point.x;
    if (Math.abs(dx) > .05) {
      const facingRight = dx > 0;
      if (facingRight !== journey.facingRight) {
        journey.body?.setAttribute("transform", facingRight ? "scale(1 1)" : "scale(-1 1)");
        journey.facingRight = facingRight;
      }
    }
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
