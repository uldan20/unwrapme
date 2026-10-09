'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type Ref } from 'react';
import { SHAPES, flowerOf, type Flower as FlowerSpec, type FlowerKey } from '@/templates/bunga-mekar/flowers';

const D = Math.PI / 180;
const MIDRIB = 'M0 -0.04 C0.03 -0.35 -0.02 -0.6 0 -0.85';
const STAMEN = 'M0 0 L0 -0.9';

type Kind = 'sepal' | 'petal' | 'stamen';

/** One petal, sepal or stamen: where it grows, how big it is, and how it opens. */
type Part = {
  kind: Kind;
  a: number;
  r0: number;
  length: number;
  width: number;
  rise: [number, number];
  stage: number;
  phase: number;
};

/** Every part of the flower, with a little difference in each, from the seed. */
function partsOf(f: FlowerSpec, seed: number): Part[] {
  let s = seed || 1;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const wobble = (x: number, by: number) => x * (1 + (rand() - 0.5) * 2 * by);
  const parts: Part[] = [];
  const twist = rand() * 360;

  if (f.sepals) {
    const n = f.sepals.count;
    for (let i = 0; i < n; i++) {
      parts.push({
        kind: 'sepal',
        a: (twist + (i * 360) / n + 180 / n) * D,
        r0: f.disc ? f.disc.r * 0.5 : 2,
        length: wobble(f.sepals.length, 0.08),
        width: f.sepals.width,
        rise: [18, 118],
        stage: 0,
        phase: rand() * 6.28,
      });
    }
  }
  for (const ring of f.rings) {
    for (let i = 0; i < ring.count; i++) {
      const step = 360 / ring.count;
      parts.push({
        kind: 'petal',
        a: (twist + (ring.turn ?? 0) + i * step + (rand() - 0.5) * step * 0.22) * D,
        r0: ring.r0 ?? 0,
        length: wobble(ring.length, 0.07),
        width: wobble(ring.width, 0.08),
        rise: [ring.rise[0] + (rand() - 0.5) * 4, ring.rise[1] + (rand() - 0.5) * 9],
        stage: ring.stage,
        phase: rand() * 6.28,
      });
    }
  }
  if (f.stamens) {
    const n = f.stamens.count;
    for (let i = 0; i < n; i++) {
      parts.push({
        kind: 'stamen',
        a: (twist + (i * 360) / n + rand() * 10) * D,
        r0: 1,
        length: wobble(f.stamens.length, 0.12),
        width: 7,
        rise: [f.stamens.rise[0], f.stamens.rise[1] + (rand() - 0.5) * 14],
        stage: 0.9,
        phase: rand() * 6.28,
      });
    }
  }
  return parts;
}

/** The pose of the whole flower at one moment. */
type View = { bloom: number; tilt: number; spin: number; time: number; pokes: Float32Array; nod: number; still: boolean };

const smooth = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const r2 = (x: number) => Math.round(x * 100) / 100;

/** How far a part has opened, given how far the flower has. Sepals first, the heart last. */
function openOf(stage: number, bloom: number) {
  return smooth(clamp01((bloom - stage * 0.42) / 0.58));
}

/**
 * A part, seen from the viewer: lean the petal out from the axis, tilt the
 * whole flower toward the viewer, and flatten the result into a rotated,
 * scaled outline. Also how near it is (for drawing order) and how much in
 * shadow (petals seen from behind, or edge-on, are darker).
 */
function pose(p: Part, i: number, v: View) {
  const o = openOf(p.stage, v.bloom);
  const sway = v.still ? 0 : Math.sin(v.time * 1.1 + p.phase) * 1.6;
  const theta = (p.rise[0] + (p.rise[1] - p.rise[0]) * o + sway + v.pokes[i] * 16) * D;
  const tau = (v.tilt + v.nod * 4) * D;
  const a = p.a + v.spin * D;

  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const st = Math.sin(theta);
  const ct = Math.cos(theta);
  const sT = Math.sin(tau);
  const cT = Math.cos(tau);

  /* where it grows from, and the way it points */
  const bx = p.r0 * ca;
  const bu = p.r0 * sa * sT;
  const dx = st * ca;
  const du = ct * cT + st * sa * sT;
  const depth = ct * sT - st * sa * cT;

  const len = Math.max(0.05, Math.hypot(dx, du));
  const phi = Math.atan2(dx, du) / D;
  /* the petal's width runs around the flower: (-sin a, cos a, 0) */
  const wx = -sa;
  const wu = ca * sT;
  const across = Math.max(0.16, Math.abs(wx * du - wu * dx) / len);
  const wide = p.kind === 'stamen' ? 1 : 0.42 + 0.58 * o;

  /* the inner face's normal, against the way to the viewer */
  const facing = ct * sa * cT + st * sT;
  const shade = p.kind === 'stamen' ? 0 : Math.min(0.5, 0.06 + 0.34 * (1 - Math.max(0, facing)) + 0.12 * (1 - across));

  const grow = p.kind === 'stamen' ? 0.25 + 0.75 * o : 1;
  const transform = `translate(${r2(bx)} ${r2(-bu)}) rotate(${r2(phi)}) scale(${r2((p.width / 2) * across * wide)} ${r2(p.length * len * grow)})`;
  return { transform, depth: depth * p.length * 0.5 + p.r0 * -sa * cT * 0.5, shade: r2(shade) };
}

function orderOf(parts: Part[], v: View, discAt: number) {
  const depths = parts.map((p, i) => pose(p, i, v).depth);
  const ids = parts.map((_, i) => i);
  ids.push(-1);
  depths.push(discAt);
  return ids.sort((x, y) => depths[x < 0 ? depths.length - 1 : x] - depths[y < 0 ? depths.length - 1 : y]);
}

function discTransform(f: FlowerSpec, v: View) {
  const o = openOf(0.5, v.bloom);
  const tau = v.tilt * D;
  const k = 0.55 + 0.45 * o;
  return `translate(0 ${r2(-(f.disc?.h ?? 0) * Math.cos(tau))}) scale(${r2(k)} ${r2(k * Math.max(0.06, Math.sin(tau)))})`;
}

export type FlowerProps = {
  flower: FlowerKey;
  /** 0 is a closed bud, 1 fully open; the flower eases toward it */
  bloom: number;
  seed?: number;
  /** degrees: 0 from the side, 90 from straight above */
  tilt?: number;
  /** turns slowly by itself */
  turning?: boolean;
  /** petals can be tapped and the flower turned by dragging */
  interactive?: boolean;
  /** drawn once, for small pictures */
  frozen?: boolean;
  /** bumped on every note: the flower nods */
  pulse?: number;
  /** how close: above 1 shows the middle bigger */
  zoom?: number;
  /** draw the stem below the head */
  stem?: boolean;
  onPetal?: (i: number) => void;
  svgRef?: Ref<SVGSVGElement>;
  className?: string;
  label?: string;
};

/**
 * A living flower: drawn in 3D from rings of petals that open from a bud as
 * `bloom` rises, swaying a little, turning slowly. She can drag it round and
 * tap a petal to make it move. Every frame is drawn straight onto the SVG
 * (React draws it once), so it stays smooth on a phone.
 */
export default function Flower(props: FlowerProps) {
  /* a different flower or seed grows a new one, rather than reshaping this one */
  return <Growing key={`${props.flower}-${props.seed ?? 7}`} {...props} />;
}

function Growing({
  flower,
  bloom,
  seed = 7,
  tilt = 52,
  turning = true,
  interactive = false,
  frozen = false,
  pulse = 0,
  zoom = 1,
  stem = true,
  onPetal,
  svgRef,
  className,
  label,
}: FlowerProps) {
  const f = flowerOf(flower);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [parts] = useState(() => partsOf(f, seed));
  const view = useRef<View>({ bloom, tilt, spin: 0, time: 0, pokes: new Float32Array(parts.length), nod: 0, still: frozen });
  const [first] = useState(() => {
    const v = view.current;
    return { poses: parts.map((p, i) => pose(p, i, v)), order: orderOf(parts, v, 0), disc: discTransform(f, v) };
  });

  const head = useRef<SVGGElement>(null);
  const stemRef = useRef<SVGGElement>(null);
  const target = useRef({ bloom, tilt });
  const drag = useRef<{ x: number; y: number; t: number; moved: boolean; part: number; mouse: boolean } | null>(null);
  const spinV = useRef(0);
  const onPetalRef = useRef(onPetal);

  useEffect(() => {
    onPetalRef.current = onPetal;
  }, [onPetal]);

  useEffect(() => {
    target.current.bloom = bloom;
  }, [bloom]);

  useEffect(() => {
    target.current.tilt = tilt;
  }, [tilt]);

  useEffect(() => {
    if (pulse) view.current.nod = 1;
  }, [pulse]);

  /* draw a frame: move every part, then put them back in order, far to near */
  const draw = useRef<() => void>(() => {});
  draw.current = () => {
    const g = head.current;
    if (!g) return;
    const v = view.current;
    const nodes = g.children;
    const byId = new Map<number, Element>();
    for (let k = 0; k < nodes.length; k++) byId.set(Number((nodes[k] as SVGElement).dataset.i), nodes[k]);
    const depths: number[] = [];
    parts.forEach((p, i) => {
      const { transform, depth, shade } = pose(p, i, v);
      depths[i] = depth;
      const node = byId.get(i);
      if (!node) return;
      node.setAttribute('transform', transform);
      node.querySelector('[data-shade]')?.setAttribute('fill-opacity', String(shade));
    });
    byId.get(-1)?.setAttribute('transform', discTransform(f, v));
    const ids = parts.map((_, i) => i).concat(-1);
    ids.sort((x, y) => (x < 0 ? 0 : depths[x]) - (y < 0 ? 0 : depths[y]));
    let same = true;
    for (let k = 0; k < ids.length; k++) {
      if (Number((nodes[k] as SVGElement)?.dataset.i) !== ids[k]) {
        same = false;
        break;
      }
    }
    if (!same) ids.forEach((id) => byId.get(id) && g.appendChild(byId.get(id)!));
    stemRef.current?.setAttribute('transform', `scale(1 ${r2(Math.max(0, Math.cos(v.tilt * D)))})`);
  };

  useLayoutEffect(() => {
    if (!frozen) return;
    view.current = { ...view.current, bloom, tilt };
    draw.current();
  }, [frozen, bloom, tilt]);

  useEffect(() => {
    if (frozen) return;
    let raf = 0;
    let last = performance.now();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    view.current.still = still;
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const v = view.current;
      const want = target.current;
      v.bloom += (want.bloom - v.bloom) * (1 - Math.exp(-dt * (still ? 12 : 2.4)));
      if (!drag.current?.moved) v.tilt += (want.tilt - v.tilt) * (1 - Math.exp(-dt * 1.5));
      if (!drag.current) {
        spinV.current *= Math.exp(-dt * 2.2);
        v.spin += (spinV.current + (turning && !still ? 5 : 0)) * dt;
      }
      v.time += dt;
      v.nod *= Math.exp(-dt * 3.2);
      for (let i = 0; i < v.pokes.length; i++) v.pokes[i] *= Math.exp(-dt * 3.6);
      draw.current();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [frozen, turning]);

  const press = (e: React.PointerEvent) => {
    const part = (e.target as Element).closest('[data-i]');
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, part: part ? Number((part as SVGElement).dataset.i) : -1, mouse: e.pointerType === 'mouse' };
    spinV.current = 0;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not a live pointer */
    }
  };

  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    const now = performance.now();
    const dt = Math.max(1, now - d.t) / 1000;
    view.current.spin += dx * 0.55;
    spinV.current = (dx * 0.55) / dt;
    if (d.mouse) view.current.tilt = Math.max(14, Math.min(88, view.current.tilt + dy * 0.3));
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = now;
  };

  const release = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      target.current.tilt = view.current.tilt;
      return;
    }
    if (d.part >= 0 && parts[d.part]?.kind === 'petal') {
      view.current.pokes[d.part] = 1;
      onPetalRef.current?.(d.part);
    }
  };

  /* with a stem the head sits higher, a little stem showing below it; without one it is in the middle */
  const vb = stem ? `${-100 / zoom} ${-84 / zoom} ${200 / zoom} ${204 / zoom}` : `${-100 / zoom} ${-100 / zoom} ${200 / zoom} ${200 / zoom}`;
  const fillOf = (kind: Kind) => (kind === 'sepal' ? `url(#${uid}-s)` : `url(#${uid}-p)`);

  return (
    <svg
      ref={svgRef}
      viewBox={vb}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onPointerDown={interactive ? press : undefined}
      onPointerMove={interactive ? move : undefined}
      onPointerUp={interactive ? release : undefined}
      onPointerCancel={interactive ? () => (drag.current = null) : undefined}
      style={interactive ? { touchAction: 'pan-y', cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none' } : undefined}
    >
      <defs>
        <linearGradient id={`${uid}-p`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={f.colors[0]} />
          <stop offset="0.45" stopColor={f.colors[1]} />
          <stop offset="1" stopColor={f.colors[2]} />
        </linearGradient>
        <linearGradient id={`${uid}-s`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={f.sepals?.dark ?? '#2f5224'} />
          <stop offset="1" stopColor={f.sepals?.color ?? '#5b8a43'} />
        </linearGradient>
        <radialGradient id={`${uid}-d`}>
          <stop offset="0" stopColor={f.disc?.seed ?? '#000'} />
          <stop offset="1" stopColor={f.disc?.color ?? '#000'} />
        </radialGradient>
      </defs>

      {stem ? (
        <g ref={stemRef} transform={`scale(1 ${r2(Math.max(0, Math.cos(tilt * D)))})`}>
          <path d="M0 4 C7 50 -9 104 3 200" fill="none" stroke={f.stem} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M1 92 C16 74 40 72 58 80 C42 94 20 100 1 92Z" fill={f.leaf} />
          <path d="M1 92 C20 84 38 80 56 80" fill="none" stroke={f.stem} strokeWidth="0.8" strokeOpacity="0.6" />
        </g>
      ) : null}

      <g ref={head}>
        {first.order.map((id) => {
          if (id < 0) {
            if (!f.disc) return <g key="disc" data-i={-1} />;
            const seeds = Math.round(f.disc.r * 2.2);
            return (
              <g key="disc" data-i={-1} transform={first.disc}>
                <circle r={f.disc.r} fill={`url(#${uid}-d)`} />
                {Array.from({ length: seeds }, (_, k) => {
                  const rr = f.disc!.r * 0.92 * Math.sqrt((k + 0.5) / seeds);
                  const aa = k * 2.39996;
                  return <circle key={k} cx={r2(rr * Math.cos(aa))} cy={r2(rr * Math.sin(aa))} r={r2(f.disc!.r * 0.06)} fill={f.disc!.seed} fillOpacity="0.7" />;
                })}
              </g>
            );
          }
          const p = parts[id];
          const at = first.poses[id];
          if (p.kind === 'stamen') {
            return (
              <g key={id} data-i={id} transform={at.transform}>
                <path d={STAMEN} stroke={f.stamens!.filament} strokeWidth="1.1" vectorEffect="non-scaling-stroke" fill="none" />
                <ellipse cy="-0.92" rx="0.55" ry="0.07" fill={f.stamens!.anther} />
              </g>
            );
          }
          const d = p.kind === 'sepal' ? SHAPES.pointed : SHAPES[f.shape];
          return (
            <g key={id} data-i={id} transform={at.transform}>
              <path d={d} fill={fillOf(p.kind)} stroke={p.kind === 'sepal' ? f.sepals!.dark : f.edge} strokeOpacity="0.45" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
              {p.kind === 'petal' ? (
                <>
                  <path d={MIDRIB} fill="none" stroke={f.vein} strokeOpacity="0.3" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
                  {f.spots
                    ? [0.22, 0.32, 0.42, 0.3, 0.38].map((y, k) => <ellipse key={k} cx={(k % 2 ? 1 : -1) * 0.16 * (k + 1) * 0.4} cy={-y} rx="0.06" ry="0.018" fill={f.spots} />)
                    : null}
                </>
              ) : null}
              <path data-shade d={d} fill="#1a0c10" fillOpacity={at.shade} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
