import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import Studio from "@/components/studio/Studio";

export const metadata: Metadata = {
  title: "Studio — Unwrapme",
  description: "Masukkan foto kalian, lalu Claude menyusunnya jadi bab per kencan lengkap dengan draf ceritanya.",
  robots: { index: false },
};

export default function StudioPage() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-5 py-4">
          <Link href="/" aria-label="Kembali ke Unwrapme">
            <Logo />
          </Link>
          <span className="rounded-full bg-fg/5 px-3 py-1 text-xs text-muted">Prototipe</span>
        </div>
      </header>
      <main>
        <Studio />
      </main>
    </>
  );
}
