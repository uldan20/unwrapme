'use client';

import dynamic from 'next/dynamic';

/*
 * Rendered in the browser only: the countdown is worked out from the viewer's
 * own clock, and the choices are read from storage.
 */
const HitungMundur = dynamic(() => import('@/templates/hitung-mundur/components/HitungMundur'), { ssr: false });

export default function Demo({ cta }: { cta: string }) {
  return <HitungMundur cta={cta} />;
}
