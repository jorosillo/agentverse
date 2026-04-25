/**
 * Use Case: Eliminar (soft-delete) un Agente.
 * Fuente: HU-19. Solo el autor puede eliminar.
 */
import { agentRepository } from '@/infrastructure/repositories/agent.repository';
import type { ActionResult, SessionUser } from '@/lib/types';

export async function deleteAgentUseCase(
  session: SessionUser,
  agentId: string
): Promise<ActionResult> {
  if (session.role !== 'DEVELOPER') {
    return { success: false, error: 'Solo los desarrolladores pueden eliminar agentes.' };
  }

  const existing = await agentRepository.findById(agentId);
  if (!existing || !existing.isActive) {
    return { success: false, error: 'Agente no encontrado.' };
  }
  if (existing.authorId !== session.userId) {
    return { success: false, error: 'No tienes permiso para eliminar este agente.' };
  }

  await agentRepository.softDelete(agentId);

  return { success: true, data: undefined };
}
