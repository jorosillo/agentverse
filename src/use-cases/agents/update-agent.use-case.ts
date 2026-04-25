/**
 * Use Case: Actualizar un Agente existente.
 * Fuente: HU-18. Solo el autor puede editar.
 */
import { agentRepository } from '@/infrastructure/repositories/agent.repository';
import { updateAgentSchema, type UpdateAgentInput } from '@/lib/schemas/agent.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

export async function updateAgentUseCase(
  session: SessionUser,
  agentId: string,
  input: UpdateAgentInput,
  newImageUrls?: string[]
): Promise<ActionResult> {
  if (session.role !== 'DEVELOPER') {
    return { success: false, error: 'Solo los desarrolladores pueden editar agentes.' };
  }

  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico primero.' };
  }

  const parsed = updateAgentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  // Verificar propiedad
  const existing = await agentRepository.findById(agentId);
  if (!existing || !existing.isActive) {
    return { success: false, error: 'Agente no encontrado.' };
  }
  if (existing.authorId !== session.userId) {
    return { success: false, error: 'No tienes permiso para editar este agente.' };
  }

  // Construir datos de actualización
  const { categoryIds, ...updateData } = parsed.data;

  // Si hay nuevas imágenes, fusionar con existentes (máx 5)
  let images = existing.images;
  if (newImageUrls && newImageUrls.length > 0) {
    images = [...existing.images, ...newImageUrls].slice(0, 5);
  }

  await agentRepository.update(
    agentId,
    { ...updateData, images },
    categoryIds
  );

  return { success: true, data: undefined };
}
