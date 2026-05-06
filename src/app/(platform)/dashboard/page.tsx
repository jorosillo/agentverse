/**
 * Dashboard — Página principal del usuario autenticado.
 * Fuente: plan.txt Fase 2.
 * 
 * Developer: Nº agentes, ofertas aceptadas, visualizaciones, rating, top 5 agentes.
 * Company: Ofertas publicadas, agentes contratados, postulaciones, rating, top 5 ofertas.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Cpu,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Eye,
  Star,
  HandshakeIcon,
  TrendingUp,
  ArrowRight,
  Users,
} from 'lucide-react';
import { getCurrentSessionWithProfile } from '@/server-actions/auth.actions';
import { getDashboardStats } from '@/server-actions/profile.actions';
import { OnboardingModal } from '@/components/profile/OnboardingModal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Tu panel de control en AgentVerse',
};

export default async function DashboardPage() {
  const user = await getCurrentSessionWithProfile();
  if (!user) redirect('/login');

  const statsResult = await getDashboardStats();

  const displayName =
    user.role === 'DEVELOPER'
      ? user.developerProfile?.fullName || 'Desarrollador'
      : user.companyProfile?.companyName || 'Empresa';

  return (
    <div className="page-shell content-stack">
      {/* Onboarding modal */}
      {!user.onboardingCompleted && <OnboardingModal role={user.role} />}

      {/* Email verification banner */}
      {!user.isEmailVerified && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 sm:p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300">
              Verifica tu correo electrónico
            </p>
            <p className="text-xs text-yellow-400/70 mt-1">
              Revisa tu bandeja de entrada para completar la verificación. Es necesario para publicar contenido y realizar transacciones.
            </p>
          </div>
        </div>
      )}

      {/* Welcome header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10">
            <LayoutDashboard className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Hola, {displayName}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {user.role === 'DEVELOPER' ? 'Panel de Desarrollador' : 'Panel de Empresa'}
            </p>
          </div>
        </div>
        {user.isEmailVerified && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-600/10 border border-green-500/20">
            <ShieldCheck className="h-3.5 w-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-300">Cuenta verificada</span>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      {statsResult.success && (
        <div>
          {user.role === 'DEVELOPER' ? (
            <DeveloperStats stats={statsResult.data as DeveloperDashboardStats} />
          ) : (
            <CompanyStats stats={statsResult.data as CompanyDashboardStats} />
          )}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        {(user.role === 'DEVELOPER'
          ? [
              { href: '/agents', label: 'Mis Agentes', icon: Cpu, desc: 'Gestiona tus agentes publicados' },
              { href: '/jobs', label: 'Explorar Ofertas', icon: Briefcase, desc: 'Descubre oportunidades' },
              { href: '/messages', label: 'Mensajes', icon: MessageSquare, desc: 'Revisa tus conversaciones' },
            ]
          : [
              { href: '/agents', label: 'Explorar Agentes', icon: Cpu, desc: 'Descubre agentes de IA' },
              { href: '/jobs', label: 'Mis Ofertas', icon: Briefcase, desc: 'Gestiona tus publicaciones' },
              { href: '/messages', label: 'Mensajes', icon: MessageSquare, desc: 'Revisa tus conversaciones' },
            ]
        ).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 mb-4 group-hover:bg-violet-600/15 transition-colors">
              <link.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{link.label}</h3>
            <p className="text-sm text-gray-400">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent items list */}
      {statsResult.success && (
        <RecentItemsList
          role={user.role}
          items={
            user.role === 'DEVELOPER'
              ? (statsResult.data as DeveloperDashboardStats).recentAgents
              : (statsResult.data as CompanyDashboardStats).recentJobs
          }
        />
      )}
    </div>
  );
}

// ============================================================================
// KPI COMPONENTS
// ============================================================================

interface DeveloperDashboardStats {
  agentsCount: number;
  totalViews: number;
  acceptedDeals: number;
  completedDeals: number;
  overallRating: number;
  recentAgents: { id: string; name: string; shortDescription: string; viewCount: number; createdAt: Date }[];
}

interface CompanyDashboardStats {
  jobsCount: number;
  totalViews: number;
  agentsHired: number;
  applications: number;
  overallRating: number;
  recentJobs: { id: string; name: string; shortDescription: string; viewCount: number; status: string; createdAt: Date }[];
}

function StatCard({ icon: Icon, label, value, accent = false }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 hover:bg-white/[0.03] transition-colors">
      <div className="flex items-center gap-4 mb-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent ? 'bg-violet-600/15 text-violet-400' : 'bg-white/5 text-gray-400'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function DeveloperStats({ stats }: { stats: DeveloperDashboardStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
      <StatCard icon={Cpu} label="Agentes" value={stats.agentsCount} accent />
      <StatCard icon={Eye} label="Visualizaciones" value={stats.totalViews} />
      <StatCard icon={HandshakeIcon} label="Acuerdos" value={stats.acceptedDeals} />
      <StatCard icon={TrendingUp} label="Completados" value={stats.completedDeals} />
      <StatCard icon={Star} label="Rating" value={stats.overallRating || '—'} accent />
    </div>
  );
}

function CompanyStats({ stats }: { stats: CompanyDashboardStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
      <StatCard icon={Briefcase} label="Ofertas" value={stats.jobsCount} accent />
      <StatCard icon={Eye} label="Visualizaciones" value={stats.totalViews} />
      <StatCard icon={Users} label="Contratados" value={stats.agentsHired} />
      <StatCard icon={HandshakeIcon} label="Postulaciones" value={stats.applications} />
      <StatCard icon={Star} label="Rating" value={stats.overallRating || '—'} accent />
    </div>
  );
}

// ============================================================================
// RECENT ITEMS
// ============================================================================

function RecentItemsList({ role, items }: {
  role: string;
  items: { id: string; name: string; shortDescription: string; viewCount: number; createdAt: Date }[];
}) {
  const title = role === 'DEVELOPER' ? 'Agentes recientes' : 'Ofertas recientes';
  const basePath = role === 'DEVELOPER' ? '/agents' : '/jobs';

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center sm:p-8 lg:p-10">
        <p className="text-sm text-gray-500">
          {role === 'DEVELOPER'
            ? 'Aún no has publicado agentes. ¡Publica tu primer agente!'
            : 'Aún no has publicado ofertas. ¡Crea tu primera oferta!'}
        </p>
        <Link
          href={role === 'DEVELOPER' ? '/agents/new' : '/jobs/new'}
          className="inline-flex items-center gap-2 mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          Crear ahora
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <Link
          href={basePath}
          className="text-sm text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
        >
          Ver todos
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`${basePath}/${item.id}`}
            className="group flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-white/10 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {item.shortDescription}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 sm:ml-4">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="h-3 w-3" />
                {item.viewCount}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-violet-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
