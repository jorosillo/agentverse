/**
 * Use Case: Enviar mensaje en una conversación.
 * Rate limit: 10 mensajes/hora/usuario (plan.txt Fase 6).
 * Anti-XSS: sanitizar contenido.
 */
import { conversationRepository } from '@/infrastructure/repositories/conversation.repository';
import { messageRepository } from '@/infrastructure/repositories/message.repository';
import { sendMessageSchema, type SendMessageInput } from '@/lib/schemas/message.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

const MAX_MESSAGES_PER_HOUR = 10;

export async function sendMessageUseCase(
  session: SessionUser,
  input: SendMessageInput
): Promise<ActionResult> {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const { conversationId, content } = parsed.data;

  // Verificar que el usuario es participante
  const conversation = await conversationRepository.findById(conversationId);
  if (!conversation) {
    return { success: false, error: 'Conversación no encontrada.' };
  }

  const isParticipant =
    conversation.participantAId === session.userId ||
    conversation.participantBId === session.userId;
  if (!isParticipant) {
    return { success: false, error: 'No tienes acceso a esta conversación.' };
  }

  // Rate limit
  const recentCount = await messageRepository.countByUserInLastHour(session.userId);
  if (recentCount >= MAX_MESSAGES_PER_HOUR) {
    return { success: false, error: `Límite de ${MAX_MESSAGES_PER_HOUR} mensajes por hora alcanzado.` };
  }

  // Sanitizar contenido (anti-XSS básico)
  const sanitized = content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  await messageRepository.create({
    conversationId,
    senderId: session.userId,
    content: sanitized,
  });

  return { success: true, data: undefined };
}
