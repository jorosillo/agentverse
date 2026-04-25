/**
 * Use Case: Actualizar una Oferta existente.
 * Fuente: HU-25. Solo el owner puede editar.
 */
import { jobRepository } from '@/infrastructure/repositories/job.repository';
import { updateJobSchema, type UpdateJobInput } from '@/lib/schemas/job.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

export async function updateJobUseCase(
  session: SessionUser,
  jobId: string,
  input: UpdateJobInput,
  newImageUrls?: string[]
): Promise<ActionResult> {
  if (session.role !== 'COMPANY') {
    return { success: false, error: 'Solo las empresas pueden editar ofertas.' };
  }

  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico primero.' };
  }

  const parsed = updateJobSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const existing = await jobRepository.findById(jobId);
  if (!existing || !existing.isActive) {
    return { success: false, error: 'Oferta no encontrada.' };
  }
  if (existing.ownerCompanyId !== session.userId) {
    return { success: false, error: 'No tienes permiso para editar esta oferta.' };
  }

  const { categoryIds, ...updateData } = parsed.data;

  let images = existing.images;
  if (newImageUrls && newImageUrls.length > 0) {
    images = [...existing.images, ...newImageUrls].slice(0, 5);
  }

  await jobRepository.update(
    jobId,
    { ...updateData, images },
    categoryIds
  );

  return { success: true, data: undefined };
}
