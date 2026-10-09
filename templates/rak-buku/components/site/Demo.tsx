'use client';

import dynamic from 'next/dynamic';

/*
 * The demo's dates are worked out from today in the viewer's own time zone, so
 * it is rendered in the browser only: a server in another time zone would
 * disagree about which day it is for part of every day.
 */
const DemoChrome = dynamic(() => import('@/templates/rak-buku/components/site/DemoChrome'), { ssr: false });
const Book = dynamic(() => import('@/templates/rak-buku/components/book/Book'), { ssr: false });

export default function Demo({ cta }: { cta: string }) {
  return (
    <DemoChrome cta={cta}>
      <Book />
    </DemoChrome>
  );
}
