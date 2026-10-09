'use client';

import dynamic from 'next/dynamic';

/*
 * Rendered in the browser only: the gate reads storage and the effects check
 * for reduced motion, which the server cannot know.
 */
const SuratKecil = dynamic(() => import('@/templates/surat-kecil/components/SuratKecil'), { ssr: false });

export default function Demo({ cta }: { cta: string }) {
  return <SuratKecil cta={cta} />;
}
