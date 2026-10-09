'use client';

import dynamic from 'next/dynamic';

/*
 * Rendered in the browser only: the dates are counted back from the viewer's
 * own clock, and the choices are read from storage.
 */
const PiringanHitam = dynamic(() => import('@/templates/piringan-hitam/components/PiringanHitam'), { ssr: false });

export default function Demo({ cta }: { cta: string }) {
  return <PiringanHitam cta={cta} />;
}
