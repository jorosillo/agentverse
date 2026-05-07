/**
 * Catálogo de Ofertas de Trabajo — Vista de exploración.
 * Fuente: HU-27, HU-28, HU-29.
 * Paginación SSR, filtros dinámicos, anti-scraping.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { getJobs } from '@/server-actions/job.actions';
import { canFilterByPrice } from '@/lib/utils/anti-scraping';
import { PAYMENT_TYPES, INDUSTRIES } from '@/lib/constants/industries';
import {
  Briefcase, Search, Eye, Plus, ArrowRight, ArrowLeft, Filter, Building2,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo de Ofertas',
  description: 'Explora ofertas de trabajo para agentes de IA en AgentVerse',
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsCatalogPage({ searchParams }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === 'string' && params.search.trim() !== '' ? params.search : undefined;
  const paymentType = typeof params.paymentType === 'string' && params.paymentType !== '' ? params.paymentType : undefined;
  const industry = typeof params.industry === 'string' && params.industry !== '' ? params.industry : undefined;
  const sortBy = typeof params.sortBy === 'string' && params.sortBy !== '' ? params.sortBy : 'recent';

  const result = await getJobs({
    page,
    limit: 12,
    search,
    paymentType: paymentType as 'FIXED' | 'MONTHLY' | 'HOURLY' | undefined,
    industry: industry as 'TECHNOLOGY' | 'FINANCE' | 'HEALTH' | 'EDUCATION' | 'RETAIL' | 'OTHER' | undefined,
    sortBy: sortBy as 'recent' | 'rating' | 'mostViewed' | 'highestBudget',
  });

  const showBudgetFilter = canFilterByPrice(session.role, 'job');
  const isCompany = session.role === 'COMPANY';

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Ofertas de Trabajo</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isCompany
              ? 'Gestiona y publica ofertas para agentes de IA'
              : 'Descubre oportunidades laborales para tus agentes'}
          </p>
        </div>
        {isCompany && (
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all"
          >
            <Plus className="h-4 w-4" />
            Publicar oferta
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 mb-8">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_10rem_10rem_11rem_auto] items-end gap-4">
          <div>
            <label htmlFor="filter-search" className="block text-xs text-gray-500 mb-1.5">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="filter-search"
                name="search"
                type="text"
                defaultValue={search}
                placeholder="Nombre, tecnología..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="filter-industry" className="block text-xs text-gray-500 mb-1.5">Sector</label>
            <select
              id="filter-industry"
              name="industry"
              defaultValue={industry}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            >
              <option value="">Todos</option>
              {Object.entries(INDUSTRIES).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-payment" className="block text-xs text-gray-500 mb-1.5">Modalidad</label>
            <select
              id="filter-payment"
              name="paymentType"
              defaultValue={paymentType}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            >
              <option value="">Todas</option>
              {Object.entries(PAYMENT_TYPES).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-sort" className="block text-xs text-gray-500 mb-1.5">Ordenar por</label>
            <select
              id="filter-sort"
              name="sortBy"
              defaultValue={sortBy}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            >
              <option value="recent">Más recientes</option>
              <option value="rating">Mejor valorados</option>
              <option value="mostViewed">Más vistos</option>
              {showBudgetFilter && <option value="highestBudget">Mayor presupuesto</option>}
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <Filter className="h-3.5 w-3.5" />
            Filtrar
          </button>
        </form>
      </div>

      {/* Results */}
      {!result.success ? (
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-5 sm:p-6 lg:p-8 text-center">
          <p className="text-sm text-red-400">{result.error}</p>
        </div>
      ) : result.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center sm:p-8 lg:p-12">
          <Briefcase className="h-10 w-10 text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 mb-2">No se encontraron ofertas</p>
          <p className="text-xs text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {result.data.map((job) => (
              <JobCard key={job.id} job={job} showBudget={showBudgetFilter} />
            ))}
          </div>

          {result.pagination && result.pagination.totalPages > 1 && (
            <PaginationBar
              currentPage={result.pagination.page}
              totalPages={result.pagination.totalPages}
              basePath="/jobs"
              searchParams={params}
            />
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// JOB CARD
// ============================================================================

function JobCard({ job, showBudget }: {
  job: {
    id: string;
    name: string;
    shortDescription: string;
    technologies: string[];
    paymentType: string | null;
    budget: number | null;
    viewCount: number;
    status: string;
    ownerCompany: {
      id: string;
      companyProfile?: { companyName: string; industry: string; size?: string } | null;
    } | null;
    categories: { category: { name: string } }[];
  };
  showBudget: boolean;
}) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] lg:p-8"
    >
      {/* Status + Categories */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
          job.status === 'OPEN' ? 'bg-green-600/10 text-green-400 border border-green-500/20' : 'bg-gray-600/10 text-gray-400 border border-gray-500/20'
        }`}>
          {job.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
        </span>
        {job.categories.slice(0, 1).map((c, i) => (
          <span key={i} className="px-2 py-0.5 text-[10px] rounded-full bg-blue-600/10 text-blue-300 border border-blue-500/20">
            {c.category.name}
          </span>
        ))}
      </div>

      <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-blue-300 transition-colors line-clamp-1">
        {job.name}
      </h3>
      <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-400">{job.shortDescription}</p>

      {/* Technologies */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {job.technologies.slice(0, 3).map((tech) => (
          <span key={tech} className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 text-gray-400 border border-white/5">
            {tech}
          </span>
        ))}
        {job.technologies.length > 3 && (
          <span className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 text-gray-500">+{job.technologies.length - 3}</span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {job.ownerCompany?.companyProfile && (
            <>
              <Building2 className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-xs text-gray-400 truncate">
                {job.ownerCompany.companyProfile.companyName}
              </span>
            </>
          )}
          {!job.ownerCompany && (
            <span className="text-xs text-gray-600 italic">Empresa oculta</span>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <Eye className="h-3 w-3" />
            {job.viewCount}
          </span>
          {showBudget && job.budget !== null && job.paymentType && (
            <span className="text-xs font-semibold text-emerald-400">
              {job.budget.toLocaleString('es-ES')}€
            </span>
          )}
          {!showBudget && (
            <span className="text-[10px] text-gray-600 italic">Presupuesto oculto</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// PAGINATION
// ============================================================================

function PaginationBar({
  currentPage, totalPages, basePath, searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const buildUrl = (page: number) => {
    const p = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (key !== 'page' && val) p.set(key, Array.isArray(val) ? val[0] : val);
    });
    p.set('page', page.toString());
    return `${basePath}?${p.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link href={buildUrl(currentPage - 1)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="h-3.5 w-3.5" />
          Anterior
        </Link>
      )}
      <span className="text-sm text-gray-500 px-3">{currentPage} / {totalPages}</span>
      {currentPage < totalPages && (
        <Link href={buildUrl(currentPage + 1)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          Siguiente
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
