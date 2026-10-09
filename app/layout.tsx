import type { Metadata, Viewport } from "next";
import { Caveat, Cormorant_Garamond, Geist, Newsreader, Yellowtail } from "next/font/google";
import "./globals.css";

/* The hub's own two faces: an editorial serif for headings, Geist for the rest. */
const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

/* Handwriting, for the odd note in the margin — and the templates' captions. */
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
  display: "swap",
});

/* Only the template previews use these two. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const yellowtail = Yellowtail({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-yellowtail",
  display: "swap",
});

const title = "Unwrapme — template website untuk kalian berdua";
const description =
  "Pilih template, isi foto dan cerita kalian dari HP, kirim link-nya ke dia. Untuk nembak, ulang tahun, anniversary, sampai undangan nikah.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: { title, description, siteName: "Unwrapme", type: "website", locale: "id_ID" },
  twitter: { card: "summary_large_image", title, description },
  formatDetection: { telephone: false, date: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f7f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${newsreader.variable} ${geist.variable} ${caveat.variable} ${cormorant.variable} ${yellowtail.variable} antialiased`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
