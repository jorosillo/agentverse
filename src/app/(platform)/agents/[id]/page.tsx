/**
 * Página de detalle de un Agente de IA.
 * Fuente: HU-22.
 * Anti-scraping aplicado en el server action.
 */
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { getAgentById } from '@/server-actions/agent.actions';
import {
  MapPin, Star, Eye, Calendar, ArrowLeft,
  Pencil, MessageSquare, Tag,
} from 'lucide-react';
import { PAYMENT_TYPES, EXPERIENCE_LEVELS } from '@/lib/constants/industries';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getAgentById(id);
  if (!result.success) return { title: 'Agente no encontrado' };
  return {
    title: `${result.data.name} — AgentVerse`,
    description: result.data.shortDescription,
  };
}

export default async function AgentDetailPage({ params }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const result = await getAgentById(id);

  if (!result.success || !result.data) notFound();

  const agent = result.data;
  const isOwner = agent.authorId === session.userId;

  return (
    <div className="page-shell-medium">
      {/* Back link */}
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        {/* Main content (2/3) */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Categories */}
                {agent.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {agent.categories.map((c: { category: { id: string; name: string } }, i: number) => (
                      <span key={i} className="px-2.5 py-0.5 text-xs rounded-full bg-violet-600/10 text-violet-300 border border-violet-500/20">
                        <Tag className="h-2.5 w-2.5 inline mr-1" />
                        {c.category.name}
                      </span>
                    ))}
                  </div>
                )}

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{agent.name}</h1>
                <p className="text-sm text-gray-400">{agent.shortDescription}</p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {agent.viewCount} visitas
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(agent.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {isOwner && (
                <Link
                  href={`/agents/${agent.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
                >
                  <Pencil className="h-3 w-3" />
                  Editar
                </Link>
              )}
            </div>
          </div>

          {/* Long description (Markdown) */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-white mb-4">Descripción</h2>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
              {agent.longDescription}
            </div>
          </div>

          {/* Technologies */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-white mb-4">Tecnologías</h2>
            <div className="flex flex-wrap gap-2">
              {agent.technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 text-xs rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Images gallery */}
          {agent.images.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-white mb-4">Galería</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {agent.images.map((url: string, i: number) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/5">
                    <img
                      src={url}
                      alt={`${agent.name} imagen ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-5 sm:space-y-6">
          {/* Pricing card */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Precio</h3>
            {agent.price !== null && agent.paymentType ? (
              <div>
                <p className="text-3xl font-bold text-white">
                  {agent.price.toLocaleString('es-ES')}€
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {PAYMENT_TYPES[agent.paymentType as keyof typeof PAYMENT_TYPES] || agent.paymentType}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 italic">Información no disponible</p>
            )}

            {!isOwner && (
              <Link
                href={`/messages?agentId=${agent.id}`}
                className="flex items-center justify-center gap-2 w-full mt-6 px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-medium text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Contactar
              </Link>
            )}
          </div>

          {/* Author card */}
          {agent.author && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Desarrollador</h3>
              <Link
                href={`/profile/${agent.author.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-sm font-bold text-violet-400">
                  {agent.author.developerProfile?.fullName.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                    {agent.author.developerProfile?.fullName || 'Desarrollador'}
                  </p>
                  {agent.author.developerProfile?.region && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" />
                      {agent.author.developerProfile.region}
                    </p>
                  )}
                </div>
              </Link>

              {agent.author.reputationScore !== undefined && agent.author.reputationScore > 0 && (
                <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg bg-white/5">
                  <Star className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs font-medium text-white">{agent.author.reputationScore.toFixed(1)}</span>
                </div>
              )}

              {agent.author.developerProfile?.experienceLevel && (
                <p className="text-xs text-gray-500 mt-2">
                  {EXPERIENCE_LEVELS[agent.author.developerProfile.experienceLevel as keyof typeof EXPERIENCE_LEVELS]}
                </p>
              )}
            </div>
          )}

          {!agent.author && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Desarrollador</h3>
              <p className="text-xs text-gray-600 italic">Información no disponible para tu rol</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
