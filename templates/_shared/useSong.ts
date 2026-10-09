'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const MUTE_KEY = 'unwrapme-demo-muted';
const VOLUME = 0.6;

/**
 * One looping song. Browsers only allow sound after a tap, so `start` must be
 * called from one (the gate). It fades in rather than starting loud, crossfades
 * when the song is changed, pauses while the tab is hidden, and remembers being muted.
 */
export function useSong(src: string) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const raf = useRef(0);
  const started = useRef(false);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const fadeTo = useCallback((to: number, ms: number) => {
    const a = audio.current;
    if (!a) return;
    cancelAnimationFrame(raf.current);
    const from = a.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.max(0, Math.min(1, (t - t0) / ms));
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  const start = useCallback(() => {
    if (!audio.current) {
      const a = new Audio(src);
      a.loop = true;
      a.volume = 0;
      audio.current = a;
    }
    started.current = true;
    const a = audio.current;
    a.muted = muted;
    a.play()
      .then(() => fadeTo(VOLUME, 1800))
      .catch(() => {
        /* blocked or missing: the demo works silently */
      });
  }, [src, muted, fadeTo]);

  /* a different song chosen while one is playing: fade it out, swap, fade the new one in */
  useEffect(() => {
    const a = audio.current;
    if (!a || a.src.endsWith(src)) return;
    if (!started.current) {
      a.src = src;
      return;
    }
    fadeTo(0, 300);
    const t = setTimeout(() => {
      a.src = src;
      a.currentTime = 0;
      a.play()
        .then(() => fadeTo(VOLUME, 1200))
        .catch(() => {});
    }, 320);
    return () => clearTimeout(t);
  }, [src, fadeTo]);

  /** Quiet the song for a moment (a melody of its own, a voice) and bring it back. */
  const hush = useCallback(
    (quiet: boolean) => {
      if (!started.current) return;
      fadeTo(quiet ? 0 : VOLUME, quiet ? 700 : 2000);
    },
    [fadeTo],
  );

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (audio.current) audio.current.muted = next;
      try {
        localStorage.setItem(MUTE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      const a = audio.current;
      if (!a || !started.current) return;
      if (document.hidden) a.pause();
      else a.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(raf.current);
      audio.current?.pause();
    };
  }, []);

  return { start, hush, muted, toggle };
}
