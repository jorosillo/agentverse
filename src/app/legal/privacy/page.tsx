/**
 * Política de Privacidad — Página estática legal.
 * RGPD compliant.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad — AgentVerse',
  description: 'Política de privacidad y protección de datos de AgentVerse conforme al RGPD.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al inicio
      </Link>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: 25 de abril de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Responsable del Tratamiento</h2>
            <p>AgentVerse es responsable del tratamiento de los datos personales recogidos a través de la Plataforma, de conformidad con el Reglamento General de Protección de Datos (UE) 2016/679 (RGPD).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Datos Recogidos</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Datos de identificación</strong>: nombre, correo electrónico, empresa.</li>
              <li><strong>Datos profesionales</strong>: habilidades, experiencia, sector, sitio web.</li>
              <li><strong>Datos de uso</strong>: interacciones, mensajes, valoraciones.</li>
              <li><strong>Datos técnicos</strong>: IP, navegador, dispositivo (cookies técnicas).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Finalidad del Tratamiento</h2>
            <p>Los datos se tratan para: gestión de cuentas, intermediación de servicios, sistema de reputación, comunicaciones transaccionales y mejora de la Plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Base Jurídica</h2>
            <p>El tratamiento se basa en: consentimiento del usuario (Art. 6.1.a RGPD), ejecución contractual (Art. 6.1.b RGPD) e interés legítimo (Art. 6.1.f RGPD).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Derechos del Usuario (RGPD)</h2>
            <p>El usuario tiene derecho a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acceso</strong>: solicitar una copia de sus datos personales.</li>
              <li><strong>Rectificación</strong>: corregir datos inexactos.</li>
              <li><strong>Supresión</strong>: solicitar la eliminación de su cuenta y datos (HU-13).</li>
              <li><strong>Portabilidad</strong>: obtener sus datos en formato estructurado.</li>
              <li><strong>Oposición</strong>: oponerse al tratamiento para fines de marketing.</li>
            </ul>
            <p>Para ejercer estos derechos: <a href="mailto:privacidad@agentverse.com" className="text-violet-400 hover:text-violet-300">privacidad@agentverse.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Seguridad</h2>
            <p>Los datos se almacenan en bases de datos cifradas (PostgreSQL en Neon). Las contraseñas se hashean con bcrypt. Los tokens de sesión se transmiten en cookies HttpOnly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">7. Retención de Datos</h2>
            <p>Los datos se conservan mientras la cuenta esté activa. Tras la eliminación (RGPD), los datos se borran en un plazo máximo de 30 días.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">8. Cookies</h2>
            <p>Consulte nuestra <Link href="/legal/cookies" className="text-violet-400 hover:text-violet-300">Política de Cookies</Link> para más información.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
