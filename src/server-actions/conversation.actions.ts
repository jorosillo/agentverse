/**
 * Server Actions para Mensajería y Negociación.
 * Fase 5: Conversaciones + Chat + Máquina de estados.
 */
'use server';

import { getSessionUseCase } from '@/use-cases/auth/get-session.use-case';
import { startConversationUseCase } from '@/use-cases/conversations/start-conversation.use-case';
import { sendMessageUseCase } from '@/use-cases/conversations/send-message.use-case';
import { acceptProposalUseCase, updateConversationStatusUseCase } from '@/use-cases/conversations/manage-agreement.use-case';
import { conversationRepository } from '@/infrastructure/repositories/conversation.repository';
import { messageRepository } from '@/infrastructure/repositories/message.repository';
import type { StartConversationInput, SendMessageInput, AcceptProposalInput, UpdateConversationStatusInput } from '@/lib/schemas/message.schema';
import type { ActionResult } from '@/lib/types';

async function requireSession() {
  const session = await getSessionUseCase();
  if (!session) throw new Error('NOT_AUTHENTICATED');
  return session;
}

// ============================================================================
// CONVERSACIONES
// ============================================================================

export async function startConversation(input: StartConversationInput): Promise<ActionResult<{ conversationId: string }>> {
  try {
    const session = await requireSession();
    return await startConversationUseCase(session, input);
  } catch {
    return { success: false, error: 'Error al iniciar la conversación.' };
  }
}

export async function getConversations() {
  try {
    const session = await requireSession();
    const conversations = await conversationRepository.findByUserId(session.userId);
    return { success: true as const, data: conversations, currentUserId: session.userId };
  } catch {
    return { success: false as const, error: 'Error al obtener conversaciones.' };
  }
}

export async function getConversationById(conversationId: string) {
  try {
    const session = await requireSession();
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) {
      return { success: false as const, error: 'Conversación no encontrada.' };
    }
    const isParticipant = conversation.participantAId === session.userId || conversation.participantBId === session.userId;
    if (!isParticipant) {
      return { success: false as const, error: 'No tienes acceso a esta conversación.' };
    }
    return { success: true as const, data: conversation, currentUserId: session.userId, currentRole: session.role };
  } catch {
    return { success: false as const, error: 'Error al obtener la conversación.' };
  }
}

// ============================================================================
// MENSAJES
// ============================================================================

export async function sendMessage(input: SendMessageInput): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await sendMessageUseCase(session, input);
  } catch {
    return { success: false, error: 'Error al enviar el mensaje.' };
  }
}

export async function getMessages(conversationId: string, cursor?: string) {
  try {
    const session = await requireSession();
    // Verificar participación
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) {
      return { success: false as const, error: 'Conversación no encontrada.' };
    }
    const isParticipant = conversation.participantAId === session.userId || conversation.participantBId === session.userId;
    if (!isParticipant) {
      return { success: false as const, error: 'No tienes acceso a esta conversación.' };
    }
    const messages = await messageRepository.findByConversation(conversationId, cursor);
    return { success: true as const, data: messages, currentUserId: session.userId };
  } catch {
    return { success: false as const, error: 'Error al obtener mensajes.' };
  }
}

// ============================================================================
// MÁQUINA DE ESTADOS
// ============================================================================

export async function acceptProposal(input: AcceptProposalInput): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await acceptProposalUseCase(session, input);
  } catch {
    return { success: false, error: 'Error al aceptar la propuesta.' };
  }
}

export async function updateConversationStatus(input: UpdateConversationStatusInput): Promise<ActionResult> {
  try {
    const session = await requireSession();
    return await updateConversationStatusUseCase(session, input);
  } catch {
    return { success: false, error: 'Error al actualizar el estado.' };
  }
}
