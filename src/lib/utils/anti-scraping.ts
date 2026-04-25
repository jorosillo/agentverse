/**
 * Utilidad Anti-Scraping.
 * Implementa las reglas de ocultamiento cruzado de datos sensibles
 * según el rol del usuario solicitante.
 * 
 * Fuente: agentverse_rules.md Regla 2, plan.txt Fases 3-4, HU-23/HU-30.
 * 
 * REGLAS:
 * - DEVELOPER consultando Agentes ajenos → price, paymentType, author = null
 * - COMPANY consultando Jobs ajenos → budget, ownerCompanyId = null
 * - Excepción: el usuario es el propietario del recurso
 */
import { UserRole } from '@prisma/client';

// ============================================================================
// TIPOS
// ============================================================================

interface AntiScrapingContext {
  userRole: UserRole;
  userId: string;
}

interface AgentData {
  authorId: string;
  price?: number | null;
  paymentType?: string | null;
  author?: unknown;
  [key: string]: unknown;
}

interface JobData {
  ownerCompanyId: string;
  budget?: number | null;
  ownerCompany?: unknown;
  [key: string]: unknown;
}

// ============================================================================
// FUNCIONES DE SANITIZACIÓN
// ============================================================================

/**
 * Sanitiza datos de un Agente según el rol del solicitante.
 * Si el solicitante es DEVELOPER y NO es el autor → oculta price, paymentType, author.
 */
export function sanitizeAgentForRole<T extends AgentData>(
  agent: T,
  context: AntiScrapingContext
): T {
  if (context.userRole === 'DEVELOPER' && context.userId !== agent.authorId) {
    return {
      ...agent,
      price: null,
      paymentType: null,
      author: null,
      authorId: null,
    };
  }
  return agent;
}

/**
 * Sanitiza una lista de Agentes según el rol del solicitante.
 */
export function sanitizeAgentsForRole<T extends AgentData>(
  agents: T[],
  context: AntiScrapingContext
): T[] {
  return agents.map((agent) => sanitizeAgentForRole(agent, context));
}

/**
 * Sanitiza datos de un Job según el rol del solicitante.
 * Si el solicitante es COMPANY y NO es el owner → oculta budget, ownerCompanyId, ownerCompany.
 */
export function sanitizeJobForRole<T extends JobData>(
  job: T,
  context: AntiScrapingContext
): T {
  if (context.userRole === 'COMPANY' && context.userId !== job.ownerCompanyId) {
    return {
      ...job,
      budget: null,
      paymentType: null,
      ownerCompany: null,
      ownerCompanyId: null,
    };
  }
  return job;
}

/**
 * Sanitiza una lista de Jobs según el rol del solicitante.
 */
export function sanitizeJobsForRole<T extends JobData>(
  jobs: T[],
  context: AntiScrapingContext
): T[] {
  return jobs.map((job) => sanitizeJobForRole(job, context));
}

/**
 * Determina si los filtros de precio deben estar disponibles para el rol.
 * - DEVELOPER NO puede filtrar agentes por precio
 * - COMPANY NO puede filtrar ofertas por presupuesto
 */
export function canFilterByPrice(
  userRole: UserRole,
  resourceType: 'agent' | 'job'
): boolean {
  if (resourceType === 'agent' && userRole === 'DEVELOPER') return false;
  if (resourceType === 'job' && userRole === 'COMPANY') return false;
  return true;
}
