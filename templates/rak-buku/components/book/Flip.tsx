'use client';

import { animate, motion, useMotionValue, type AnimationPlaybackControls } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import BookPage, { type PageContext } from '@/templates/rak-buku/components/book/BookPage';
import type { Page } from '@/templates/rak-buku/lib/book';

/** One page turned: which way, from which view. */
type Turn = { dir: 1 | -1; from: number };

const TURN_S = 0.75;
const EASE = [0.33, 0.06, 0.22, 1] as const;
/** How far a finger travels, in page widths, to turn a page all the way. */
const DRAG_SPAN = 1.25;
/** Let go past this and the page carries on over; short of it, it falls back. */
const COMMIT = 0.3;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * The open book, turned like a real one.
 *
 * It is built the way a book is: sheets of paper bound at the spine, each with
 * a page on its front and one on its back. On a wide screen a sheet lies either
 * on the right (not yet read) or turned over onto the left; turning a page
 * swings one sheet across, its front darkening as it lifts and its shadow
 * sweeping the page beneath. On a phone each page is its own sheet the width
 * of the screen, turned away to the left.
 *
 * Every sheet stays mounted the whole time and only its angle changes, so
 * nothing is rebuilt as a page goes over — no photograph has to be drawn again,
 * and nothing flickers. A page follows the finger (or the mouse) while dragged
 * and carries on over or falls back when let go. The folded corners, the arrows
 * and the keys turn it too. A tap still reaches whatever is on the page.
 */
export default function Flip({
  pages,
  at,
  paired,
  pageW,
  pageH,
  cloth,
  ctx,
  reduced,
  onAt,
}: {
  pages: Page[];
  /** The view asked for — a spread's left-hand page when paired. */
  at: number;
  paired: boolean;
  pageW: number;
  pageH: number;
  /** The colour of the boards, showing round the pages. */
  cloth: string;
  ctx: PageContext;
  reduced: boolean;
  /** Told where the book has settled after a page is turned by hand. */
  onAt: (view: number) => void;
}) {
  const per = paired ? 2 : 1;
  const n = pages.length;
  const lastView = paired ? n - 2 : n - 1;

  const [view, setView] = useState(at);
  const [turn, setTurnState] = useState<Turn | null>(null);
  /* The turn as of right now — pointer handlers fire before a re-render. */
  const turnRef = useRef<Turn | null>(null);
  const setTurn = useCallback((t: Turn | null) => {
    turnRef.current = t;
    setTurnState(t);
  }, []);

  /* 0 → 1 over a turn. Never reset when a turn ends — the sheet it drove is
     still on it until the next render, and a reset would snap it back for a
     frame. It is set afresh at the start of the next turn instead. */
  const progress = useMotionValue(0);
  const running = useRef<AnimationPlaybackControls | null>(null);

  /* Everything a moving sheet needs. These are set in step with `progress`
     (not derived with useTransform, which only catches up on the next frame:
     a sheet starting to turn would show for one frame where the last turn
     left it — the flicker). */
  const angle = useMotionValue(0);
  const fade = useMotionValue(1);
  const frontShade = useMotionValue(0);
  const shine = useMotionValue(0);
  const backShade = useMotionValue(0);
  const cast = useMotionValue(0);

  const apply = useCallback(
    (p: number) => {
      const t = turnRef.current;
      if (!t) return;
      const lift = Math.sin(Math.PI * p);
      angle.set(t.dir === 1 ? -180 * p : -180 * (1 - p));
      /* on a phone a sheet turned away fades as it leaves the screen's edge */
      fade.set(t.dir === 1 ? (p < 0.7 ? 1 : Math.max(0, 1 - (p - 0.7) / 0.22)) : p > 0.3 ? 1 : Math.max(0, (p - 0.08) / 0.22));
      frontShade.set(0.5 * lift);
      shine.set(0.3 * lift);
      backShade.set(t.dir === 1 ? 0.45 * (1 - p) : 0.45 * p);
      cast.set(0.5 * lift);
    },
    [angle, fade, frontShade, shine, backShade, cast]
  );
  useEffect(() => progress.on('change', apply), [progress, apply]);

  const finish = useCallback(
    (t: Turn, to: number, from = progress.get()) => {
      running.current?.stop();
      const done = () => {
        if (to === 1) {
          const next = t.from + t.dir * per;
          setView(next);
          onAt(next);
        }
        setTurn(null);
      };
      if (reduced) {
        progress.set(to);
        return done();
      }
      running.current = animate(progress, to, {
        duration: TURN_S * Math.max(0.35, Math.abs(to - from)),
        ease: EASE,
        onComplete: done,
      });
    },
    [per, progress, reduced, onAt, setTurn]
  );

  const start = useCallback(
    (t: Turn) => {
      running.current?.stop();
      setTurn(t);
      progress.jump(0);
      /* even when progress was already 0 and so fires no change */
      apply(0);
    },
    [progress, setTurn, apply]
  );

  /* Asked to be somewhere else — the arrows, the keys, the day picker. A far
     jump lands next door first, so there is still one page seen turning. */
  useEffect(() => {
    if (turn || at === view) return;
    const dir = at > view ? 1 : -1;
    const from = Math.abs(at - view) > per ? at - dir * per : view;
    if (from !== view) setView(from);
    const t: Turn = { dir, from };
    start(t);
    finish(t, 1, 0);
  }, [at, view, turn, per, start, finish]);

  /* ── by hand ─────────────────────────────────────────────────── */
  const press = useRef<{ x: number; y: number; live: boolean; t: number; lastX: number; v: number } | null>(null);
  const dragged = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || turnRef.current) return;
    dragged.current = false;
    press.current = { x: e.clientX, y: e.clientY, live: false, t: e.timeStamp, lastX: e.clientX, v: 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    if (!p.live) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - p.y) * 1.2) return;
      const dir: 1 | -1 = dx < 0 ? 1 : -1;
      if ((dir === 1 && view >= lastView) || (dir === -1 && view <= 0)) {
        press.current = null;
        return;
      }
      p.live = true;
      start({ dir, from: view });
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer is already gone; the turn still follows the events */
      }
    }
    progress.set(clamp(Math.abs(dx) / (pageW * DRAG_SPAN), 0, 1));
    const dt = e.timeStamp - p.t;
    if (dt > 4) {
      p.v = (e.clientX - p.lastX) / dt;
      p.lastX = e.clientX;
      p.t = e.timeStamp;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    const t = turnRef.current;
    if (!p?.live || !t) return;
    dragged.current = true;
    /* a flick carries it over even if it has not gone far */
    const flick = e.timeStamp - p.t < 90 && Math.abs(p.v) > 0.45 && Math.sign(-p.v) === t.dir;
    finish(t, progress.get() > COMMIT || flick ? 1 : 0);
  };

  /* A drag ends in no tap on whatever it started on. */
  const onClickCapture = (e: React.MouseEvent) => {
    if (!dragged.current) return;
    dragged.current = false;
    e.stopPropagation();
    e.preventDefault();
  };

  const turnBy = (dir: 1 | -1) => {
    if (turnRef.current) return;
    if ((dir === 1 && view >= lastView) || (dir === -1 && view <= 0)) return;
    const t: Turn = { dir, from: view };
    start(t);
    finish(t, 1, 0);
  };

  /* ── the sheets ──────────────────────────────────────────────── */
  const page = (i: number, side: 'left' | 'right') =>
    i >= 0 && i < n ? <BookPage page={pages[i]} index={i} side={side} ctx={ctx} eager /> : <Blank />;

  const v = turn ? turn.from : view;
  /* Which sheet is in the air, if any. */
  const moving = !turn ? -1 : paired ? (turn.dir === 1 ? v / 2 : v / 2 - 1) : turn.dir === 1 ? v : v - 1;

  type SheetSpec = { key: number; front: React.ReactNode; back: React.ReactNode; turned: boolean };
  const sheets: SheetSpec[] = paired
    ? /* pages 1 … n-2, two to a sheet; 0 and n-1 are the insides of the boards */
      Array.from({ length: Math.max(0, (n - 2) / 2) }, (_, s) => ({
        key: s,
        front: page(2 * s + 1, 'right'),
        back: page(2 * s + 2, 'left'),
        turned: 2 * s + 2 <= v,
      }))
    : Array.from({ length: n }, (_, i) => ({
        key: i,
        front: page(i, i % 2 ? 'right' : 'left'),
        back: <Blank />,
        turned: i < v,
      }));

  const width = paired ? pageW * 2 : pageW;
  /* How many pages lie either side, for the thickness of the edges. */
  const leftCount = paired ? v : 0;
  const rightCount = n - v - per;

  return (
    <div
      className="absolute inset-0 touch-pan-y select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
    >
      {/* so a drag can start beside the book as well as on it */}
      <div className="absolute -inset-y-6 -left-[50vw] -right-[50vw]" />

      {/* No preserve-3d here: each sheet is drawn in its own stacking order,
          so sheets lying flat on the same side never fight over which is on top. */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width, height: pageH, marginLeft: -width / 2, marginTop: -pageH / 2, perspective: pageW * 4 }}
      >
        {/* the boards the pages are bound in */}
        <div
          className="absolute rounded-[6px] shadow-[0_40px_70px_-30px_rgba(40,25,20,0.55)]"
          style={{ inset: paired ? '-1.6% -1.2%' : '-1.6% -2.4% -1.6% -1.2%', backgroundColor: cloth }}
        />

        {/* the thickness of the pages still to come, and of those read */}
        <Edges count={Math.min(6, Math.ceil(rightCount / 2))} side="right" paired={paired} />
        {paired ? <Edges count={Math.min(6, Math.ceil(leftCount / 2))} side="left" paired /> : null}

        {/* the insides of the boards, under everything */}
        {paired ? (
          <>
            <div className="absolute inset-y-0 left-0 overflow-hidden rounded-l-[3px]" style={{ width: pageW, zIndex: 1 }}>
              {page(0, 'left')}
            </div>
            <div className="absolute inset-y-0 right-0 overflow-hidden rounded-r-[3px]" style={{ width: pageW, zIndex: 1 }}>
              {page(n - 1, 'right')}
            </div>
          </>
        ) : null}

        {sheets.map((s) => {
          const isMoving = s.key === moving;
          const rotateY = isMoving ? angle : s.turned ? -180 : 0;
          /* Read sheets stack with the latest on top; unread ones with the next on top. */
          const zIndex = isMoving ? 500 : s.turned ? 10 + s.key : 400 - s.key;
          const opacity = paired ? 1 : isMoving ? fade : s.turned ? 0 : 1;
          return (
            <motion.div
              key={s.key}
              className="absolute inset-y-0 [transform-style:preserve-3d]"
              style={{
                width: pageW,
                right: 0,
                transformOrigin: 'left center',
                rotateY,
                zIndex,
                opacity,
                pointerEvents: !paired && s.turned && !isMoving ? 'none' : undefined,
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-r-[3px] [backface-visibility:hidden]">
                {s.front}
                {isMoving ? (
                  <>
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      style={{ opacity: frontShade, background: 'linear-gradient(90deg, rgba(40,25,20,0.55), rgba(40,25,20,0.05) 45%, transparent 70%)' }}
                    />
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      style={{ opacity: shine, background: 'linear-gradient(270deg, rgba(255,255,255,0.5), transparent 35%)' }}
                    />
                  </>
                ) : null}
              </div>
              <div className="absolute inset-0 overflow-hidden rounded-l-[3px] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                {s.back}
                {isMoving ? (
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      opacity: backShade,
                      background: 'linear-gradient(270deg, rgba(40,25,20,0.6), transparent 60%)',
                    }}
                  />
                ) : null}
              </div>
            </motion.div>
          );
        })}

        {/* the shadow a turning page throws across the pages beneath it */}
        {turn ? (
          <>
            <motion.div
              className="pointer-events-none absolute inset-y-0 right-0"
              style={{ width: pageW, zIndex: 450, opacity: cast, background: 'linear-gradient(90deg, rgba(40,25,20,0.5), transparent 55%)' }}
            />
            {paired ? (
              <motion.div
                className="pointer-events-none absolute inset-y-0 left-0"
                style={{ width: pageW, zIndex: 450, opacity: cast, background: 'linear-gradient(270deg, rgba(40,25,20,0.4), transparent 55%)' }}
              />
            ) : null}
          </>
        ) : null}

        {/* the corners, folded a little, to turn by */}
        {!turn && view < lastView ? <Corner side="right" onClick={() => turnBy(1)} /> : null}
        {!turn && view > 0 ? <Corner side="left" onClick={() => turnBy(-1)} /> : null}
      </div>
    </div>
  );
}

/** The page edges showing past the top sheet, a hair each. */
function Edges({ count, side, paired }: { count: number; side: 'left' | 'right'; paired: boolean }) {
  return (
    <>
      {Array.from({ length: count }, (_, k) => (
        <div
          key={k}
          className="absolute top-0 h-full border-[#d9ccb8]"
          style={{
            width: paired ? '50%' : '100%',
            [side]: 0,
            transform: `translate(${(side === 'right' ? 1 : -1) * (k + 1) * 1.6}px, ${(k + 1) * 0.8}px)`,
            background: k % 2 ? '#efe6d8' : '#f6efe4',
            borderRightWidth: side === 'right' ? 1 : 0,
            borderLeftWidth: side === 'left' ? 1 : 0,
            borderRadius: side === 'right' ? '0 3px 3px 0' : '3px 0 0 3px',
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}

/** A dog-eared corner, lifting on hover — tap it to turn the page. */
function Corner({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const right = side === 'right';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={right ? 'Halaman berikutnya' : 'Halaman sebelumnya'}
      className="group absolute bottom-0 h-[13%] max-h-16 w-[13%] max-w-16"
      style={{ [right ? 'right' : 'left']: 0, zIndex: 600 }}
    >
      <span
        className="absolute bottom-0 h-full w-full scale-[0.55] transition-transform duration-300 ease-out group-hover:scale-[0.9]"
        style={{
          [right ? 'right' : 'left']: 0,
          transformOrigin: right ? 'bottom right' : 'bottom left',
          background: right
            ? 'linear-gradient(315deg, transparent 50%, rgba(0,0,0,0.12) 52%, #efe6d8 54%, #fbf6ee 75%)'
            : 'linear-gradient(45deg, transparent 50%, rgba(0,0,0,0.12) 52%, #efe6d8 54%, #fbf6ee 75%)',
          clipPath: right ? 'polygon(100% 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 100%, 0 100%)',
        }}
      />
    </button>
  );
}

function Blank() {
  return <div className="h-full w-full bg-[#f3ece1]" />;
}

