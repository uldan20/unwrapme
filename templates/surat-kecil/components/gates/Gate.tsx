'use client';

import Envelope from '@/templates/surat-kecil/components/gates/Envelope';
import GiftBox from '@/templates/surat-kecil/components/gates/GiftBox';
import HoldToOpen from '@/templates/surat-kecil/components/gates/HoldToOpen';
import type { Gate as GateKind } from '@/templates/surat-kecil/theme';

/**
 * The first screen, in the style the buyer chose. Every gate calls `onBreak`
 * inside her first touch (so the song may start) and `onOpen` once it has
 * finished opening.
 */
export default function Gate({ kind, onBreak, onOpen }: { kind: GateKind; onBreak: () => void; onOpen: () => void }) {
  switch (kind) {
    case 'amplop':
      return <Envelope onBreak={onBreak} onOpen={onOpen} />;
    case 'kado':
      return <GiftBox onBreak={onBreak} onOpen={onOpen} />;
    case 'tahan':
      return <HoldToOpen onBreak={onBreak} onOpen={onOpen} />;
  }
}
