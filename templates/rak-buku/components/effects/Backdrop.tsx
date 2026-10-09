'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '@/templates/rak-buku/components/site/ThemeContext';
import { warmDays } from '@/templates/rak-buku/data/story';
import { nextBirthday } from '@/templates/rak-buku/lib/utils';

type Mote = { x: number; y: number; r: number; vy: number; drift: number; phase: number; a: number };

/**
 * The next time a day-of-the-month comes round, counting today as still itself
 * until midnight. Clamped to the end of short months, so a 31st still lands in
 * February.
 */
function monthlyOn(year: number, month: number, day: number) {
  const last = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, last), 0, 0, 0, 0);
}

function daysUntil(target: Date, now: Date) {
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

/**
 * How warm the room is right now: whichever of the days it keeps is closest to
 * happening, ramped from nothing at the edge of its window to its own peak on
 * the day itself. Taking the largest rather than adding them up is what stops
 * the birthday and the monthsary — which are the same date — from doubling.
 *
 * She would never catch it happening. But the site she opens on the twenty-
 * fourth is a warmer room than the one she left, every month, and nothing has to
 * be deployed for that to be true.
 */
function warmthOn(now: Date) {
  let warmest = 0;

  for (const day of warmDays) {
    const target =
      day.monthly !== undefined
        ? (() => {
            const here = monthlyOn(now.getFullYear(), now.getMonth(), day.monthly!);
            return now.getTime() < here.getTime() + 86_400_000
              ? here
              : monthlyOn(now.getFullYear(), now.getMonth() + 1, day.monthly!);
          })()
        : day.date
          ? nextBirthday(day.date, now)
          : null;

    if (!target) continue;

    const left = daysUntil(target, now);
    if (left > day.window) continue;

    const near = (day.window - Math.max(0, left)) / day.window;
    warmest = Math.max(warmest, day.peak * near);
  }

  return Math.min(1, warmest);
}

/* Paper grain, drawn once as an SVG and laid over everything at a whisper. */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/**
 * The room the album sits in: a sheet of journal paper in the buyer's palette —
 * grain, a faint dot grid, a wash of the accent at the corners. On the days that
 * mean something the wash deepens. A dark palette keeps the drifting motes of
 * the original album instead of the paper.
 */
export default function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { pal } = useTheme();
  /* Nothing on the server knows what day it is where she is, so the room starts
     at its ordinary temperature and warms on the first client render. */
  const [warmth, setWarmth] = useState(0);

  useEffect(() => {
    /* ?warm — see it now rather than waiting for the date. `?warm` or `?warm=1`
       is the full room; `?warm=0.5` is roughly what a monthsary looks like. */
    const forced = new URLSearchParams(window.location.search).get('warm');
    if (forced !== null) {
      const at = forced === '' ? 1 : Number(forced);
      setWarmth(Number.isFinite(at) ? Math.min(1, Math.max(0, at)) : 1);
      return;
    }

    const read = () => setWarmth(warmthOn(new Date()));
    read();
    const daily = window.setInterval(read, 3_600_000);
    return () => window.clearInterval(daily);
  }, []);

  const wash = (base: number) => `color-mix(in srgb, var(--color-rb-accent) ${Math.round(base + warmth * 18)}%, transparent)`;
  const ground = useMemo(
    () =>
      [
        `radial-gradient(ellipse 70% 45% at 50% -8%, ${wash(pal.dark ? 10 : 16)} 0%, transparent 62%)`,
        `radial-gradient(ellipse 55% 40% at 8% 92%, ${wash(pal.dark ? 6 : 12)} 0%, transparent 62%)`,
        `radial-gradient(ellipse 50% 38% at 94% 72%, ${wash(pal.dark ? 6 : 10)} 0%, transparent 60%)`,
        'var(--color-rb-bg)',
      ].join(', '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [warmth, pal.dark]
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!pal.dark || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let w = 0;
    let h = 0;
    let motes: Mote[] = [];

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(46, Math.max(16, Math.round((w * h) / 42000)));
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.4,
        vy: Math.random() * 0.12 + 0.03,
        drift: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        a: Math.random() * 0.3 + 0.12,
      }));
    };

    build();
    const onResize = () => build();
    window.addEventListener('resize', onResize);

    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.y -= m.vy;
        m.phase += 0.006;
        const x = m.x + Math.sin(m.phase) * m.drift * 16;
        if (m.y < -12) {
          m.y = h + 12;
          m.x = Math.random() * w;
        }
        const g = ctx.createRadialGradient(x, m.y, 0, x, m.y, m.r * 6);
        g.addColorStop(0, `rgba(245,237,228,${m.a})`);
        g.addColorStop(0.45, `rgba(233,165,188,${m.a * 0.4})`);
        g.addColorStop(1, 'rgba(233,165,188,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, m.y, m.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [pal.dark]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 transition-[background] duration-[3000ms] ease-out" style={{ background: ground }} />
      {pal.dark ? null : (
        <>
          {/* a journal's dot grid */}
          <div
            className="absolute inset-0 opacity-[0.55]"
            style={{
              backgroundImage: 'radial-gradient(color-mix(in srgb, var(--color-rb-fg) 13%, transparent) 1px, transparent 1.4px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="absolute inset-0 opacity-[0.35] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
        </>
      )}
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
