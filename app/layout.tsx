import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lloretrans × AiTiPro — Plataforma",
  description: "6 MVPs num único ambiente. Dashboards operacionais, OCR, bolsa de carga, oficina e mais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
