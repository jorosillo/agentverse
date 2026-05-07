/**
 * Use Case: Obtener un Agente por ID con anti-scraping.
 * Use Case: Listar agentes con filtros y paginación.
 * Use Case: Listar agentes del usuario actual.
 * 
 * Anti-scraping (HU-23): sanitiza price/paymentType/author para DEVELOPERs
 * consultando agentes ajenos.
 */
import { agentRepository } from '@/infrastructure/repositories/agent.repository';
import { agentFiltersSchema, type AgentFiltersInput } from '@/lib/schemas/agent.schema';
import { sanitizeAgentForRole, sanitizeAgentsForRole, canFilterByPrice } from '@/lib/utils/anti-scraping';
import { shouldIncrementView } from '@/lib/utils/view-tracker';
import type { SessionUser } from '@/lib/types';

export async function getAgentByIdUseCase(
  session: SessionUser,
  agentId: string
) {
  const agent = await agentRepository.findById(agentId);
  if (!agent || !agent.isActive) {
    return { success: false as const, error: 'Agente no encontrado.' };
  }

  // Incrementar vistas (solo si no fue vista recientemente por el mismo usuario)
  const viewKey = `agent_${agentId}_user_${session.userId}`;
  if (shouldIncrementView(viewKey)) {
    agentRepository.incrementViews(agentId).catch(() => {});
  }

  // Anti-scraping
  const sanitized = sanitizeAgentForRole(agent, {
    userRole: session.role,
    userId: session.userId,
  });

  return { success: true as const, data: sanitized };
}

export async function getAgentsUseCase(
  session: SessionUser,
  rawFilters: Partial<AgentFiltersInput>
) {
  // Validar filtros
  const parsed = agentFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) {
    return { success: false as const, error: 'Filtros inválidos.' };
  }

  const filters = parsed.data;

  // Anti-scraping: DEVELOPER no puede filtrar por precio
  if (!canFilterByPrice(session.role, 'agent')) {
    delete filters.minPrice;
    delete filters.maxPrice;
  }

  const result = await agentRepository.findMany(filters);

  // Sanitizar toda la lista
  const sanitizedData = sanitizeAgentsForRole(result.data, {
    userRole: session.role,
    userId: session.userId,
  });

  return {
    success: true as const,
    data: sanitizedData,
    pagination: result.pagination,
  };
}

export async function getMyAgentsUseCase(session: SessionUser) {
  if (session.role !== 'DEVELOPER') {
    return { success: false as const, error: 'Solo los desarrolladores tienen agentes.' };
  }

  const agents = await agentRepository.findByAuthor(session.userId);
  return { success: true as const, data: agents };
}
