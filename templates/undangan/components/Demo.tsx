'use client';

import dynamic from 'next/dynamic';

/*
 * Rendered in the browser only: the wedding day and the countdown are worked
 * out from the viewer's own clock, the guest's name comes from the link, and
 * the choices are read from storage.
 */
const Undangan = dynamic(() => import('@/templates/undangan/components/Undangan'), { ssr: false });

export default function Demo({ cta }: { cta: string }) {
  return <Undangan cta={cta} />;
}
