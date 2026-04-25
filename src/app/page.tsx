/**
 * Landing Page — Página principal para usuarios no autenticados.
 * Fuente: AgentVerse.md — Landing Page.
 * 
 * Secciones:
 * 1. Hero con CTA
 * 2. Importancia de IA / Features
 * 3. Carrusel de agentes populares (placeholder)
 * 4. CTA final de registro
 */
import Link from 'next/link';
import { LandingNavbar } from '@/components/shared/LandingNavbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/Button';
import {
  Bot,
  Zap,
  Shield,
  MessageSquare,
  Star,
  ArrowRight,
  Sparkles,
  Globe,
  Code2,
  BrainCircuit,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />

      <main className="min-h-screen">
        {/* ================================================================
            HERO SECTION
            ================================================================ */}
        <section className="relative pt-40 pb-20 sm:pt-48 sm:pb-28 overflow-hidden">
          {/* Background glow effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/8 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/20 mb-8">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-300">
                Marketplace B2B de Agentes de IA
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight mb-8 mt-12">
              El marketplace para{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Agentes de IA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Descubre agentes de IA especializados para automatizar los flujos de trabajo de tu empresa.
              Conecta con desarrolladores profesionales y encuentra la solución de IA perfecta.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="min-w-[200px]">
                  <Bot className="h-5 w-5" />
                  Explorar agentes
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="min-w-[200px]">
                  <Zap className="h-5 w-5" />
                  Explorar ofertas
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-lg mx-auto border-t border-white/5 pt-12">
              {[
                { value: '100+', label: 'Agentes disponibles' },
                { value: '50+', label: 'Empresas activas' },
                { value: '4.8', label: 'Rating promedio' },
              ].map((stat) => (
                <div key={stat.label} className="text-center bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-400 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            FEATURES SECTION — Importancia de la IA
            ================================================================ */}
        <section className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-violet-600/[0.02] to-transparent" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                ¿Por qué{' '}
                <span className="text-violet-400">AgentVerse</span>?
              </h2>
              <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                La plataforma que conecta la demanda empresarial con el talento IA más especializado
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: BrainCircuit,
                  title: 'Agentes especializados',
                  description:
                    'Encuentra agentes de IA adaptados a tus necesidades específicas: chatbots, análisis de datos, automatización y mucho más.',
                },
                {
                  icon: Shield,
                  title: 'Acuerdos seguros',
                  description:
                    'Sistema de pagos simulado con certificación bilateral. Cada acuerdo está protegido por nuestra plataforma.',
                },
                {
                  icon: Star,
                  title: 'Reputación verificada',
                  description:
                    'Sistema de reputación progresiva con badges de verificación. Evalúa a los profesionales antes de contratar.',
                },
                {
                  icon: MessageSquare,
                  title: 'Comunicación directa',
                  description:
                    'Mensajería integrada para negociar acuerdos, hacer seguimiento del progreso y resolver dudas en tiempo real.',
                },
                {
                  icon: Globe,
                  title: 'Marketplace global',
                  description:
                    'Conecta con desarrolladores y empresas de todo el mundo. Sin fronteras para la innovación.',
                },
                {
                  icon: TrendingUp,
                  title: 'Métricas en tiempo real',
                  description:
                    'Dashboards personalizados con KPIs y analíticas para medir tu impacto y optimizar tu negocio.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
                >
                  <div className="mb-5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 group-hover:bg-violet-600/15 transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            HOW IT WORKS SECTION
            ================================================================ */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Cómo funciona
              </h2>
              <p className="mt-4 text-gray-400 max-w-xl mx-auto">
                Tres pasos para conectar con la solución de IA perfecta
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: '01',
                  icon: Users,
                  title: 'Regístrate',
                  description:
                    'Crea tu cuenta como desarrollador o empresa y completa tu perfil profesional.',
                },
                {
                  step: '02',
                  icon: Code2,
                  title: 'Descubre',
                  description:
                    'Explora el catálogo de agentes o publica una oferta para atraer desarrolladores.',
                },
                {
                  step: '03',
                  icon: Zap,
                  title: 'Conecta',
                  description:
                    'Negocia, acuerda y certifica el trabajo. Todo dentro de la plataforma.',
                },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="inline-flex mb-6">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20">
                        <item.icon className="h-7 w-7 text-violet-400" />
                      </div>
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                        {item.step}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            ROLES SECTION — Developer vs Company
            ================================================================ */}
        <section className="py-20 sm:py-28 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-violet-600/[0.02] to-transparent" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Dos perfiles, un ecosistema
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Developer */}
              <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-600/[0.05] to-transparent p-8 hover:border-violet-500/30 transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/15 mb-6">
                  <Code2 className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Desarrollador</h3>
                <p className="text-gray-400 mb-6">
                  Publica tus agentes de IA, postúlate a ofertas y construye tu reputación profesional.
                </p>
                <ul className="space-y-3">
                  {[
                    'Publica y gestiona agentes',
                    'Postúlate a ofertas laborales',
                    'Gana badges de verificación',
                    'Dashboard con métricas',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-600/[0.05] to-transparent p-8 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/15 mb-6">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Empresa</h3>
                <p className="text-gray-400 mb-6">
                  Encuentra agentes de IA, publica ofertas y contrata a los mejores desarrolladores.
                </p>
                <ul className="space-y-3">
                  {[
                    'Explora catálogo de agentes',
                    'Publica ofertas de trabajo',
                    'Contrata con confianza',
                    'Certifica entregas',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            CTA FINAL
            ================================================================ */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl border border-white/5 bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-blue-600/10 p-12 sm:p-16 text-center overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] -z-10" />

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Únete a AgentVerse y forma parte del ecosistema B2B de inteligencia artificial más innovador.
              </p>

              <Link href="/register">
                <Button size="lg" className="min-w-[220px]">
                  Crear cuenta gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
