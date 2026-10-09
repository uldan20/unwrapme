'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Mic, PenLine, RotateCcw, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { bloom } from '@/templates/bunga-mekar/data/bloom';
import { SHAPES, flowerOf, type FlowerKey } from '@/templates/bunga-mekar/flowers';

const LIMIT = 60;

type Mode = 'voice' | 'text';
type Take = { state: 'idle' } | { state: 'recording'; since: number } | { state: 'done'; url: string; seconds: number };

/** A few petals of her flower, flying off with the reply. */
function Flight({ flower }: { flower: FlowerKey }) {
  const f = flowerOf(flower);
  const [petals] = useState(() =>
    Array.from({ length: 9 }, (_, i) => ({ x: (Math.random() - 0.5) * 260, y: -220 - Math.random() * 200, r: (Math.random() - 0.5) * 540, d: i * 0.06, s: 14 + Math.random() * 12 })),
  );
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {petals.map((p, i) => (
        <motion.svg
          key={i}
          viewBox="-1 -1.1 2 1.2"
          width={p.s}
          height={p.s * 1.2}
          className="absolute -translate-x-1/2"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
          animate={{ x: p.x, y: p.y, rotate: p.r, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.2, delay: p.d, ease: [0.2, 0.6, 0.4, 1] }}
        >
          <path d={SHAPES[f.shape]} fill={f.colors[i % 2 ? 1 : 2]} />
        </motion.svg>
      ))}
    </div>
  );
}

/**
 * Her answer: in her own voice (recorded here, kept on her device in the
 * demo) or in writing. Sent, it flies off as petals of the flower.
 */
export default function Reply({ flower, hush }: { flower: FlowerKey; hush: (quiet: boolean) => void }) {
  const still = useReducedMotion();
  const [mode, setMode] = useState<Mode>('voice');
  const [take, setTake] = useState<Take>({ state: 'idle' });
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const urlRef = useRef('');
  const hushRef = useRef(hush);

  useEffect(() => {
    hushRef.current = hush;
  }, [hush]);

  useEffect(
    () => () => {
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  /* the timer while recording, and the stop at the limit */
  useEffect(() => {
    if (take.state !== 'recording') return;
    const t = setInterval(() => {
      const s = (performance.now() - take.since) / 1000;
      setNow(s);
      if (s >= LIMIT) recorder.current?.stop();
    }, 200);
    return () => clearInterval(t);
  }, [take]);

  const record = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Browser ini belum bisa merekam. Tulis saja balasanmu.');
      setMode('text');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      const r = new MediaRecorder(s);
      const chunks: Blob[] = [];
      const since = performance.now();
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = () => {
        s.getTracks().forEach((t) => t.stop());
        hushRef.current(false);
        const blob = new Blob(chunks, { type: r.mimeType || 'audio/webm' });
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(blob);
        setTake({ state: 'done', url: urlRef.current, seconds: Math.round((performance.now() - since) / 1000) });
      };
      recorder.current = r;
      hush(true);
      r.start();
      setNow(0);
      setTake({ state: 'recording', since });
    } catch {
      setError('Mikrofonnya tidak bisa dipakai. Tulis saja balasanmu.');
      setMode('text');
    }
  };

  const ready = mode === 'voice' ? take.state === 'done' : text.trim().length > 0;
  const send = () => {
    if (!ready) return;
    navigator.vibrate?.([10, 40, 10]);
    setSent(true);
  };

  const tab = (m: Mode, label: string, Icon: typeof Mic) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      disabled={take.state === 'recording'}
      className={'flex min-h-10 items-center justify-center gap-1.5 rounded-full text-[13px] transition ' + (mode === m ? 'bg-(--bm-paper) font-medium text-(--bm-paper-ink) shadow-sm' : 'text-(--bm-ink)/60')}
    >
      <Icon size={14} /> {label}
    </button>
  );

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="sent" className="relative py-6 text-center" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            {!still ? <Flight flower={flower} /> : null}
            <p className="font-serif text-[1.7rem] italic leading-tight">{bloom.reply.sent}</p>
            <p className="mt-1 font-serif text-[1.15rem] italic text-(--bm-ink)/70">{bloom.reply.sentLine}</p>
            <p className="mt-3 text-[12px] text-(--bm-ink)/50">{bloom.reply.demo}</p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
            <h2 className="font-serif text-[1.9rem] italic leading-tight">{bloom.reply.title}</h2>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-(--bm-ink)/[0.07] p-1">
              {tab('voice', bloom.reply.voice, Mic)}
              {tab('text', bloom.reply.text, PenLine)}
            </div>

            {mode === 'voice' ? (
              <div className="mt-4 flex min-h-[132px] flex-col items-center justify-center rounded-[18px] border border-(--bm-ink)/15 p-4 text-center">
                {take.state === 'idle' ? (
                  <>
                    <button
                      type="button"
                      onClick={record}
                      aria-label="Mulai merekam"
                      className="grid h-16 w-16 place-items-center rounded-full bg-(--bm-accent) text-(--bm-on-accent) shadow-[0_10px_24px_-12px_rgba(40,10,10,0.7)] transition active:scale-95"
                    >
                      <Mic size={24} />
                    </button>
                    <p className="mt-2 text-[13px] text-(--bm-ink)/60">{bloom.reply.record} · maks. 1 menit</p>
                  </>
                ) : take.state === 'recording' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => recorder.current?.stop()}
                      aria-label="Berhenti merekam"
                      className="relative grid h-16 w-16 place-items-center rounded-full bg-(--bm-accent) text-(--bm-on-accent)"
                    >
                      {!still ? (
                        <motion.span
                          className="absolute inset-0 rounded-full border-2 border-(--bm-accent)"
                          animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                        />
                      ) : null}
                      <Square size={18} fill="currentColor" />
                    </button>
                    <p className="mt-2 font-mono text-[13px] tabular-nums text-(--bm-ink)/70">
                      0:{String(Math.floor(now)).padStart(2, '0')} / 1:00 · ketuk untuk berhenti
                    </p>
                  </>
                ) : (
                  <div className="w-full">
                    <audio src={take.url} controls className="w-full" />
                    <button
                      type="button"
                      onClick={() => setTake({ state: 'idle' })}
                      className="mt-2 inline-flex min-h-11 items-center gap-1.5 px-3 text-[13px] text-(--bm-ink)/60 underline-offset-4 hover:underline"
                    >
                      <RotateCcw size={13} /> rekam ulang
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                aria-label={`Balasan untuk ${bloom.from}`}
                placeholder={bloom.reply.placeholder}
                className="mt-4 w-full resize-none rounded-[18px] border border-(--bm-ink)/15 bg-(--bm-paper) px-4 py-3 text-[16px] text-(--bm-paper-ink) outline-none placeholder:text-(--bm-paper-ink)/35 focus:border-(--bm-accent)"
              />
            )}
            {error ? <p className="mt-2 text-[13px] text-(--bm-accent)">{error}</p> : null}

            <button
              type="button"
              onClick={send}
              disabled={!ready}
              className="mt-3 min-h-12 w-full rounded-full bg-(--bm-ink) py-3.5 text-[15px] font-medium text-(--bm-bg) transition disabled:opacity-30"
            >
              kirim ke {bloom.from}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
