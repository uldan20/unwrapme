'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Palette } from 'lucide-react';
import { useState } from 'react';
import AudioProvider from '@/templates/rak-buku/components/audio/AudioProvider';
import NowPlaying from '@/templates/rak-buku/components/audio/NowPlaying';
import SongGate from '@/templates/rak-buku/components/audio/SongGate';
import Backdrop from '@/templates/rak-buku/components/effects/Backdrop';
import PetalPicking from '@/templates/rak-buku/components/effects/PetalPicking';
import Customizer from '@/templates/rak-buku/components/site/Customizer';
import { ThemeProvider } from '@/templates/rak-buku/components/site/ThemeContext';
import { DEFAULT_THEME, themeVars, type Theme } from '@/templates/rak-buku/theme';

const GATE_KEY = 'unwrapme-rakbuku-entered';
const THEME_KEY = 'unwrapme-rakbuku-theme';

function readTheme(): Theme {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) ?? 'null') as Partial<Theme> | null;
    if (!saved) return DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...saved, features: { ...DEFAULT_THEME.features, ...saved.features } };
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Everything around the album in the demo: the theme, the record shelf she
 * meets first, the paper it all sits on, the corner player, and — where a
 * buyer's site has nothing — a small Unwrapme bar, with a way to try the theme
 * choices a buyer gets in the Studio and a way to start one's own.
 */
export default function DemoChrome({ children, cta }: { children: React.ReactNode; cta: string }) {
  // Rendered in the browser only (see Demo.tsx), so storage can be read up front.
  const [entered, setEntered] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(GATE_KEY) === '1';
    } catch {
      return false; // private mode: show the gate
    }
  });
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [tuning, setTuning] = useState(false);

  const enter = () => {
    try {
      sessionStorage.setItem(GATE_KEY, '1');
    } catch {
      /* ignore */
    }
    setEntered(true);
  };

  const change = (next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const songs = theme.features.lagu;
  /* Without songs there is nothing to choose before going in. */
  const inside = entered || !songs;

  return (
    <ThemeProvider value={theme}>
      <div className="isolate min-h-[100svh] bg-rb-bg font-rb-body text-rb-fg" style={themeVars(theme)}>
        <AudioProvider>
          <Backdrop />
          {songs ? <SongGate skip={entered} onEnter={enter} /> : null}
          <AnimatePresence>
            {inside ? (
              <motion.nav
                key="demo-bar"
                className="fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))]"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-1 rounded-full border border-rb-fg/10 bg-rb-bg-soft/85 p-1 shadow-[0_8px_24px_-12px_rgba(40,25,20,0.35)] backdrop-blur-md">
                  <Link
                    href="/#template"
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 font-rb-body text-[0.58rem] uppercase tracking-label text-rb-fg-dim transition-colors hover:text-rb-fg sm:px-4 sm:text-[0.62rem]"
                  >
                    <ArrowLeft size={12} />
                    Unwrapme
                  </Link>
                  <button
                    type="button"
                    onClick={() => setTuning(true)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 font-rb-body text-[0.58rem] uppercase tracking-label text-rb-fg-soft transition-colors hover:text-rb-fg sm:px-4 sm:text-[0.62rem]"
                  >
                    <Palette size={13} />
                    <span className="hidden sm:inline">ubah tampilan</span>
                    <span className="sm:hidden">tampilan</span>
                  </button>
                  <Link
                    href={cta}
                    className="rounded-full bg-rb-accent px-4 py-2 font-rb-body text-[0.58rem] uppercase tracking-label text-rb-on-accent shadow-petal transition hover:bg-rb-accent-deep sm:px-5 sm:text-[0.62rem]"
                  >
                    <span className="hidden sm:inline">pakai template ini</span>
                    <span className="sm:hidden">pakai</span>
                  </Link>
                </div>
              </motion.nav>
            ) : null}
          </AnimatePresence>
          {children}
          {songs ? <NowPlaying visible={inside} /> : null}
          {inside ? <PetalPicking /> : null}
        </AudioProvider>
        <Customizer open={tuning} theme={theme} onChange={change} onClose={() => setTuning(false)} />
      </div>
    </ThemeProvider>
  );
}
