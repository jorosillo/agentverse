/**
 * Use Case: Crear una nueva Oferta de Trabajo.
 * Fuente: HU-24. Solo COMPANY con email verificado.
 * Rate limit: máx 5 ofertas/día.
 */
import { jobRepository } from '@/infrastructure/repositories/job.repository';
import { createJobSchema, type CreateJobInput } from '@/lib/schemas/job.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

const MAX_JOBS_PER_DAY = 5;

export async function createJobUseCase(
  session: SessionUser,
  input: CreateJobInput,
  imageUrls: string[]
): Promise<ActionResult<{ jobId: string }>> {
  if (session.role !== 'COMPANY') {
    return { success: false, error: 'Solo las empresas pueden publicar ofertas.' };
  }

  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico primero.' };
  }

  const parsed = createJobSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const todayCount = await jobRepository.countByOwnerToday(session.userId);
  if (todayCount >= MAX_JOBS_PER_DAY) {
    return { success: false, error: `Has alcanzado el límite de ${MAX_JOBS_PER_DAY} ofertas por día.` };
  }

  if (imageUrls.length > 5) {
    return { success: false, error: 'Máximo 5 imágenes por oferta.' };
  }

  const job = await jobRepository.create({
    ownerCompanyId: session.userId,
    name: parsed.data.name,
    shortDescription: parsed.data.shortDescription,
    longDescription: parsed.data.longDescription,
    technologies: parsed.data.technologies,
    paymentType: parsed.data.paymentType,
    budget: parsed.data.budget,
    images: imageUrls,
    categoryIds: parsed.data.categoryIds,
  });

  return { success: true, data: { jobId: job.id } };
}
