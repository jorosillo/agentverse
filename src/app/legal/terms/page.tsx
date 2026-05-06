/**
 * Términos y Condiciones — Página estática legal.
 * SEO optimized con metadata.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — AgentVerse',
  description: 'Términos y condiciones de uso de la plataforma AgentVerse, marketplace B2B de agentes de IA.',
};

export default function TermsPage() {
  return (
    <div className="page-shell-narrow">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al inicio
      </Link>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-8 lg:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Términos y Condiciones</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: 25 de abril de 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-7 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar AgentVerse (&ldquo;la Plataforma&rdquo;), el usuario acepta quedar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de los términos, no debe utilizar la Plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">2. Definiciones</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>&ldquo;Desarrollador&rdquo;</strong>: Usuario registrado con rol DEVELOPER que publica agentes de IA.</li>
              <li><strong>&ldquo;Empresa&rdquo;</strong>: Usuario registrado con rol COMPANY que publica ofertas de trabajo.</li>
              <li><strong>&ldquo;Agente&rdquo;</strong>: Producto o servicio de IA publicado por un Desarrollador.</li>
              <li><strong>&ldquo;Oferta&rdquo;</strong>: Solicitud de trabajo publicada por una Empresa.</li>
              <li><strong>&ldquo;Acuerdo&rdquo;</strong>: Transacción acordada entre un Desarrollador y una Empresa.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">3. Registro y Cuentas</h2>
            <p>Los usuarios deben proporcionar información veraz al registrarse. AgentVerse se reserva el derecho de suspender o eliminar cuentas que infrinjan estos términos o proporcionen información falsa.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">4. Uso Aceptable</h2>
            <p>Los usuarios se comprometen a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>No utilizar la Plataforma para actividades ilegales o fraudulentas.</li>
              <li>No publicar contenido ofensivo, difamatorio o que infrinja derechos de propiedad intelectual.</li>
              <li>No intentar acceder de forma no autorizada a datos de otros usuarios.</li>
              <li>Respetar los límites de uso establecidos (máximo 5 publicaciones/día, 10 mensajes/hora).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">5. Pagos Simulados</h2>
            <p>AgentVerse opera con un sistema de pagos simulados (mock payments). No se procesan transacciones financieras reales a través de la Plataforma en su versión MVP. Los importes acordados son meramente indicativos.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">6. Propiedad Intelectual</h2>
            <p>Cada usuario retiene la propiedad intelectual de su contenido. Al publicar en AgentVerse, el usuario otorga a la Plataforma una licencia no exclusiva para mostrar dicho contenido.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">7. Sistema de Reputación</h2>
            <p>Las valoraciones y puntuaciones de reputación se calculan algorítmicamente y son un reflejo de la actividad del usuario. AgentVerse no garantiza la precisión absoluta de estas métricas.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">8. Limitación de Responsabilidad</h2>
            <p>AgentVerse actúa como intermediario y no es parte de los acuerdos entre usuarios. La Plataforma no se responsabiliza de la calidad de los servicios prestados entre usuarios.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">9. Modificaciones</h2>
            <p>AgentVerse se reserva el derecho de modificar estos términos. Los cambios serán notificados a los usuarios registrados por correo electrónico.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">10. Contacto</h2>
            <p>Para consultas legales: <a href="mailto:legal@agentverse.com" className="text-violet-400 hover:text-violet-300">legal@agentverse.com</a></p>
            <p>Para disputas: <a href="mailto:disputas@agentverse.com" className="text-violet-400 hover:text-violet-300">disputas@agentverse.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
