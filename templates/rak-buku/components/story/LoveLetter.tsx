'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Lily from '@/templates/rak-buku/components/art/Lily';
import { theQuestion } from '@/templates/rak-buku/data/story';

type Stage = 'sealed' | 'opening' | 'open';

const W = 340;
const H = 216;

/** What goes on the paper. The confession is one of these; so is every letter. */
export type Paper = {
  title: string;
  body: string[];
  signoff?: string;
};

/**
 * A letter sealed in an envelope she has to open herself. The flap turns back
 * on its top edge, then the paper takes over the space — printed dark on cream,
 * the one light surface in the whole site.
 *
 * Written for the confession, and now every monthly letter as well: a locked
 * envelope (one whose day has not come) only shrugs when it is tapped, and its
 * prompt is a countdown instead of an invitation.
 */
export default function LoveLetter({
  start = 0,
  onOpened,
  paper = theQuestion,
  prompt = theQuestion.openPrompt,
  kicker,
  locked = false,
  opened = false,
}: {
  start?: number;
  onOpened?: () => void;
  paper?: Paper;
  /** Under the envelope. The invitation — or, while locked, how long is left. */
  prompt?: string;
  /** A small line above the title on the paper, e.g. the date. */
  kicker?: string;
  /** Not its day yet: the envelope stays shut however much it is tapped. */
  locked?: boolean;
  /** Start on the paper — for reading one she has already opened. */
  opened?: boolean;
}) {
  const [stage, setStage] = useState<Stage>(opened ? 'open' : 'sealed');
  /* The paragraphs arrive one after another; the rule and the signoff wait for
     the last of them, however many there are. */
  const afterBody = 1.25 + paper.body.length * 0.7;
  const [shrug, setShrug] = useState(0);
  const timer = useRef<number | null>(null);

  const open = () => {
    if (stage !== 'sealed') return;
    if (locked) {
      // A small refusal, so the tap was at least heard.
      setShrug((n) => n + 1);
      navigator.vibrate?.(8);
      return;
    }
    setStage('opening');
    // Let the flap finish turning before the paper replaces the envelope.
    timer.current = window.setTimeout(() => {
      setStage('open');
      onOpened?.();
    }, 1150);
  };

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  return (
    <div className="relative mt-16 flex w-full flex-col items-center">
      <AnimatePresence mode="wait">
        {stage !== 'open' ? (
          <motion.div
            key="envelope"
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -30 }}
            transition={{ duration: 1.3, delay: stage === 'sealed' ? start : 0, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              key={shrug}
              animate={shrug ? { x: [0, -7, 6, -4, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
            <motion.button
              type="button"
              onClick={open}
              aria-label={locked ? `Tersegel — ${prompt}` : 'Buka suratnya'}
              aria-disabled={locked || undefined}
              className={`group relative [perspective:1200px] ${locked ? 'cursor-default' : 'cursor-pointer'}`}
              style={{ width: W, height: H, maxWidth: '86vw' }}
              animate={stage === 'sealed' ? { y: [0, -7, 0] } : { y: 0 }}
              transition={
                stage === 'sealed'
                  ? { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.4 }
              }
            >
              {/* body */}
              <span
                className="absolute inset-0 rounded-[10px]"
                style={{
                  background:
                    'linear-gradient(160deg, color-mix(in srgb, var(--color-rb-accent) 18%, white) 0%, color-mix(in srgb, var(--color-rb-accent) 32%, white) 46%, color-mix(in srgb, var(--color-rb-accent) 48%, white) 100%)',
                  boxShadow:
                    '0 30px 60px -22px rgba(60,35,30,0.45), inset 0 1px 0 rgba(255,255,255,0.6)',
                }}
              />

              {/* the two folds that meet in the middle */}
              <span
                className="absolute inset-0 rounded-[10px] opacity-70"
                style={{
                  background:
                    'linear-gradient(to bottom right, transparent 49.6%, color-mix(in srgb, var(--color-rb-accent-deep) 28%, transparent) 50%, transparent 50.4%), linear-gradient(to bottom left, transparent 49.6%, color-mix(in srgb, var(--color-rb-accent-deep) 28%, transparent) 50%, transparent 50.4%)',
                }}
              />

              {/* flap, hinged on its top edge */}
              <motion.span
                className="absolute left-0 top-0 origin-top"
                style={{
                  width: '100%',
                  height: '62%',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background:
                    'linear-gradient(180deg, color-mix(in srgb, var(--color-rb-accent) 24%, white) 0%, color-mix(in srgb, var(--color-rb-accent) 40%, white) 62%, color-mix(in srgb, var(--color-rb-accent) 56%, white) 100%)',
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
                animate={{ rotateX: stage === 'sealed' ? 0 : -172 }}
                transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* wax seal, riding on the flap tip */}
              <motion.span
                className="absolute left-1/2 flex items-center justify-center"
                style={{ top: '62%', marginLeft: -27, marginTop: -27, width: 54, height: 54 }}
                animate={
                  stage === 'sealed'
                    ? { scale: [1, 1.07, 1], opacity: 1 }
                    : { scale: 0.4, opacity: 0 }
                }
                transition={
                  stage === 'sealed'
                    ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.5 }
                }
              >
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 34% 28%, var(--color-rb-accent) 0%, var(--color-rb-accent-deep) 52%, var(--color-rb-accent-ink) 100%)',
                    boxShadow:
                      '0 6px 14px -4px color-mix(in srgb, var(--color-rb-accent-ink) 70%, transparent), inset 0 1px 2px rgba(255,255,255,0.45)',
                  }}
                />
                <Lily className="relative h-7 w-7 opacity-90" />
              </motion.span>
            </motion.button>
            </motion.div>

            <motion.p
              className="rb-label mt-10 transition-colors group-hover:text-rb-fg"
              animate={{
                opacity: stage !== 'sealed' ? 0 : locked ? 0.8 : [0.45, 1, 0.45],
              }}
              transition={
                stage === 'sealed' && !locked
                  ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.3 }
              }
            >
              {prompt}
            </motion.p>
          </motion.div>
        ) : (
          <motion.article
            key="paper"
            className="relative w-full max-w-2xl px-7 py-12 text-center sm:px-14 sm:py-16"
            initial={{ opacity: 0, y: 70, rotateX: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transformOrigin: 'top center',
              background:
                'linear-gradient(168deg, #FFFDF8 0%, #FDF6EA 55%, #F6EBDA 100%)',
              boxShadow: '0 46px 90px -30px rgba(0,0,0,0.85)',
              borderRadius: 4,
            }}
          >
            {/* the creases from being folded into the envelope */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[4px] opacity-60"
              style={{
                background:
                  'linear-gradient(180deg, transparent 32.4%, rgba(196,176,150,0.35) 33%, transparent 33.6%), linear-gradient(180deg, transparent 66.4%, rgba(196,176,150,0.3) 67%, transparent 67.6%)',
              }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              <Lily className="mx-auto h-8 w-8 opacity-80" />
            </motion.div>

            {kicker ? (
              <motion.p
                className="mt-6 font-rb-body text-[0.55rem] uppercase tracking-label"
                style={{ color: '#A98B78' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.6 }}
              >
                {kicker}
              </motion.p>
            ) : null}

            <motion.h3
              className={`font-rb-script text-4xl sm:text-5xl ${kicker ? 'mt-4' : 'mt-7'}`}
              style={{ color: 'var(--color-rb-accent-deep)' }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              {paper.title}
            </motion.h3>

            <div className="mt-9 space-y-6">
              {paper.body.map((line, i) => (
                <motion.p
                  key={line}
                  className="font-rb-display text-lg italic leading-relaxed sm:text-xl"
                  style={{ color: '#5C3A4C' }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1.1,
                    delay: 1.25 + i * 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.div
              className="mx-auto mt-10 h-px w-24"
              style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-rb-accent) 40%, white), transparent)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: afterBody + 0.3 }}
            />

            {paper.signoff ? (
              <motion.p
                className="mt-8 font-rb-script text-3xl sm:text-4xl"
                style={{ color: 'var(--color-rb-accent-deep)' }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.3, delay: afterBody + 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {paper.signoff}
              </motion.p>
            ) : null}
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}
