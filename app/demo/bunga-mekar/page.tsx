import type { Metadata, Viewport } from "next";
import Demo from "@/templates/bunga-mekar/components/Demo";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Demo Bunga Mekar — Unwrapme",
  description: "Coba template Bunga Mekar: bunga yang mekar sambil memainkan namanya sebagai melodi, lalu surat dan balasan dengan suaranya sendiri.",
};

export const viewport: Viewport = {
  themeColor: "#efe7d8",
  viewportFit: "cover",
};

export default function BungaMekarDemo() {
  const cta = waLink("Halo Unwrapme, aku mau pakai template Bunga Mekar.");
  return <Demo cta={cta.startsWith("#") ? `/${cta}` : cta} />;
}
