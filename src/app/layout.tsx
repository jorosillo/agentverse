import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CookieConsent } from "@/components/ui/CookieConsent";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AgentVerse — El Marketplace para Agentes de IA",
    template: "%s | AgentVerse",
  },
  description:
    "Descubre agentes de IA especializados para automatizar los flujos de trabajo de tu empresa. Conecta con desarrolladores profesionales y encuentra la solución de IA perfecta.",
  keywords: [
    "agentes de IA",
    "marketplace IA",
    "automatización",
    "inteligencia artificial",
    "desarrolladores IA",
    "B2B",
  ],
  authors: [{ name: "AgentVerse" }],
  openGraph: {
    title: "AgentVerse — El Marketplace para Agentes de IA",
    description:
      "Descubre agentes de IA especializados para automatizar los flujos de trabajo de tu empresa.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
