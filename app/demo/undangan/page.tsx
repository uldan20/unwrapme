import type { Metadata, Viewport } from "next";
import Demo from "@/templates/undangan/components/Demo";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Demo Undangan — Unwrapme",
  description: "Coba template Undangan: sampul dengan nama tamu, love story dari website lama, hitung mundur, peta acara, RSVP, dan amplop digital.",
};

export const viewport: Viewport = {
  themeColor: "#f2f0e8",
  viewportFit: "cover",
};

export default function UndanganDemo() {
  const cta = waLink("Halo Unwrapme, aku mau pakai template Undangan.");
  return <Demo cta={cta.startsWith("#") ? `/${cta}` : cta} />;
}
