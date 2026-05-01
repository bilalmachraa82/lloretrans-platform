import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Lloretrans × AiTiPro — Plataforma",
  description: "6 MVPs operacionais num único ambiente. Dashboards, OCR, bolsa de carga, oficina PWA.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
