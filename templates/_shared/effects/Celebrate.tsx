'use client';

import Balloons from '@/templates/_shared/effects/Balloons';
import Confetti from '@/templates/_shared/effects/Confetti';
import Fireworks from '@/templates/_shared/effects/Fireworks';
import HeartFlood from '@/templates/_shared/effects/HeartFlood';
import Petals from '@/templates/_shared/effects/Petals';

export type Effect = 'hati' | 'confetti' | 'kelopak' | 'kembang-api' | 'balon';

/**
 * The celebrations a buyer can pick from for the moment she says yes.
 * `reveal` is when, in seconds, the words underneath should start to show:
 * later for the effects that cover the whole screen first.
 */
export const EFFECTS: { key: Effect; label: string; note: string; emoji: string; reveal: number }[] = [
  { key: 'hati', label: 'Banjir hati', note: 'Layar penuh hati, lalu terbuka dari tengah', emoji: '💖', reveal: 1.35 },
  { key: 'confetti', label: 'Confetti', note: 'Kertas dan hati kecil meledak ke atas', emoji: '🎉', reveal: 0.15 },
  { key: 'kelopak', label: 'Hujan kelopak', note: 'Kelopak mawar turun pelan-pelan', emoji: '🌸', reveal: 0.3 },
  { key: 'kembang-api', label: 'Kembang api', note: 'Langit meredup, lima kembang api naik', emoji: '🎆', reveal: 0.6 },
  { key: 'balon', label: 'Balon terbang', note: 'Seikat balon dilepas dari bawah', emoji: '🎈', reveal: 0.3 },
];

export const DEFAULT_EFFECT: Effect = 'hati';

export function revealOf(effect: Effect) {
  return EFFECTS.find((e) => e.key === effect)?.reveal ?? 0;
}

export default function Celebrate({ effect }: { effect: Effect }) {
  switch (effect) {
    case 'hati':
      return <HeartFlood />;
    case 'confetti':
      return <Confetti />;
    case 'kelopak':
      return <Petals />;
    case 'kembang-api':
      return <Fireworks />;
    case 'balon':
      return <Balloons />;
  }
}
