'use client';

import dynamic from 'next/dynamic';

/*
 * Rendered in the browser only: the dates are counted back from the viewer's
 * own clock, and the choices are read from storage.
 */
const LangitMalam = dynamic(() => import('@/templates/langit-malam/components/LangitMalam'), { ssr: false });

export default function Demo({ cta }: { cta: string }) {
  return <LangitMalam cta={cta} />;
}
