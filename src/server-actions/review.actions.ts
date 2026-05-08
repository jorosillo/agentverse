/**
 * Server Actions de Valoraciones y Moderación.
 * Fase 6: Reviews + Reports + BlockList.
 */
'use server';

import { getSessionUseCase } from '@/use-cases/auth/get-session.use-case';
import { createReviewUseCase } from '@/use-cases/reviews/create-review.use-case';
import { reportUserUseCase, blockUserUseCase, unblockUserUseCase } from '@/use-cases/moderation/moderation.use-case';
import { reviewRepository } from '@/infrastructure/repositories/review.repository';
import type { CreateReviewInput } from '@/lib/schemas/review.schema';
import type { ReportCategory } from '@prisma/client';
import type { ActionResult } from '@/lib/types';

async function requireSession() {
  const session = await getSessionUseCase();
  if (!session) throw new Error('NOT_AUTHENTICATED');
  return session;
}

// ============================================================================
// REVIEWS
// ============================================================================

export async function createReview(input: CreateReviewInput): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await createReviewUseCase(session, input);
  } catch {
    return { success: false, error: 'Error al guardar la valoración.' };
  }
}

export async function getReviewsForConversation(conversationId: string) {
  try {
    await requireSession();
    const reviews = await reviewRepository.findByConversation(conversationId);
    return { success: true as const, data: reviews };
  } catch {
    return { success: false as const, error: 'Error al obtener valoraciones.' };
  }
}

export async function getReviewsForUser(userId: string) {
  try {
    await requireSession();
    const reviews = await reviewRepository.findByTarget(userId);
    const averages = await reviewRepository.getAverageForUser(userId);
    return { success: true as const, data: { reviews, averages } };
  } catch {
    return { success: false as const, error: 'Error al obtener valoraciones.' };
  }
}

export async function hasUserReviewed(conversationId: string): Promise<boolean> {
  try {
    const session = await requireSession();
    return await reviewRepository.hasReviewed(conversationId, session.userId);
  } catch {
    return false;
  }
}

// ============================================================================
// REPORTS
// ============================================================================

export async function reportUser(
  reportedUserId: string,
  category: ReportCategory,
  reason?: string
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await reportUserUseCase(session, reportedUserId, category, reason);
  } catch {
    return { success: false, error: 'Error al enviar el reporte.' };
  }
}

// ============================================================================
// BLOCKLIST
// ============================================================================

export async function blockUser(blockedId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await blockUserUseCase(session, blockedId);
  } catch {
    return { success: false, error: 'Error al bloquear al usuario.' };
  }
}

export async function unblockUser(blockedId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await unblockUserUseCase(session, blockedId);
  } catch {
    return { success: false, error: 'Error al desbloquear al usuario.' };
  }
}

// ============================================================================
// REPUTACIÓN
// ============================================================================
// La reputación se recalcula internamente via el script compute-reputation.ts
// (cron job) o tras crear una review. No se expone como server action pública
// para evitar que cualquier usuario autenticado manipule scores ajenos.
