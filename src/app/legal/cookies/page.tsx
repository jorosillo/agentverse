/**
 * Política de Cookies — Página estática legal.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Cookies — AgentVerse',
  description: 'Información sobre el uso de cookies en la plataforma AgentVerse.',
};

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al inicio
      </Link>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-white mb-2">Política de Cookies</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: 25 de abril de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white">1. ¿Qué son las cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo al visitar un sitio web. Se utilizan ampliamente para hacer que los sitios funcionen de manera eficiente y para proporcionar información a los propietarios del sitio.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Cookies que utilizamos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium">Cookie</th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium">Tipo</th>
                    <th className="text-left py-2 pr-4 text-gray-400 font-medium">Duración</th>
                    <th className="text-left py-2 text-gray-400 font-medium">Finalidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 pr-4 text-violet-300 font-mono text-xs">session_token</td>
                    <td className="py-2 pr-4">Esencial</td>
                    <td className="py-2 pr-4">7 días</td>
                    <td className="py-2">Autenticación del usuario (JWT HttpOnly)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-violet-300 font-mono text-xs">cookie_consent</td>
                    <td className="py-2 pr-4">Esencial</td>
                    <td className="py-2 pr-4">1 año</td>
                    <td className="py-2">Almacena preferencia de cookies del usuario</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Cookies de terceros</h2>
            <p>AgentVerse no utiliza cookies de terceros para seguimiento o publicidad. Solo se utilizan cookies técnicas esenciales para el funcionamiento de la Plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Gestión de cookies</h2>
            <p>Puede gestionar las cookies desde la configuración de su navegador. La desactivación de cookies esenciales puede afectar al funcionamiento de la Plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Más información</h2>
            <p>Para más información sobre cómo tratamos sus datos, consulte nuestra <Link href="/legal/privacy" className="text-violet-400 hover:text-violet-300">Política de Privacidad</Link>.</p>
            <p>Contacto: <a href="mailto:privacidad@agentverse.com" className="text-violet-400 hover:text-violet-300">privacidad@agentverse.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
