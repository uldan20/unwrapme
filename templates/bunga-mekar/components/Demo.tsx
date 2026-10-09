'use client';

import dynamic from 'next/dynamic';

/*
 * Rendered in the browser only: the choices are read from storage, and the
 * piano and the recorder only exist there.
 */
const BungaMekar = dynamic(() => import('@/templates/bunga-mekar/components/BungaMekar'), { ssr: false });

export default function Demo({ cta }: { cta: string }) {
  return <BungaMekar cta={cta} />;
}
