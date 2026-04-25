/**
 * Página de detalle de una Oferta de Trabajo.
 * Fuente: HU-29. Anti-scraping aplicado en server action.
 */
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { getJobById } from '@/server-actions/job.actions';
import {
  Briefcase, Building2, Globe, Star, Eye, Calendar, ArrowLeft,
  Pencil, MessageSquare, Tag, Users,
} from 'lucide-react';
import { PAYMENT_TYPES, INDUSTRIES, COMPANY_SIZES } from '@/lib/constants/industries';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getJobById(id);
  if (!result.success) return { title: 'Oferta no encontrada' };
  return {
    title: `${result.data.name} — AgentVerse`,
    description: result.data.shortDescription,
  };
}

export default async function JobDetailPage({ params }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const result = await getJobById(id);

  if (!result.success || !result.data) notFound();

  const job = result.data;
  const isOwner = job.ownerCompanyId === session.userId;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                    job.status === 'OPEN'
                      ? 'bg-green-600/10 text-green-400 border border-green-500/20'
                      : 'bg-gray-600/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {job.status === 'OPEN' ? 'Abierta' : job.status === 'CLOSED' ? 'Cerrada' : 'Archivada'}
                  </span>
                  {job.categories.map((c: { category: { id: string; name: string } }, i: number) => (
                    <span key={i} className="px-2.5 py-0.5 text-xs rounded-full bg-blue-600/10 text-blue-300 border border-blue-500/20">
                      <Tag className="h-2.5 w-2.5 inline mr-1" />
                      {c.category.name}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{job.name}</h1>
                <p className="text-sm text-gray-400">{job.shortDescription}</p>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {job.viewCount} visitas
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(job.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {isOwner && (
                <Link
                  href={`/jobs/${job.id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
                >
                  <Pencil className="h-3 w-3" />
                  Editar
                </Link>
              )}
            </div>
          </div>

          {/* Long description */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-4">Descripción</h2>
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
              {job.longDescription}
            </div>
          </div>

          {/* Technologies */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white mb-4">Tecnologías requeridas</h2>
            <div className="flex flex-wrap gap-2">
              {job.technologies.map((tech: string) => (
                <span key={tech} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Images gallery */}
          {job.images.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white mb-4">Material adjunto</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {job.images.map((url: string, i: number) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/5">
                    <img src={url} alt={`${job.name} imagen ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-4">
          {/* Budget card */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Presupuesto</h3>
            {job.budget !== null && job.paymentType ? (
              <div>
                <p className="text-3xl font-bold text-white">
                  {job.budget.toLocaleString('es-ES')}€
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {PAYMENT_TYPES[job.paymentType as keyof typeof PAYMENT_TYPES] || job.paymentType}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 italic">Información no disponible</p>
            )}

            {!isOwner && session.role === 'DEVELOPER' && (
              <Link
                href={`/messages?jobId=${job.id}`}
                className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Postularse
              </Link>
            )}
          </div>

          {/* Company card */}
          {job.ownerCompany && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Empresa</h3>
              <Link
                href={`/profile/${job.ownerCompany.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-sm font-bold text-blue-400">
                  {job.ownerCompany.companyProfile?.companyName.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                    {job.ownerCompany.companyProfile?.companyName || 'Empresa'}
                  </p>
                  {job.ownerCompany.companyProfile?.industry && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Building2 className="h-2.5 w-2.5" />
                      {INDUSTRIES[job.ownerCompany.companyProfile.industry as keyof typeof INDUSTRIES]}
                    </p>
                  )}
                </div>
              </Link>

              {job.ownerCompany.reputationScore !== undefined && job.ownerCompany.reputationScore > 0 && (
                <div className="flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg bg-white/5">
                  <Star className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs font-medium text-white">{job.ownerCompany.reputationScore.toFixed(1)}</span>
                </div>
              )}

              {job.ownerCompany.companyProfile?.size && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {COMPANY_SIZES[job.ownerCompany.companyProfile.size as keyof typeof COMPANY_SIZES]}
                </p>
              )}

              {job.ownerCompany.companyProfile?.website && (
                <a
                  href={job.ownerCompany.companyProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  Sitio web
                </a>
              )}
            </div>
          )}

          {!job.ownerCompany && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Empresa</h3>
              <p className="text-xs text-gray-600 italic">Información no disponible para tu rol</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
