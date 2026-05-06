/**
 * Perfil público de un usuario.
 * Fuente: HU-10.
 * Accesible para cualquier usuario autenticado.
 */
import { notFound } from 'next/navigation';
import { getPublicProfile } from '@/server-actions/profile.actions';
import { Star, MapPin, GitBranch, Globe, Building2, Users, Cpu, Briefcase, Calendar } from 'lucide-react';
import { EXPERIENCE_LEVELS, INDUSTRIES, COMPANY_SIZES } from '@/lib/constants/industries';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getPublicProfile(id);
  if (!result.success) return { title: 'Perfil no encontrado' };

  const name = result.data.developerProfile?.fullName || result.data.companyProfile?.companyName || 'Usuario';
  return {
    title: `${name} — AgentVerse`,
    description: `Perfil de ${name} en AgentVerse`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const result = await getPublicProfile(id);

  if (!result.success || !result.data) notFound();

  const user = result.data;
  const isDeveloper = user.role === 'DEVELOPER';
  const devProfile = user.developerProfile;
  const compProfile = user.companyProfile;
  const name = devProfile?.fullName || compProfile?.companyName || 'Usuario';

  return (
    <div className="page-shell-medium">
      {/* Header card */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-8 lg:p-10 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-white/10 flex-shrink-0">
            <span className="text-3xl font-bold text-violet-400">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white break-words">{name}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                isDeveloper
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                  : 'bg-blue-600/15 text-blue-300 border border-blue-500/20'
              }`}>
                {isDeveloper ? 'Desarrollador' : 'Empresa'}
              </span>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
              {isDeveloper && devProfile?.region && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {devProfile.region}
                </span>
              )}
              {isDeveloper && devProfile?.githubUrl && (
                <a
                  href={devProfile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-violet-400 transition-colors"
                >
                  <GitBranch className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
              {!isDeveloper && compProfile?.website && (
                <a
                  href={compProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-violet-400 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Reputation */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {user.reputationScore.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {isDeveloper && (
                  <>
                    <span className="flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      {user._count.agents} agentes
                    </span>
                    <span>{user._count.reviewsReceived} reseñas</span>
                  </>
                )}
                {!isDeveloper && (
                  <>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {user._count.jobs} ofertas
                    </span>
                    <span>{user._count.reviewsReceived} reseñas</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
        {/* Left: About */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-white mb-4">Sobre</h2>

          {isDeveloper && devProfile && (
            <div className="space-y-4">
              {devProfile.bio && (
                <p className="text-sm text-gray-300 leading-relaxed">{devProfile.bio}</p>
              )}
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Experiencia</span>
                <p className="text-sm text-white mt-1">
                  {EXPERIENCE_LEVELS[devProfile.experienceLevel as keyof typeof EXPERIENCE_LEVELS]}
                </p>
              </div>
            </div>
          )}

          {!isDeveloper && compProfile && (
            <div className="space-y-4">
              {compProfile.description && (
                <p className="text-sm text-gray-300 leading-relaxed">{compProfile.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Sector</span>
                  <p className="text-sm text-white mt-1 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    {INDUSTRIES[compProfile.industry as keyof typeof INDUSTRIES]}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Tamaño</span>
                  <p className="text-sm text-white mt-1 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    {COMPANY_SIZES[compProfile.size as keyof typeof COMPANY_SIZES]}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Skills (Developer) or empty CTA */}
        {isDeveloper && devProfile && devProfile.skills.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-white mb-4">Habilidades</h2>
            <div className="flex flex-wrap gap-2">
              {devProfile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-xs rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
