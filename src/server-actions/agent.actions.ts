/**
 * Server Actions para Agentes de IA.
 * Fase 3: CRUD + Catálogo + Anti-Scraping.
 */
'use server';

import { getSessionUseCase } from '@/use-cases/auth/get-session.use-case';
import { createAgentUseCase } from '@/use-cases/agents/create-agent.use-case';
import { updateAgentUseCase } from '@/use-cases/agents/update-agent.use-case';
import { deleteAgentUseCase } from '@/use-cases/agents/delete-agent.use-case';
import { getAgentByIdUseCase, getAgentsUseCase, getMyAgentsUseCase } from '@/use-cases/agents/get-agents.use-case';
import type { CreateAgentInput, UpdateAgentInput, AgentFiltersInput } from '@/lib/schemas/agent.schema';
import type { ActionResult } from '@/lib/types';

// ============================================================================
// HELPERS
// ============================================================================

async function requireSession() {
  const session = await getSessionUseCase();
  if (!session) throw new Error('NOT_AUTHENTICATED');
  return session;
}

// ============================================================================
// CREATE (HU-17)
// ============================================================================

/**
 * Crea un nuevo agente. Las imágenes se suben previamente con uploadAgentImage.
 */
export async function createAgent(
  input: CreateAgentInput,
  imageUrls: string[]
): Promise<ActionResult<{ agentId: string }>> {
  try {
    const session = await requireSession();
    return await createAgentUseCase(session, input, imageUrls);
  } catch {
    return { success: false, error: 'Error al crear el agente.' };
  }
}

// ============================================================================
// UPDATE (HU-18)
// ============================================================================

/**
 * Actualiza un agente existente.
 */
export async function updateAgent(
  agentId: string,
  input: UpdateAgentInput,
  newImageUrls?: string[]
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await updateAgentUseCase(session, agentId, input, newImageUrls);
  } catch {
    return { success: false, error: 'Error al actualizar el agente.' };
  }
}

// ============================================================================
// DELETE (HU-19)
// ============================================================================

/**
 * Elimina (soft-delete) un agente.
 */
export async function deleteAgent(agentId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await deleteAgentUseCase(session, agentId);
  } catch {
    return { success: false, error: 'Error al eliminar el agente.' };
  }
}

// ============================================================================
// READ (HU-20, HU-21, HU-22)
// ============================================================================

/**
 * Obtiene un agente por ID (con anti-scraping aplicado).
 */
export async function getAgentById(agentId: string) {
  try {
    const session = await requireSession();
    return await getAgentByIdUseCase(session, agentId);
  } catch {
    return { success: false as const, error: 'Error al obtener el agente.' };
  }
}

/**
 * Lista agentes con filtros y paginación (anti-scraping aplicado).
 */
export async function getAgents(filters: Partial<AgentFiltersInput>) {
  try {
    const session = await requireSession();
    return await getAgentsUseCase(session, filters);
  } catch {
    return { success: false as const, error: 'Error al listar agentes.' };
  }
}

/**
 * Lista los agentes del usuario actual (solo DEVELOPER).
 */
export async function getMyAgents() {
  try {
    const session = await requireSession();
    return await getMyAgentsUseCase(session);
  } catch {
    return { success: false as const, error: 'Error al obtener tus agentes.' };
  }
}

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Obtiene todas las categorías disponibles para agentes.
 */
export async function getAllCategories() {
  try {
    const { agentRepository } = await import('@/infrastructure/repositories/agent.repository');
    return { success: true as const, data: await agentRepository.findAllCategories() };
  } catch {
    return { success: false as const, error: 'Error al obtener categorías.' };
  }
}
