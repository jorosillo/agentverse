/**
 * Use Case: Iniciar una conversación vinculada a un Agent o Job.
 * Fuente: HU-31, HU-32.
 * ACID: crea conversación + mensaje inicial en transacción.
 */
import { conversationRepository } from '@/infrastructure/repositories/conversation.repository';
import { startConversationSchema, type StartConversationInput } from '@/lib/schemas/message.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

export async function startConversationUseCase(
  session: SessionUser,
  input: StartConversationInput
): Promise<ActionResult<{ conversationId: string }>> {
  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico primero.' };
  }

  const parsed = startConversationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const { recipientId, agentId, jobId, initialMessage } = parsed.data;

  // No puede conversar consigo mismo
  if (recipientId === session.userId) {
    return { success: false, error: 'No puedes enviar un mensaje a ti mismo.' };
  }

  // Verificar si ya existe conversación con el mismo recurso
  const existing = await conversationRepository.findExisting(
    session.userId, recipientId, agentId, jobId
  );
  if (existing) {
    return { success: true, data: { conversationId: existing.id } };
  }

  const conversation = await conversationRepository.create({
    participantAId: session.userId,
    participantBId: recipientId,
    agentId,
    jobId,
    initialMessage,
  });

  return { success: true, data: { conversationId: conversation.id } };
}
