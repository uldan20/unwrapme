import type { Metadata, Viewport } from "next";
import Demo from "@/templates/piringan-hitam/components/Demo";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Demo Piringan Hitam — Unwrapme",
  description: "Coba template Piringan Hitam: rak piringan berisi lagu-lagu kalian, satu cerita per lagu, dan Sisi B yang terbuka paling akhir.",
};

export const viewport: Viewport = {
  themeColor: "#121110",
  viewportFit: "cover",
};

export default function PiringanHitamDemo() {
  const cta = waLink("Halo Unwrapme, aku mau pakai template Piringan Hitam.");
  return <Demo cta={cta.startsWith("#") ? `/${cta}` : cta} />;
}
