'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { defaultSong, songs, type Song } from '@/templates/rak-buku/data/story';

/** What is happening while a photograph is being held. */
export type Snippet = {
  song: Song;
  /** 0 to 1 through the clip, for the ring drawn on the photograph. */
  progress: number;
};

type AudioRoom = {
  /** What is loaded — not necessarily what is sounding. */
  song: Song;
  playing: boolean;
  /** True once a song has actually been started at least once. */
  started: boolean;
  /** Load a song and play it. Safe to call straight out of a click. */
  select: (song: Song) => void;
  toggle: () => void;
  /** For the corner player's progress ring, which listens for itself. */
  element: () => HTMLAudioElement | null;

  /**
   * Duck whatever is playing and lift a few seconds of another song over the
   * top of it, then hand back. Used by holding a photograph in the story.
   */
  playSnippet: (songId: string, seconds?: number) => void;
  /** Non-null only while a clip is up. */
  snippet: Snippet | null;
  /**
   * Touch the clip element inside a tap, so that clips asked for minutes later
   * — by the story playing itself — are still allowed to sound on a phone.
   */
  prime: (songId: string) => void;
};

const Ctx = createContext<AudioRoom | null>(null);

export function useAudio() {
  const room = useContext(Ctx);
  if (!room) throw new Error('useAudio must be used inside <AudioProvider>');
  return room;
}

const CHOICE_KEY = 'unwrapme-rakbuku-song';
/** How long a song takes to come up out of nothing, and to go back down. */
const FADE_MS = 900;
/** How far the song already playing steps back while a clip is over it. */
const DUCK_TO = 0.1;
/** Default length of a held-photograph clip. */
const SNIPPET_SECONDS = 7;

/**
 * One `<audio>` element for the whole site, living above the router so the song
 * survives every page change. Volume is ramped rather than switched, because a
 * song appearing at full level is a jolt and this site is not a jolt.
 */
export default function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | null>(null);
  const [song, setSong] = useState<Song>(defaultSong);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  /* A second element entirely, so lifting a clip over the song never disturbs
     where the song itself had got to. */
  const clipRef = useRef<HTMLAudioElement>(null);
  const clipTimers = useRef<number[]>([]);
  const clipFade = useRef<number | null>(null);
  const [snippet, setSnippet] = useState<Snippet | null>(null);

  /* Remember which one she chose last time, so a reload does not lose it. */
  useEffect(() => {
    const saved = sessionStorage.getItem(CHOICE_KEY);
    const found = songs.find((s) => s.id === saved);
    if (found) setSong(found);
  }, []);

  const clearFade = () => {
    if (fadeRef.current !== null) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  };

  const fadeTo = useCallback((target: number, ms = FADE_MS) => {
    const el = audioRef.current;
    if (!el) return;
    clearFade();
    const from = el.volume;
    const start = performance.now();
    fadeRef.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / ms);
      // Ease out, so most of the change happens early and it settles quietly.
      el.volume = Math.max(0, Math.min(1, from + (target - from) * (1 - (1 - t) ** 3)));
      if (t >= 1) clearFade();
    }, 40);
  }, []);

  const select = useCallback(
    (next: Song) => {
      const el = audioRef.current;
      if (!el) return;

      setSong(next);
      sessionStorage.setItem(CHOICE_KEY, next.id);

      /* `play()` has to happen in the same turn as the click that caused it, or
         the browser refuses. So the source is swapped and started immediately,
         and only the volume is animated. */
      if (el.src !== new URL(next.src, window.location.href).href) el.src = next.src;
      el.volume = 0;
      el.play().then(
        () => {
          setPlaying(true);
          setStarted(true);
          fadeTo(next.volume ?? 0.55);
        },
        () => setPlaying(false)
      );
    },
    [fadeTo]
  );

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (!el.src) {
      select(song);
      return;
    }
    if (playing) {
      clearFade();
      fadeTo(0, 420);
      window.setTimeout(() => {
        el.pause();
        setPlaying(false);
      }, 440);
    } else {
      el.volume = 0;
      el.play().then(
        () => {
          setPlaying(true);
          setStarted(true);
          fadeTo(song.volume ?? 0.55);
        },
        () => setPlaying(false)
      );
    }
  }, [fadeTo, playing, select, song]);

  /* ── holding a photograph ──────────────────────────────────────
     Two fades running against each other: the song steps back, the clip comes
     up over it, and at the end they trade places again. Everything is torn down
     by id so a second hold cancels the first cleanly. */

  const clearClip = () => {
    clipTimers.current.forEach(window.clearTimeout);
    clipTimers.current = [];
    if (clipFade.current !== null) {
      window.clearInterval(clipFade.current);
      clipFade.current = null;
    }
  };

  const rampClip = useCallback((target: number, ms: number) => {
    const el = clipRef.current;
    if (!el) return;
    if (clipFade.current !== null) window.clearInterval(clipFade.current);
    const from = el.volume;
    const start = performance.now();
    clipFade.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / ms);
      el.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t >= 1 && clipFade.current !== null) {
        window.clearInterval(clipFade.current);
        clipFade.current = null;
      }
    }, 40);
  }, []);

  const playSnippet = useCallback(
    (songId: string, seconds = SNIPPET_SECONDS) => {
      const clip = clipRef.current;
      const found = songs.find((s) => s.id === songId);
      if (!clip || !found) return;

      clearClip();

      if (clip.src !== new URL(found.src, window.location.href).href) clip.src = found.src;
      const at = found.snippetAt ?? 45;
      // A track shorter than the offset would otherwise start at its own end.
      clip.currentTime = Number.isFinite(clip.duration) && clip.duration > seconds
        ? Math.min(at, Math.max(0, clip.duration - seconds - 1))
        : at;
      clip.volume = 0;

      clip.play().then(
        () => {
          setSnippet({ song: found, progress: 0 });
          if (playing) fadeTo(DUCK_TO, 420);
          rampClip(found.volume ?? 0.55, 700);

          const startedAt = performance.now();
          const tick = window.setInterval(() => {
            const p = Math.min(1, (performance.now() - startedAt) / (seconds * 1000));
            setSnippet((cur) => (cur ? { ...cur, progress: p } : cur));
          }, 90);
          clipTimers.current.push(tick as unknown as number);

          clipTimers.current.push(
            // Start handing back a beat before the end, so the two cross rather
            // than one stopping and the other starting.
            window.setTimeout(() => {
              rampClip(0, 900);
              if (playing) fadeTo(song.volume ?? 0.55, 900);
            }, seconds * 1000 - 700),
            window.setTimeout(() => {
              window.clearInterval(tick);
              clip.pause();
              setSnippet(null);
            }, seconds * 1000 + 350)
          );
        },
        () => setSnippet(null)
      );
    },
    [fadeTo, playing, rampClip, song]
  );

  /* Phones only let a media element start from inside a tap — once. A silent
     start-and-stop here, in the tap, is what lets every later clip play. */
  const prime = useCallback((songId: string) => {
    const clip = clipRef.current;
    const found = songs.find((s) => s.id === songId);
    if (!clip || !found || snippet) return;
    if (clip.src !== new URL(found.src, window.location.href).href) clip.src = found.src;
    clip.volume = 0;
    clip.play().then(
      () => clip.pause(),
      () => {
        /* refused — the clips will simply stay quiet on this device */
      }
    );
  }, [snippet]);

  useEffect(
    () => () => {
      clearFade();
      clearClip();
    },
    []
  );

  const value = useMemo<AudioRoom>(
    () => ({
      song,
      playing,
      started,
      select,
      toggle,
      element: () => audioRef.current,
      playSnippet,
      snippet,
      prime,
    }),
    [song, playing, started, select, toggle, playSnippet, snippet, prime]
  );

  return (
    <Ctx.Provider value={value}>
      <audio
        ref={audioRef}
        loop
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <audio ref={clipRef} preload="none" />
      {children}
    </Ctx.Provider>
  );
}
