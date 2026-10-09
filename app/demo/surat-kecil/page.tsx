import type { Metadata, Viewport } from "next";
import { Courier_Prime } from "next/font/google";
import Demo from "@/templates/surat-kecil/components/Demo";
import { waLink } from "@/lib/site";

/* The typewriter the letter is typed in. The rest comes from the root layout (Newsreader, Caveat, Yellowtail). */
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier", display: "swap" });

export const metadata: Metadata = {
  title: "Demo Surat Kecil — Unwrapme",
  description: "Coba template Surat Kecil: buka segelnya, baca suratnya, lalu jawab pertanyaannya.",
};

export const viewport: Viewport = {
  themeColor: "#f4dcd6",
  viewportFit: "cover",
};

export default function SuratKecilDemo() {
  const cta = waLink("Halo Unwrapme, aku mau pakai template Surat Kecil.");
  return (
    <div className={courier.variable}>
      <Demo cta={cta.startsWith("#") ? `/${cta}` : cta} />
    </div>
  );
}
