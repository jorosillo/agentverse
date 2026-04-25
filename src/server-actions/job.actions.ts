/**
 * Server Actions para Ofertas de Trabajo (Jobs).
 * Fase 4: CRUD + Catálogo + Anti-Scraping.
 */
'use server';

import { getSessionUseCase } from '@/use-cases/auth/get-session.use-case';
import { createJobUseCase } from '@/use-cases/jobs/create-job.use-case';
import { updateJobUseCase } from '@/use-cases/jobs/update-job.use-case';
import { deleteJobUseCase } from '@/use-cases/jobs/delete-job.use-case';
import { getJobByIdUseCase, getJobsUseCase, getMyJobsUseCase } from '@/use-cases/jobs/get-jobs.use-case';
import type { CreateJobInput, UpdateJobInput, JobFiltersInput } from '@/lib/schemas/job.schema';
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
// CREATE (HU-24)
// ============================================================================

export async function createJob(
  input: CreateJobInput,
  imageUrls: string[]
): Promise<ActionResult<{ jobId: string }>> {
  try {
    const session = await requireSession();
    return await createJobUseCase(session, input, imageUrls);
  } catch {
    return { success: false, error: 'Error al crear la oferta.' };
  }
}

// ============================================================================
// UPDATE (HU-25)
// ============================================================================

export async function updateJob(
  jobId: string,
  input: UpdateJobInput,
  newImageUrls?: string[]
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await updateJobUseCase(session, jobId, input, newImageUrls);
  } catch {
    return { success: false, error: 'Error al actualizar la oferta.' };
  }
}

// ============================================================================
// DELETE (HU-26)
// ============================================================================

export async function deleteJob(jobId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await deleteJobUseCase(session, jobId);
  } catch {
    return { success: false, error: 'Error al eliminar la oferta.' };
  }
}

// ============================================================================
// READ (HU-27, HU-28, HU-29)
// ============================================================================

export async function getJobById(jobId: string) {
  try {
    const session = await requireSession();
    return await getJobByIdUseCase(session, jobId);
  } catch {
    return { success: false as const, error: 'Error al obtener la oferta.' };
  }
}

export async function getJobs(filters: Partial<JobFiltersInput>) {
  try {
    const session = await requireSession();
    return await getJobsUseCase(session, filters);
  } catch {
    return { success: false as const, error: 'Error al listar ofertas.' };
  }
}

export async function getMyJobs() {
  try {
    const session = await requireSession();
    return await getMyJobsUseCase(session);
  } catch {
    return { success: false as const, error: 'Error al obtener tus ofertas.' };
  }
}
