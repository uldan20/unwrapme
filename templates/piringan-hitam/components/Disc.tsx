'use client';

import Image from 'next/image';
import { vinyl as vinylOf, type VinylKey } from '@/templates/piringan-hitam/theme';

/**
 * One record: grooves in the buyer's vinyl colour, the photograph of the
 * moment as its label. The light across it stays put while it turns, the way
 * it does on a real one.
 */
export function Disc({ vinyl, label, spinning = false, className = '' }: { vinyl: VinylKey; label: string; spinning?: boolean; className?: string }) {
  const v = vinylOf(vinyl);
  return (
    <div className={'relative aspect-square rounded-full ' + className}>
      <div
        className={'absolute inset-0 animate-spin-record rounded-full ' + (spinning ? '' : '[animation-play-state:paused]')}
        style={{
          background: `repeating-radial-gradient(circle at 50% 50%, ${v.groove} 0px, ${v.groove} 1.2px, ${v.gap} 1.5px, ${v.gap} 3px)`,
          boxShadow: 'inset 0 0 22px rgba(0,0,0,0.6), 0 16px 34px -16px rgba(0,0,0,0.85)',
        }}
      >
        <span className="absolute left-1/2 top-1/2 h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-2 ring-black/40">
          <Image src={label} alt="" fill sizes="120px" className="object-cover" />
        </span>
      </div>
      {/* the sheen, which does not turn */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(from 210deg, transparent 0deg, rgba(255,255,255,0.16) 24deg, transparent 60deg, transparent 180deg, rgba(255,255,255,0.12) 206deg, transparent 244deg)',
        }}
      />
      <span aria-hidden className="absolute left-1/2 top-1/2 h-[4%] w-[4%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--ph-bg)" />
    </div>
  );
}

/**
 * The turntable: a plinth, the record, and a tonearm that swings over and
 * drops the needle when `playing` turns on. The record only turns once it has.
 */
export function Turntable({ vinyl, label, playing, className = '' }: { vinyl: VinylKey; label: string; playing: boolean; className?: string }) {
  return (
    <div
      className={'relative aspect-[100/88] rounded-[22px] border border-(--ph-ink)/10 bg-(--ph-lift) shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] ' + className}
      style={{ backgroundImage: 'linear-gradient(160deg, rgba(255,255,255,0.06), transparent 45%)' }}
    >
      {/* the platter's rim */}
      <span className="absolute left-[5%] top-[6.8%] w-[78%] rounded-full bg-black/35" style={{ aspectRatio: '1' }} />
      <div className="absolute left-[6%] top-[8%] w-[76%]">
        <Disc vinyl={vinyl} label={label} spinning={playing} />
      </div>

      <svg viewBox="0 0 100 88" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {/* the arm's base */}
        <circle cx="88" cy="12" r="6.5" fill="currentColor" className="text-(--ph-ink)/15" />
        <circle cx="88" cy="12" r="3.2" fill="currentColor" className="text-(--ph-ink)/45" />
        <g
          style={{
            transform: `rotate(${playing ? 0 : -30}deg)`,
            transformOrigin: '88px 12px',
            transformBox: 'view-box',
            transition: 'transform 1s cubic-bezier(0.3, 1.25, 0.5, 1)',
          }}
        >
          <path d="M88 12 L86.5 52 L69 65" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-(--ph-ink)/70" />
          <rect x="64.5" y="62" width="8" height="5" rx="1.2" transform="rotate(-37 68.5 64.5)" fill="currentColor" className="text-(--ph-accent)" />
        </g>
        {/* the speed switch and a little light that comes on with it */}
        <circle cx="90" cy="78" r="2" fill="currentColor" className={playing ? 'text-(--ph-accent)' : 'text-(--ph-ink)/20'} style={{ transition: 'color 0.6s' }} />
        <text x="84.5" y="79.2" fontSize="3.2" textAnchor="end" fill="currentColor" className="text-(--ph-ink)/35" style={{ fontFamily: 'var(--font-geist)' }}>
          33⅓
        </text>
      </svg>
    </div>
  );
}
