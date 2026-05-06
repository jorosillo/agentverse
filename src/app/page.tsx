import Link from 'next/link';
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
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      <main className="flex min-h-[calc(100svh_-_var(--app-nav-height))] w-full flex-col overflow-hidden">
        {/* ================================================================
            HERO SECTION
            ================================================================ */}
        <section className="relative flex w-full flex-col items-center justify-center pt-12 pb-24 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-40">
          {/* Background glow effects */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="section-shell flex flex-col items-center text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">
                Marketplace B2B de Agentes de IA
              </span>
            </div>

            {/* Heading */}
            <h1 className="mx-auto mt-8 max-w-5xl text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
              El marketplace para{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                Agentes de IA
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-gray-400 sm:text-lg md:text-xl">
              Descubre agentes de IA especializados para automatizar los flujos de trabajo de tu empresa. Conecta con desarrolladores profesionales y encuentra la solución perfecta.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col w-full max-w-md items-center justify-center gap-4 sm:flex-row sm:max-w-none">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:min-w-[220px]">
                  <Bot className="h-5 w-5 mr-2" />
                  Explorar agentes
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:min-w-[220px]">
                  <Zap className="h-5 w-5 mr-2" />
                  Explorar ofertas
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-3 sm:gap-8">
              {[
                { value: '100+', label: 'Agentes disponibles' },
                { value: '50+', label: 'Empresas activas' },
                { value: '4.8', label: 'Rating promedio' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center justify-center p-4">
                  <div className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
                  <div className="mt-2 text-sm font-medium text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            FEATURES SECTION
            ================================================================ */}
        <section className="relative w-full py-20 sm:py-32 bg-white/[0.02] border-y border-white/5">
          <div className="section-shell relative z-10">
            <div className="mb-16 md:mb-24">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                ¿Por qué{' '}
                <span className="text-violet-400">AgentVerse</span>?
              </h2>
              <p className="mt-6 max-w-2xl text-lg text-gray-400">
                Diseñado exclusivamente para la colaboración B2B. Proveemos el ecosistema ideal para que la innovación en IA suceda de manera segura y eficiente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: BrainCircuit,
                  title: 'Agentes especializados',
                  description: 'Encuentra soluciones de IA adaptadas a tus necesidades: chatbots, análisis de datos y automatización.',
                },
                {
                  icon: Shield,
                  title: 'Acuerdos seguros',
                  description: 'Sistema de pagos simulado con certificación bilateral. Cada acuerdo está protegido por la plataforma.',
                },
                {
                  icon: Star,
                  title: 'Reputación verificada',
                  description: 'Sistema de reputación progresiva con badges de verificación. Evalúa profesionales antes de contratar.',
                },
                {
                  icon: MessageSquare,
                  title: 'Comunicación directa',
                  description: 'Mensajería integrada para negociar acuerdos y hacer seguimiento del progreso en tiempo real.',
                },
                {
                  icon: Globe,
                  title: 'Marketplace global',
                  description: 'Conecta con desarrolladores y empresas de todo el mundo. Sin fronteras para la innovación.',
                },
                {
                  icon: TrendingUp,
                  title: 'Métricas en tiempo real',
                  description: 'Dashboards personalizados con KPIs y analíticas para medir tu impacto y optimizar tu negocio.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all hover:bg-white/[0.05] hover:border-violet-500/30"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-base text-gray-400 leading-relaxed">
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
        <section className="relative w-full py-20 sm:py-32">
          <div className="section-shell">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Cómo funciona
              </h2>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400">
                Tres pasos simples para conectar tu negocio con la solución de IA perfecta o monetizar tus desarrollos.
              </p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 max-w-5xl mx-auto">
              {/* Decorative line connecting steps on desktop */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent -z-10" />

              {[
                {
                  step: '01',
                  icon: Users,
                  title: 'Regístrate',
                  description: 'Crea tu cuenta como desarrollador o empresa y completa tu perfil profesional.',
                },
                {
                  step: '02',
                  icon: Code2,
                  title: 'Descubre',
                  description: 'Explora el catálogo de agentes o publica una oferta para atraer desarrolladores.',
                },
                {
                  step: '03',
                  icon: Zap,
                  title: 'Conecta',
                  description: 'Negocia, acuerda y certifica el trabajo. Todo dentro de nuestra plataforma.',
                },
              ].map((item) => (
                <div key={item.step} className="relative flex flex-col items-center text-center group">
                  <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-background transition-transform group-hover:-translate-y-2">
                    <div className="absolute inset-0 rounded-2xl bg-violet-500/5 transition-colors group-hover:bg-violet-500/10" />
                    <item.icon className="h-10 w-10 text-violet-400 relative z-10" />
                    <span className="absolute -top-4 -right-4 text-5xl font-black text-white/5 select-none pointer-events-none transition-colors group-hover:text-violet-500/10">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-base text-gray-400 leading-relaxed max-w-xs">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            ROLES SECTION
            ================================================================ */}
        <section className="relative w-full py-20 sm:py-32 bg-white/[0.02] border-y border-white/5 overflow-hidden">
          {/* Subtle glow for this section */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-violet-600/5 rounded-full blur-[100px] -z-10" />
          
          <div className="section-shell relative z-10">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Dos perfiles, un ecosistema
              </h2>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400">
                Un entorno diseñado con las herramientas específicas que necesitas, sin importar de qué lado del mercado estés.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Developer */}
              <div className="group relative flex flex-col rounded-3xl border border-violet-500/20 bg-background/50 p-8 sm:p-10 transition-all hover:bg-violet-500/5 hover:border-violet-500/40">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                  <Code2 className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="mb-4 text-3xl font-bold text-white">Desarrollador</h3>
                <p className="mb-8 text-lg text-gray-400">
                  Publica tus agentes de IA, postúlate a ofertas de empresas líderes y construye tu reputación como experto.
                </p>
                <ul className="space-y-4 mt-auto">
                  {[
                    'Publica y gestiona agentes',
                    'Postúlate a ofertas laborales',
                    'Gana badges de verificación',
                    'Dashboard con métricas avanzadas',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base text-gray-300">
                      <CheckCircle2 className="h-6 w-6 text-violet-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div className="group relative flex flex-col rounded-3xl border border-blue-500/20 bg-background/50 p-8 sm:p-10 transition-all hover:bg-blue-500/5 hover:border-blue-500/40">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Globe className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="mb-4 text-3xl font-bold text-white">Empresa</h3>
                <p className="mb-8 text-lg text-gray-400">
                  Encuentra las mejores soluciones de IA, publica tus requerimientos y contrata talento verificado.
                </p>
                <ul className="space-y-4 mt-auto">
                  {[
                    'Explora catálogo de agentes',
                    'Publica ofertas de trabajo',
                    'Contrata con total confianza',
                    'Certifica entregas de forma segura',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base text-gray-300">
                      <CheckCircle2 className="h-6 w-6 text-blue-400 shrink-0" />
                      <span>{item}</span>
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
        <section className="relative w-full py-20 sm:py-32 mb-8">
          <div className="section-shell">
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-blue-600/20 p-10 sm:p-16 lg:p-20 text-center shadow-2xl shadow-violet-500/10">
              {/* Internal Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                  ¿Listo para empezar?
                </h2>
                <p className="mb-10 max-w-2xl mx-auto text-lg text-gray-300">
                  Únete a AgentVerse y forma parte del ecosistema B2B de inteligencia artificial más innovador de la industria.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:min-w-[240px] text-lg font-semibold py-4 h-auto rounded-2xl">
                      Crear cuenta gratis
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
