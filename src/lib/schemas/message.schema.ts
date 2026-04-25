/**
 * Schemas de validación Zod para Mensajería.
 * Fuente: plan.txt Fase 5, HU-31 a HU-34.
 */
import { z } from 'zod';

// ============================================================================
// SCHEMA DE INICIO DE CONVERSACIÓN (HU-31, HU-32)
// ============================================================================

export const startConversationSchema = z.object({
  recipientId: z.string().uuid('ID de destinatario inválido'),
  agentId: z.string().uuid().optional(),
  jobId: z.string().uuid().optional(),
  initialMessage: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(5000, 'El mensaje no puede exceder 5000 caracteres'),
}).refine(
  (data) => data.agentId || data.jobId,
  { message: 'Debe vincular la conversación a un agente o una oferta' }
).refine(
  (data) => !(data.agentId && data.jobId),
  { message: 'Una conversación solo puede vincularse a un agente O una oferta, no ambos' }
);

export type StartConversationInput = z.input<typeof startConversationSchema>;

// ============================================================================
// SCHEMA DE ENVÍO DE MENSAJE (HU-34)
// ============================================================================

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid('ID de conversación inválido'),
  content: z
    .string()
    .min(1, 'El mensaje no puede estar vacío')
    .max(5000, 'El mensaje no puede exceder 5000 caracteres'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ============================================================================
// SCHEMA DE ACEPTACIÓN DE PROPUESTA / PAGO SIMULADO (HU-35)
// ============================================================================

export const acceptProposalSchema = z.object({
  conversationId: z.string().uuid('ID de conversación inválido'),
  agreedPrice: z
    .number()
    .positive('El importe acordado debe ser mayor que 0'),
});

export type AcceptProposalInput = z.infer<typeof acceptProposalSchema>;

// ============================================================================
// SCHEMA DE CAMBIO DE ESTADO DE CONVERSACIÓN (HU-36)
// ============================================================================

export const updateConversationStatusSchema = z.object({
  conversationId: z.string().uuid('ID de conversación inválido'),
  action: z.enum(['complete', 'certify', 'cancel'], {
    message: 'Acción requerida',
  }),
});

export type UpdateConversationStatusInput = z.infer<typeof updateConversationStatusSchema>;
