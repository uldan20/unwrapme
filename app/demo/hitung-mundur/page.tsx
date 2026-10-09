import type { Metadata, Viewport } from "next";
import Demo from "@/templates/hitung-mundur/components/Demo";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Demo Hitung Mundur — Unwrapme",
  description: "Coba template Hitung Mundur: terkunci sampai hari ulang tahunnya, lalu tiup lilin, kartu ucapan, foto, dan kado terakhir.",
};

export const viewport: Viewport = {
  themeColor: "#fff1dc",
  viewportFit: "cover",
};

export default function HitungMundurDemo() {
  const cta = waLink("Halo Unwrapme, aku mau pakai template Hitung Mundur.");
  return <Demo cta={cta.startsWith("#") ? `/${cta}` : cta} />;
}
