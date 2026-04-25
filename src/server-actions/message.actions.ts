/**
 * Server Actions para mensajería y acuerdos.
 * Capa de exposición: Server Action → Use Case → Repository.
 */
'use server';

// TODO: Fase 5 — Implementar completamente
// - startConversation(formData: StartConversationInput): Promise<ActionResult<Conversation>>
// - sendMessage(formData: SendMessageInput): Promise<ActionResult<Message>>
// - getConversations(): Promise<ActionResult<ConversationWithDetails[]>>
// - getConversationById(id: string): Promise<ActionResult<ConversationWithDetails>>
// - acceptProposal(formData: AcceptProposalInput): Promise<ActionResult>
// - completeAgreement(conversationId: string): Promise<ActionResult>
// - certifyDelivery(conversationId: string): Promise<ActionResult>

export async function placeholder() {
  return { success: true as const, data: undefined };
}
