"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useSpring, useTransform } from "motion/react";

type Point = readonly [number, number];

const ramp = ([a, b, c, d]: Point[], t: number): Point => {
  const s = 1 - t;
  return [
    s ** 3 * a[0] + 3 * s * s * t * b[0] + 3 * s * t * t * c[0] + t ** 3 * d[0],
    s ** 3 * a[1] + 3 * s * s * t * b[1] + 3 * s * t * t * c[1] + t ** 3 * d[1],
  ];
};

// Cross-sections share a vanishing point but widen at different rates.
const ground: Point[] = [[835, 646], [387, 752], [940, 761], [1660, 910]];
const deck: Point[] = [[575, 607], [723, 443], [880, 189], [1660, -19]];
const point = (bridge: boolean, t: number, lane = 0, drop = 0): Point => {
  const [x, y] = ramp(bridge ? deck : ground, t);
  const w = bridge ? 4 + 103 * t ** 2 : 3 + 224 * t ** 2.4;
  return [x + (bridge ? -0.3 : 0.34) * w * lane, y + w * lane + drop];
};
const fmt = (p: Point) => p.map(n => n.toFixed(1)).join(" ");
const samples = (bridge: boolean, lane: number, drop = 0) =>
  Array.from({ length: 65 }, (_, i) => fmt(point(bridge, i / 64, lane, drop)));
const line = (bridge: boolean, lane: number, drop = 0) => "M" + samples(bridge, lane, drop).join("L");
const band = (bridge: boolean, a: number, b: number, top = 0, bottom = 0) =>
  "M" + [...samples(bridge, a, top), ...samples(bridge, b, bottom).reverse()].join("L") + "Z";
const range = (n: number, from: number, to: number, power = 1) =>
  Array.from({ length: n }, (_, i) => from + (to - from) * (i / Math.max(1, n - 1)) ** power);
const mark = (bridge: boolean, t: number, lane: number, length: number, drop = 0) =>
  "M" + fmt(point(bridge, t, lane, drop)) + "L" + fmt(point(bridge, t + length, lane, drop));

export function HighwayBackground({ playing }: { playing: boolean }) {
  const background = useRef<HTMLDivElement>(null);
  const id = useId();
  const fill = (key: string) => `url(#${id}-${key})`;
  const pointerX = useSpring(0, { stiffness: 78, damping: 22 });
  const pointerY = useSpring(0, { stiffness: 78, damping: 22 });
  const farX = useTransform(pointerX, value => value * 0.3);
  const farY = useTransform(pointerY, value => value * 0.3);
  const midX = useTransform(pointerX, value => value * 0.65);
  const midY = useTransform(pointerY, value => value * 0.65);

  useEffect(() => {
    const layer = background.current;
    const hero = layer?.parentElement;
    if (!layer || !hero) return;
    const reset = () => { pointerX.set(0); pointerY.set(0); };
    const move = (event: PointerEvent) => {
      if (!playing || document.hidden || event.pointerType !== "mouse") return;
      const bounds = hero.getBoundingClientRect();
      const amplitude = Math.min(11, bounds.width / 135);
      pointerX.set(((event.clientX - bounds.left) / bounds.width - .5) * amplitude * 2);
      pointerY.set(((event.clientY - bounds.top) / bounds.height - .5) * amplitude * 1.3);
    };
    const sync = () => {
      layer.dataset.documentVisible = String(!document.hidden);
      if (document.hidden) reset();
    };
    if (!playing) reset();
    sync();
    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", reset);
    document.addEventListener("visibilitychange", sync);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [playing, pointerX, pointerY]);

  return (
    <div ref={background} className="highway-background" aria-hidden="true">
      <motion.div className="highway-atmosphere" style={{ x: farX, y: farY }}>
        <div className="highway-haze highway-haze-high" />
        <div className="highway-haze highway-haze-low" />
      </motion.div>
      <motion.div className="highway-perspective highway-overpass" style={{ x: midX, y: midY }}>
        <svg viewBox="0 0 1440 920" preserveAspectRatio="xMidYMid slice" focusable="false">
          <defs>
            <linearGradient id={id + "-concrete"} x1="0" y1="0" x2=".35" y2="1">
              <stop stopColor="#51403a" /><stop offset=".35" stopColor="#302722" /><stop offset=".76" stopColor="#1d1918" /><stop offset="1" stopColor="#141414" />
            </linearGradient>
            <linearGradient id={id + "-beam"}>
              <stop stopColor="#141515" /><stop offset=".7" stopColor="#261e1a" /><stop offset="1" stopColor="#342821" />
            </linearGradient>
            <linearGradient id={id + "-column"}>
              <stop stopColor="#46342a" /><stop offset=".27" stopColor="#2d2520" /><stop offset="1" stopColor="#141617" />
            </linearGradient>
            <radialGradient id={id + "-lamp"}>
              <stop stopColor="#ffca92" stopOpacity=".47" /><stop offset=".26" stopColor="#ed9c5f" stopOpacity=".15" /><stop offset="1" stopColor="#df7431" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[.31, .58, .86].map(t => {
            const [x, y] = point(true, t, 1);
            const w = 12 + t * 64;
            return <g key={t}>
              <path fill={fill("column")} d={`M${x-w} ${y-5}h${w*1.85}l${-w*.25} 22h${-w*.24}l${w*.13} 410h${-w*.95}l${w*.12} -410h${-w*.42}Z`} />
              <path fill="#161717" opacity=".75" d={`M${x+w*.61} ${y+17}l${-w*.13} 410h${w*.27}l${-w*.13} -410Z`} />
            </g>;
          })}
          <path fill={fill("beam")} d={band(true, -.41, 1.26, -9, 34)} />
          <path fill="#141414" d={band(true, .51, 1.28, 5, 36)} />
          <path fill={fill("concrete")} d={band(true, -.48, .64, -13, 17)} />
          <path fill="#1e1b19" d={band(true, -.43, -.28, -18, 0)} />
          <path fill="none" stroke="#b58465" strokeOpacity=".32" strokeWidth="1.2" d={line(true, -.48, -12)} />
          <path fill="none" stroke="#bc815e" strokeOpacity=".2" strokeWidth="1.4" d={line(true, .61, 16)} />
          <path fill="none" stroke="#97785f" strokeOpacity=".23" strokeWidth="1" d={line(true, -.53, -23)} />
          {range(23, .1, .99, .72).map(t => {
            const [x, y] = point(true, t, -.5, -12);
            return <path key={t} stroke="#a1816b" strokeOpacity=".24" strokeWidth={.45 + t * 1.05} d={`M${x} ${y-11}v11`} />;
          })}
          {[.32, .51, .67, .82].map(t => {
            const [x, y] = point(true, t, -.52, -16);
            const h = 12 + t * 50;
            return <g key={t}>
              <ellipse cx={x + h * .33} cy={y + 7} rx={h * 1.85} ry={h * .4} fill={fill("lamp")} opacity=".37" transform={`rotate(-25 ${x} ${y})`} />
              <path fill="none" stroke="#79614e" strokeWidth={.7 + t * 1.4} d={`M${x} ${y}v${-h}q0 -8 10 -8h${h*.17}`} />
              <ellipse cx={x + 11 + h * .17} cy={y - h - 7} rx={h * .58} ry={h * .44} fill={fill("lamp")} />
              <path stroke="#ffd4a2" strokeOpacity=".84" strokeLinecap="round" strokeWidth={1 + t} d={`M${x+10+h*.1} ${y-h-7}h${3+t*4}`} />
            </g>;
          })}
          <path className="highway-traffic highway-traffic-distant" pathLength="100" d={line(true, -.44, -15)} />
        </svg>
      </motion.div>
      <motion.div className="highway-perspective highway-foreground" style={{ x: pointerX, y: pointerY }}>
        <svg viewBox="0 0 1440 920" preserveAspectRatio="xMidYMid slice" focusable="false">
          <defs>
            <linearGradient id={id + "-asphalt"} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#111617" /><stop offset=".37" stopColor="#242221" /><stop offset=".71" stopColor="#332b26" /><stop offset="1" stopColor="#121416" />
            </linearGradient>
            <linearGradient id={id + "-barrier"} x1="0" y1="0" x2=".15" y2="1">
              <stop stopColor="#211b18" /><stop offset=".53" stopColor="#413027" /><stop offset="1" stopColor="#1b1918" />
            </linearGradient>
            <radialGradient id={id + "-road-pool"}>
              <stop stopColor="#e69052" stopOpacity=".28" /><stop offset=".42" stopColor="#af6740" stopOpacity=".14" /><stop offset="1" stopColor="#8f5537" stopOpacity="0" />
            </radialGradient>
            <clipPath id={id + "-road-clip"}><path d={band(false, -.72, .96)} /></clipPath>
            <pattern id={id + "-aggregate"} width="17" height="13" patternUnits="userSpaceOnUse">
              <path d="M1 1h1m7 2h2m4 7h1M3 8h1m3 4h2M16 4h1" stroke="#c9a58a" strokeWidth=".7" opacity=".16" />
              <path d="M2 5h2m3 4h1m4 3h1M13 1h2" stroke="#08090a" strokeWidth="1" opacity=".34" />
            </pattern>
          </defs>
          <path fill={fill("asphalt")} d={band(false, -.76, .98)} />
          <g clipPath={fill("road-clip")}>
            <path fill={fill("aggregate")} d={band(false, -.72, .96)} />
            <path fill="#0a0c0d" opacity=".2" d={band(false, -.58, -.37)} />
            <path fill="#080a0b" opacity=".18" d={band(false, .18, .43)} />
            <ellipse cx="968" cy="868" rx="345" ry="87" fill={fill("road-pool")} transform="rotate(12 968 868)" />
            <ellipse cx="1275" cy="916" rx="226" ry="81" fill={fill("road-pool")} transform="rotate(16 1275 916)" />
            <path fill="none" stroke="#edb06c" strokeOpacity=".30" strokeWidth="1.7" d={line(false, -.68)} />
            <path fill="none" stroke="#e4c3a3" strokeOpacity=".24" strokeWidth="1.7" d={line(false, .81)} />
            {range(24, .04, .96, 1.65).map(t => <g key={t} stroke="#e6d7c2" strokeOpacity={.16 + .25 * t} strokeWidth={.3 + 2 * t}>
              <path d={mark(false, t, -.12, .005 + .018 * t)} /><path d={mark(false, t, .36, .005 + .018 * t)} />
            </g>)}
            {([[-.42, "amber"], [.21, "white"]] as const).map(([lane, tone]) => <g key={tone} className={`highway-pass highway-pass-${tone}`}>
              <path className="highway-traffic highway-traffic-reflection" pathLength="100" d={line(false, lane + .045, 3)} />
              <path className="highway-traffic highway-traffic-core" pathLength="100" d={line(false, lane)} />
            </g>)}
          </g>
          <path fill={fill("barrier")} d={band(false, -.96, -.76, -8, 3)} />
          <path fill="#322721" d={band(false, -.96, -.81, -10, -5)} />
          <path fill="none" stroke="#a87955" strokeOpacity=".26" strokeWidth="1.2" d={line(false, -.83, -5)} />
          {range(18, .24, .94, 1.38).map(t => {
            const [x, y] = point(false, t, -.84, -3);
            return <g key={t}>
              <path stroke="#141211" strokeOpacity=".62" d={`M${x} ${y-5}l${-t*4} ${5+t*8}`} />
              <path stroke="#ffb877" strokeOpacity={.24+t*.4} strokeWidth={.5 + t * 2.2} d={`M${x+3} ${y}l${1+t*8} ${t*1.3}`} />
            </g>;
          })}
        </svg>
      </motion.div>
    </div>
  );
}
