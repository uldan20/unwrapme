import type { Metadata, Viewport } from "next";
import Demo from "@/templates/langit-malam/components/Demo";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Demo Langit Malam — Unwrapme",
  description: "Coba template Langit Malam: setiap kencan jadi bintang, dan bintang terakhir dia nyalakan sendiri sampai rasinya jadi hati.",
};

export const viewport: Viewport = {
  themeColor: "#070b22",
  viewportFit: "cover",
};

export default function LangitMalamDemo() {
  const cta = waLink("Halo Unwrapme, aku mau pakai template Langit Malam.");
  return <Demo cta={cta.startsWith("#") ? `/${cta}` : cta} />;
}
