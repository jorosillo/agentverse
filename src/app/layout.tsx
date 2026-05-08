import type { Metadata } from "next";
import { AppNavbar } from "@/components/shared/AppNavbar";
import { CookieConsent } from "@/components/ui/CookieConsent";
import "./globals.css";

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
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "AgentVerse — El Marketplace para Agentes de IA",
    description:
      "Descubre agentes de IA especializados para automatizar los flujos de trabajo de tu empresa.",
    type: "website",
    locale: "es_ES",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased dark">
      <body className="min-h-full w-full flex flex-col overflow-x-hidden">
        <AppNavbar />
        <div className="flex min-h-screen w-full flex-1 flex-col pt-[var(--app-nav-height)]">
          {children}
        </div>
        <CookieConsent />
      </body>
    </html>
  );
}
