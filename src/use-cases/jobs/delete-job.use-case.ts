/**
 * Use Case: Eliminar (soft-delete) una Oferta.
 * Fuente: HU-26. Solo el owner puede eliminar.
 */
import { jobRepository } from '@/infrastructure/repositories/job.repository';
import type { ActionResult, SessionUser } from '@/lib/types';

export async function deleteJobUseCase(
  session: SessionUser,
  jobId: string
): Promise<ActionResult> {
  if (session.role !== 'COMPANY') {
    return { success: false, error: 'Solo las empresas pueden eliminar ofertas.' };
  }

  const existing = await jobRepository.findById(jobId);
  if (!existing || !existing.isActive) {
    return { success: false, error: 'Oferta no encontrada.' };
  }
  if (existing.ownerCompanyId !== session.userId) {
    return { success: false, error: 'No tienes permiso para eliminar esta oferta.' };
  }

  await jobRepository.softDelete(jobId);

  return { success: true, data: undefined };
}
