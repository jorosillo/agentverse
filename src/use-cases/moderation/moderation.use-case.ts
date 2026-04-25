/**
 * Use Cases de moderación: reportar y bloquear usuarios.
 */
import { moderationRepository } from '@/infrastructure/repositories/moderation.repository';
import type { ReportCategory } from '@prisma/client';
import type { ActionResult, SessionUser } from '@/lib/types';

export async function reportUserUseCase(
  session: SessionUser,
  reportedUserId: string,
  category: ReportCategory,
  reason?: string
): Promise<ActionResult> {
  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico primero.' };
  }

  if (reportedUserId === session.userId) {
    return { success: false, error: 'No puedes reportarte a ti mismo.' };
  }

  await moderationRepository.createReport({
    reporterId: session.userId,
    reportedUserId,
    category,
    reason,
  });

  return { success: true, data: undefined };
}

export async function blockUserUseCase(
  session: SessionUser,
  blockedId: string
): Promise<ActionResult> {
  if (blockedId === session.userId) {
    return { success: false, error: 'No puedes bloquearte a ti mismo.' };
  }

  await moderationRepository.blockUser(session.userId, blockedId);
  return { success: true, data: undefined };
}

export async function unblockUserUseCase(
  session: SessionUser,
  blockedId: string
): Promise<ActionResult> {
  await moderationRepository.unblockUser(session.userId, blockedId);
  return { success: true, data: undefined };
}
