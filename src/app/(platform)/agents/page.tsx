/**
 * Catálogo de Agentes — Vista de búsqueda y exploración.
 * Fuente: HU-20, HU-21, HU-22.
 * Paginación SSR, filtrado dinámico, anti-scraping aplicado.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession } from '@/server-actions/auth.actions';
import { getAgents } from '@/server-actions/agent.actions';
import { canFilterByPrice } from '@/lib/utils/anti-scraping';
import { PAYMENT_TYPES } from '@/lib/constants/industries';
import {
  Cpu, Search, Eye, Plus, ArrowRight, ArrowLeft, Filter,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo de Agentes',
  description: 'Explora agentes de IA especializados en el marketplace de AgentVerse',
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AgentsCatalogPage({ searchParams }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const paymentType = typeof params.paymentType === 'string' ? params.paymentType : undefined;
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'recent';

  const result = await getAgents({
    page,
    limit: 12,
    search,
    paymentType: paymentType as 'FIXED' | 'MONTHLY' | 'HOURLY' | undefined,
    sortBy: sortBy as 'recent' | 'rating' | 'mostHired' | 'mostViewed',
  });

  const showPriceFilter = canFilterByPrice(session.role, 'agent');
  const isDeveloper = session.role === 'DEVELOPER';

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Catálogo de Agentes</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isDeveloper
              ? 'Explora y gestiona agentes de IA publicados'
              : 'Descubre agentes de IA para tu empresa'}
          </p>
        </div>
        {isDeveloper && (
          <Link
            href="/agents/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-medium text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 transition-all"
          >
            <Plus className="h-4 w-4" />
            Publicar agente
          </Link>
        )}
      </div>

      {/* Filters bar */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6 lg:p-8 mb-8">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_12rem_12rem_auto] items-end gap-4">
          {/* Search */}
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
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Payment type */}
          <div>
            <label htmlFor="filter-payment" className="block text-xs text-gray-500 mb-1.5">Modalidad</label>
            <select
              id="filter-payment"
              name="paymentType"
              defaultValue={paymentType}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
            >
              <option value="">Todas</option>
              {Object.entries(PAYMENT_TYPES).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="filter-sort" className="block text-xs text-gray-500 mb-1.5">Ordenar por</label>
            <select
              id="filter-sort"
              name="sortBy"
              defaultValue={sortBy}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
            >
              <option value="recent">Más recientes</option>
              <option value="rating">Mejor valorados</option>
              <option value="mostViewed">Más vistos</option>
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

      {/* Results Grid */}
      {!result.success ? (
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-5 sm:p-6 lg:p-8 text-center">
          <p className="text-sm text-red-400">{result.error}</p>
        </div>
      ) : result.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center sm:p-8 lg:p-12">
          <Cpu className="h-10 w-10 text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 mb-2">No se encontraron agentes</p>
          <p className="text-xs text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {result.data.map((agent) => (
              <AgentCard key={agent.id} agent={agent} showPrice={showPriceFilter} />
            ))}
          </div>

          {/* Pagination */}
          {result.pagination && result.pagination.totalPages > 1 && (
            <PaginationBar
              currentPage={result.pagination.page}
              totalPages={result.pagination.totalPages}
              basePath="/agents"
              searchParams={params}
            />
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// AGENT CARD
// ============================================================================

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    shortDescription: string;
    technologies: string[];
    paymentType: string | null;
    price: number | null;
    viewCount: number;
    author: {
      id: string;
      avatarUrl?: string | null;
      reputationScore?: number;
      developerProfile?: { fullName: string; region: string } | null;
    } | null;
    categories: { category: { name: string } }[];
  };
  showPrice: boolean;
}

function AgentCard({ agent, showPrice }: AgentCardProps) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] lg:p-8"
    >
      {/* Categories */}
      {agent.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {agent.categories.slice(0, 2).map((c, i) => (
            <span key={i} className="px-2 py-0.5 text-[10px] rounded-full bg-violet-600/10 text-violet-300 border border-violet-500/20">
              {c.category.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-violet-300 transition-colors line-clamp-1">
        {agent.name}
      </h3>
      <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-400">{agent.shortDescription}</p>

      {/* Technologies */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {agent.technologies.slice(0, 3).map((tech) => (
          <span key={tech} className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 text-gray-400 border border-white/5">
            {tech}
          </span>
        ))}
        {agent.technologies.length > 3 && (
          <span className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 text-gray-500">
            +{agent.technologies.length - 3}
          </span>
        )}
      </div>

      {/* Footer: Author + Price */}
      <div className="mt-auto flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {agent.author?.developerProfile && (
            <>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/10 text-[10px] font-bold text-violet-400 flex-shrink-0">
                {agent.author.developerProfile.fullName.charAt(0)}
              </div>
              <span className="text-xs text-gray-400 truncate">
                {agent.author.developerProfile.fullName}
              </span>
            </>
          )}
          {!agent.author && (
            <span className="text-xs text-gray-600 italic">Autor oculto</span>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <Eye className="h-3 w-3" />
            {agent.viewCount}
          </span>
          {showPrice && agent.price !== null && agent.paymentType && (
            <span className="text-xs font-semibold text-emerald-400">
              {agent.price.toLocaleString('es-ES')}€
              <span className="text-[10px] text-gray-500 font-normal ml-0.5">
                /{agent.paymentType === 'FIXED' ? 'fijo' : agent.paymentType === 'MONTHLY' ? 'mes' : 'hora'}
              </span>
            </span>
          )}
          {!showPrice && (
            <span className="text-[10px] text-gray-600 italic">Precio oculto</span>
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
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (key !== 'page' && val) {
        params.set(key, Array.isArray(val) ? val[0] : val);
      }
    });
    params.set('page', page.toString());
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Anterior
        </Link>
      )}

      <span className="text-sm text-gray-500 px-3">
        {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          Siguiente
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
