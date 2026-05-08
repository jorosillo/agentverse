/**
 * Use Case: Máquina de estados del acuerdo.
 * PENDING → IN_PROGRESS → PENDING_CERTIFICATION → COMPLETED
 * 
 * Acciones:
 * - accept (Company): PENDING → IN_PROGRESS (pago simulado)
 * - complete (Developer): IN_PROGRESS → PENDING_CERTIFICATION
 * - certify (Company): PENDING_CERTIFICATION → COMPLETED
 */
import { conversationRepository } from '@/infrastructure/repositories/conversation.repository';
import { sendAgreementNotification } from '@/infrastructure/services/email.service';
import { messageRepository } from '@/infrastructure/repositories/message.repository';
import { acceptProposalSchema, updateConversationStatusSchema } from '@/lib/schemas/message.schema';
import type { AcceptProposalInput, UpdateConversationStatusInput } from '@/lib/schemas/message.schema';
import type { ActionResult, SessionUser } from '@/lib/types';

/**
 * Company acepta propuesta con pago simulado → PENDING → IN_PROGRESS
 */
export async function acceptProposalUseCase(
  session: SessionUser,
  input: AcceptProposalInput
): Promise<ActionResult> {
  if (session.role !== 'COMPANY') {
    return { success: false, error: 'Solo las empresas pueden aceptar propuestas.' };
  }

  if (!session.isEmailVerified) {
    return { success: false, error: 'Debes verificar tu correo electrónico primero.' };
  }

  const parsed = acceptProposalSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const conversation = await conversationRepository.findById(parsed.data.conversationId);
  if (!conversation) {
    return { success: false, error: 'Conversación no encontrada.' };
  }

  const isParticipant = conversation.participantAId === session.userId || conversation.participantBId === session.userId;
  if (!isParticipant) {
    return { success: false, error: 'No tienes acceso a esta conversación.' };
  }

  if (conversation.status !== 'PENDING') {
    return { success: false, error: 'La conversación no está en estado pendiente.' };
  }

  await conversationRepository.updateStatus(parsed.data.conversationId, 'IN_PROGRESS', parsed.data.agreedPrice);

  // Mensaje de sistema
  await messageRepository.create({
    conversationId: parsed.data.conversationId,
    senderId: session.userId,
    content: `💰 Propuesta aceptada. Importe acordado: ${parsed.data.agreedPrice.toLocaleString('es-ES')}€. El acuerdo está en progreso.`,
    isSystemMessage: true,
  });

  // Notificación por email (best-effort, no bloquea la acción)
  try {
    const recipient = session.userId === conversation.participantAId ? conversation.participantB : conversation.participantA;
    if (recipient.emailPreferences && recipient.email) {
      const recipientName = recipient.developerProfile?.fullName || recipient.companyProfile?.companyName || 'Usuario';
      await sendAgreementNotification(
        recipient.email,
        recipientName,
        '¡Propuesta aceptada!',
        `La empresa ha aceptado tu propuesta por un valor de ${parsed.data.agreedPrice}€. El trabajo ha comenzado oficialmente.`,
        input.conversationId
      );
    }
  } catch (e) {
    console.error('[EMAIL] Error enviando notificación de acuerdo:', e);
  }

  return { success: true, data: undefined };
}

/**
 * Developer marca encargo como completado o Company certifica entrega.
 */
export async function updateConversationStatusUseCase(
  session: SessionUser,
  input: UpdateConversationStatusInput
): Promise<ActionResult> {
  const parsed = updateConversationStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Datos inválidos' };
  }

  const conversation = await conversationRepository.findById(parsed.data.conversationId);
  if (!conversation) {
    return { success: false, error: 'Conversación no encontrada.' };
  }

  const isParticipant = conversation.participantAId === session.userId || conversation.participantBId === session.userId;
  if (!isParticipant) {
    return { success: false, error: 'No tienes acceso a esta conversación.' };
  }

  const { action } = parsed.data;

  // Máquina de estados
  if (action === 'complete') {
    // Solo Developer puede completar
    if (session.role !== 'DEVELOPER') {
      return { success: false, error: 'Solo el desarrollador puede marcar como completado.' };
    }
    if (conversation.status !== 'IN_PROGRESS') {
      return { success: false, error: 'El acuerdo debe estar en progreso.' };
    }

    await conversationRepository.updateStatus(parsed.data.conversationId, 'PENDING_CERTIFICATION');
    await messageRepository.create({
      conversationId: parsed.data.conversationId,
      senderId: session.userId,
      content: '✅ El desarrollador ha marcado el encargo como completado. Pendiente de certificación por la empresa.',
      isSystemMessage: true,
    });
  } else if (action === 'certify') {
    // Solo Company puede certificar
    if (session.role !== 'COMPANY') {
      return { success: false, error: 'Solo la empresa puede certificar la entrega.' };
    }
    if (conversation.status !== 'PENDING_CERTIFICATION') {
      return { success: false, error: 'El encargo debe estar pendiente de certificación.' };
    }

    await conversationRepository.updateStatus(parsed.data.conversationId, 'COMPLETED');
    await messageRepository.create({
      conversationId: parsed.data.conversationId,
      senderId: session.userId,
      content: '🎉 La empresa ha certificado la entrega. ¡Acuerdo completado! Ahora puedes dejar una valoración.',
      isSystemMessage: true,
    });
  } else if (action === 'cancel') {
    if (conversation.status === 'COMPLETED') {
      return { success: false, error: 'No se puede cancelar un acuerdo completado.' };
    }

    await conversationRepository.updateStatus(parsed.data.conversationId, 'ISSUE_REPORTED');
    await messageRepository.create({
      conversationId: parsed.data.conversationId,
      senderId: session.userId,
      content: '⚠️ Se ha reportado un problema con este acuerdo.',
      isSystemMessage: true,
    });
  }

  // Notificación por email (best-effort, no bloquea la acción)
  try {
    const recipient = session.userId === conversation.participantAId ? conversation.participantB : conversation.participantA;
    if (recipient.emailPreferences && recipient.email) {
      let subject = '';
      let messageBody = '';
      
      if (action === 'complete') {
        subject = '¡Acuerdo listo para certificar!';
        messageBody = `La otra parte ha marcado el acuerdo como listo. Por favor, revísalo y certifícalo para finalizar el proceso.`;
      } else if (action === 'certify') {
        subject = '¡Acuerdo completado con éxito!';
        messageBody = `El acuerdo ha sido finalizado y certificado. Ya puedes dejar una valoración sobre tu experiencia en el chat.`;
      }
      
      if (subject) {
        const recipientName = recipient.developerProfile?.fullName || recipient.companyProfile?.companyName || 'Usuario';
        await sendAgreementNotification(recipient.email, recipientName, subject, messageBody, parsed.data.conversationId);
      }
    }
  } catch (e) {
    console.error('[EMAIL] Error enviando notificación de estado:', e);
  }

  return { success: true, data: undefined };
}
