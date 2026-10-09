import type { Metadata, Viewport } from "next";
import { Fraunces, Fredoka, Nunito, Pacifico, Patrick_Hand, Plus_Jakarta_Sans } from "next/font/google";
import Demo from "@/templates/rak-buku/components/site/Demo";
import { waLink } from "@/lib/site";

/*
 * The faces the template's font pairs use (templates/rak-buku/theme.ts), beyond
 * the ones the root layout already loads (Cormorant, Caveat, Yellowtail).
 */
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-pacifico", display: "swap" });
const patrick = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-patrick", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

const fonts = [jakarta, fraunces, fredoka, pacifico, patrick, nunito].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: "Demo Rak Buku — Unwrapme",
  description: "Coba template Rak Buku: satu buku untuk setiap kencan, foto yang bisa dibalik, peta, dan surat bulanan.",
};

export const viewport: Viewport = {
  themeColor: "#fbf4ee",
  viewportFit: "cover",
};

export default function RakBukuDemo() {
  const cta = waLink("Halo Unwrapme, aku mau pakai template Rak Buku.");
  return (
    <div className={fonts}>
      <Demo cta={cta.startsWith("#") ? `/${cta}` : cta} />
    </div>
  );
}
