'use client';

import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import Lily from '@/templates/rak-buku/components/art/Lily';
import type { AlbumShot } from '@/templates/rak-buku/data/story';

/** How many photographs make the ring. More than this and it turns to mush. */
const COUNT = 40;
/** One full turn of the ring, in seconds. Slow enough to be felt, not watched. */
const TURN_S = 240;
/** How far from the pointer a photograph starts to feel it, in pixels. */
const REACH = 190;
/** How far the nearest photograph is pushed. */
const PUSH = 78;

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Overshoots a little before settling — a print landing, not sliding. */
function easeOutBack(t: number) {
  const c = 1.5;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
}

type Card = {
  src: string;
  /** Resting place on the ring, before it turns. */
  bx: number;
  by: number;
  brot: number;
  delay: number;
  phase: number;
  /* the spring that carries the push */
  ox: number;
  oy: number;
  or: number;
  vx: number;
  vy: number;
  vr: number;
};

/**
 * The way into the grid: forty of the photographs flung out from the middle into
 * a loose ring, like prints dropped in a circle on a table, turning very slowly.
 *
 * It is not for clicking. The pointer — or her finger — works like a magnet
 * held the wrong way round: the photographs near it shy away and tremble, and
 * drift back into place once it has gone. The whole ring leans a little towards
 * wherever the pointer is. Scrolling down shrinks it away into the days below.
 *
 * Forty photographs moving every frame would be a lot of work for React, so the
 * motion is one loop that writes transforms straight onto the elements.
 */
export default function Wreath({
  shots,
  scroller,
  title,
  stats,
}: {
  shots: AlbumShot[];
  scroller: RefObject<HTMLDivElement | null>;
  title: string;
  /** Small facts under the title — one line on a wide screen, stacked on a phone. */
  stats: string[];
}) {
  const still = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const tiltBox = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const read = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  /* Every date gets its turn: one from each in rotation, heroes first. */
  const picked = useMemo(() => {
    const byDay = new Map<string, AlbumShot[]>();
    shots.forEach((shot) => byDay.set(shot.chapterId, [...(byDay.get(shot.chapterId) ?? []), shot]));
    const queues = [...byDay.values()].map((l) => [...l.filter((s) => s.hero), ...l.filter((s) => !s.hero)]);
    const out: AlbumShot[] = [];
    while (out.length < Math.min(COUNT, shots.length)) {
      for (const q of queues) {
        const next = q.shift();
        if (next && out.length < COUNT) out.push(next);
      }
    }
    return out;
  }, [shots]);

  const phone = size.w > 0 && size.w < 640;
  const card = phone ? { w: 70, h: 50 } : { w: 150, h: 104 };
  const rx = phone ? size.w * 0.32 : Math.min(size.w * 0.3, 520);
  const ry = phone ? Math.min(size.h * 0.22, 210) : Math.min(size.h * 0.23, 260);

  const cards = useMemo<Card[]>(() => {
    const rand = seeded(24);
    return picked.map((shot, i) => {
      const a = (i / picked.length) * Math.PI * 2 + (rand() - 0.5) * 0.25;
      const r = 0.82 + rand() * 0.3;
      return {
        src: shot.src,
        bx: Math.cos(a) * rx * r,
        by: Math.sin(a) * ry * r,
        brot: (a * 180) / Math.PI + 90 + (rand() - 0.5) * 50,
        delay: 0.15 + i * 0.028,
        phase: rand() * Math.PI * 2,
        ox: 0,
        oy: 0,
        or: 0,
        vx: 0,
        vy: 0,
        vr: 0,
      };
    });
  }, [picked, rx, ry]);

  /* ── the one loop that moves everything ─────────────────────────── */
  useEffect(() => {
    if (!size.w || !cards.length) return;
    let frame = 0;
    let last = performance.now();
    const born = last;
    let spin = 0;
    let tiltX = 0;
    let tiltY = 0;
    let visible = true;

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (stage.current) io.observe(stage.current);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!visible) {
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - born) / 1000;

      if (!still) spin += (dt * Math.PI * 2) / TURN_S;
      const cos = Math.cos(spin);
      const sin = Math.sin(spin);
      const p = pointer.current;

      /* the whole ring leans towards the pointer */
      const box = stage.current?.getBoundingClientRect();
      const wantX = p && box ? (-p.y / (box.height / 2)) * 12 : 0;
      const wantY = p && box ? (p.x / (box.width / 2)) * 16 : 0;
      tiltX += (wantX - tiltX) * 0.06;
      tiltY += (wantY - tiltY) * 0.06;
      if (tiltBox.current) {
        tiltBox.current.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      }

      cards.forEach((c, i) => {
        const el = els.current[i];
        if (!el) return;

        /* where it rests right now, the ring having turned */
        const x = c.bx * cos - c.by * sin;
        const y = c.bx * sin + c.by * cos;

        /* pushed away from the pointer, trembling the closer it is */
        let tx = 0;
        let ty = 0;
        let tr = 0;
        let lift = 0;
        /* Answering her own hand is not motion she did not ask for, so this
           stays on with reduced motion — only the trembling is left out. */
        if (p) {
          const dx = x - p.x;
          const dy = y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < REACH) {
            const f = (1 - d / REACH) ** 2;
            tx = (dx / d) * PUSH * f;
            ty = (dy / d) * PUSH * f;
            tr = (dx > 0 ? 1 : -1) * 14 * f + (still ? 0 : Math.sin(t * 13 + c.phase) * 7 * f);
            lift = f;
          }
        }

        /* a spring carries it there and back, so it wobbles to rest */
        c.vx = (c.vx + (tx - c.ox) * 0.09) * 0.8;
        c.vy = (c.vy + (ty - c.oy) * 0.09) * 0.8;
        c.vr = (c.vr + (tr - c.or) * 0.09) * 0.8;
        c.ox += c.vx;
        c.oy += c.vy;
        c.or += c.vr;

        /* on arrival, each one is flung out from the middle in turn */
        const k = still ? 1 : Math.min(1, Math.max(0, (t - c.delay) / 0.9));
        const e = still ? 1 : easeOutBack(k);
        const rot = (c.brot + (spin * 180) / Math.PI) * e + c.or;
        const scale = (0.3 + 0.7 * e) * (1 + lift * 0.08);

        el.style.opacity = String(Math.min(1, k * 2.5));
        el.style.transform =
          `translate(${(x * e + c.ox).toFixed(1)}px, ${(y * e + c.oy).toFixed(1)}px) ` +
          `rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.zIndex = lift > 0.05 ? '5' : '';
      });
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [cards, size.w, still]);

  const track = (e: React.PointerEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    pointer.current = { x: e.clientX - box.left - box.width / 2, y: e.clientY - box.top - box.height / 2 };
  };
  const release = () => {
    pointer.current = null;
  };

  /* Scrolling into the days shrinks the ring away. */
  const { scrollY } = useScroll({ container: scroller });
  const away = useTransform(scrollY, [0, 420], [1, 0.72]);
  const fade = useTransform(scrollY, [0, 380], [1, 0]);

  const height = phone ? 'min(64svh, 520px)' : 'min(74svh, 760px)';

  return (
    <motion.section
      ref={stage}
      className="relative flex touch-pan-y select-none items-center justify-center [perspective:1400px]"
      style={{ height, scale: away, opacity: fade }}
      onPointerMove={track}
      onPointerDown={track}
      onPointerLeave={release}
      onPointerUp={(e) => {
        if (e.pointerType !== 'mouse') release();
      }}
      onPointerCancel={release}
    >
      {size.w ? (
        <div
          ref={tiltBox}
          className="pointer-events-none absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
          aria-hidden
        >
          {cards.map((c, i) => (
            <div
              key={c.src}
              ref={(el) => {
                els.current[i] = el;
              }}
              className="absolute left-0 top-0 overflow-hidden rounded-[3px] bg-rb-bg-soft opacity-0 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.9)] ring-1 ring-rb-fg/10 will-change-transform"
              style={{ width: card.w, height: card.h, marginLeft: -card.w / 2, marginTop: -card.h / 2 }}
            >
              <Image src={c.src} alt="" fill sizes="160px" className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      {/* the hole in the middle */}
      <motion.div
        className="pointer-events-none relative z-10 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: still ? 0 : 1.1 }}
      >
        <Lily className="mx-auto h-7 w-7 opacity-80" />
        <h1 className="mx-auto mt-2 max-w-[7.5rem] font-rb-display text-[1.6rem] italic leading-tight text-rb-fg glow-cream sm:max-w-none sm:text-5xl">
          {title}
        </h1>
        <p className="rb-label mt-3 flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-0">
          {stats.map((stat, i) => (
            <span key={stat}>
              {i ? <span className="hidden sm:inline">&nbsp;·&nbsp;</span> : null}
              {stat}
            </span>
          ))}
        </p>
      </motion.div>

      <motion.p
        className="rb-label pointer-events-none absolute -bottom-3 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1, delay: still ? 0 : 2 }}
      >
        semua hari, di bawah ↓
      </motion.p>
    </motion.section>
  );
}
