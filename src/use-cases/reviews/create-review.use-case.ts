/**
 * Use Case: Crear una valoración post-acuerdo.
 * Fuente: HU-38. Solo se puede valorar en conversaciones COMPLETED.
 * Cada participante valora al otro una sola vez.
 */
import { reviewRepository } from '@/infrastructure/repositories/review.repository';
import { conversationRepository } from '@/infrastructure/repositories/conversation.repository';
import { createReviewSchema, type CreateReviewInput } from '@/lib/schemas/review.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

export async function createReviewUseCase(
  session: SessionUser,
  input: CreateReviewInput
): Promise<ActionResult> {
  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico primero.' };
  }

  const parsed = createReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const conversation = await conversationRepository.findById(parsed.data.conversationId);
  if (!conversation) {
    return { success: false, error: 'Conversación no encontrada.' };
  }

  if (conversation.status !== 'COMPLETED') {
    return { success: false, error: 'Solo puedes valorar un acuerdo completado.' };
  }

  const isParticipant =
    conversation.participantAId === session.userId ||
    conversation.participantBId === session.userId;
  if (!isParticipant) {
    return { success: false, error: 'No tienes acceso a esta conversación.' };
  }

  // Determine target
  const targetId =
    conversation.participantAId === session.userId
      ? conversation.participantBId
      : conversation.participantAId;

  // Check duplicate
  const alreadyReviewed = await reviewRepository.hasReviewed(
    parsed.data.conversationId, session.userId
  );
  if (alreadyReviewed) {
    return { success: false, error: 'Ya has valorado este acuerdo.' };
  }

  await reviewRepository.create({
    conversationId: parsed.data.conversationId,
    reviewerId: session.userId,
    targetId,
    professionalRating: parsed.data.professionalRating,
    fulfillmentRating: parsed.data.fulfillmentRating,
    communicationRating: parsed.data.communicationRating,
    comment: parsed.data.comment || undefined,
  });

  return { success: true, data: undefined };
}
