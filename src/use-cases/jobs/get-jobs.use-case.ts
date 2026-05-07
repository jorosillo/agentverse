/**
 * Use Cases de consulta de Ofertas con anti-scraping.
 * 
 * Anti-scraping (HU-30): sanitiza budget/paymentType/ownerCompany
 * para COMPANYs consultando ofertas ajenas.
 */
import { jobRepository } from '@/infrastructure/repositories/job.repository';
import { jobFiltersSchema, type JobFiltersInput } from '@/lib/schemas/job.schema';
import { sanitizeJobForRole, sanitizeJobsForRole, canFilterByPrice } from '@/lib/utils/anti-scraping';
import { shouldIncrementView } from '@/lib/utils/view-tracker';
import type { SessionUser } from '@/lib/types';

export async function getJobByIdUseCase(
  session: SessionUser,
  jobId: string
) {
  const job = await jobRepository.findById(jobId);
  if (!job || !job.isActive) {
    return { success: false as const, error: 'Oferta no encontrada.' };
  }

  // Incrementar vistas (solo si no fue vista recientemente por el mismo usuario)
  const viewKey = `job_${jobId}_user_${session.userId}`;
  if (shouldIncrementView(viewKey)) {
    jobRepository.incrementViews(jobId).catch(() => {});
  }

  const sanitized = sanitizeJobForRole(job, {
    userRole: session.role,
    userId: session.userId,
  });

  return { success: true as const, data: sanitized };
}

export async function getJobsUseCase(
  session: SessionUser,
  rawFilters: Partial<JobFiltersInput>
) {
  const parsed = jobFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) {
    return { success: false as const, error: 'Filtros inválidos.' };
  }

  const filters = parsed.data;

  // Anti-scraping: COMPANY no puede filtrar por presupuesto
  if (!canFilterByPrice(session.role, 'job')) {
    delete filters.minBudget;
    delete filters.maxBudget;
  }

  const result = await jobRepository.findMany(filters);

  const sanitizedData = sanitizeJobsForRole(result.data, {
    userRole: session.role,
    userId: session.userId,
  });

  return {
    success: true as const,
    data: sanitizedData,
    pagination: result.pagination,
  };
}

export async function getMyJobsUseCase(session: SessionUser) {
  if (session.role !== 'COMPANY') {
    return { success: false as const, error: 'Solo las empresas tienen ofertas.' };
  }

  const jobs = await jobRepository.findByOwner(session.userId);
  return { success: true as const, data: jobs };
}
