/**
 * Schemas de validación Zod para Reviews / Valoraciones.
 * Fuente: plan.txt Fase 6, HU-38.
 * Triple rúbrica (1-5): Profesionalidad, Cumplimiento, Comunicación.
 */
import { z } from 'zod';

const ratingField = z
  .number()
  .int('La valoración debe ser un entero')
  .min(1, 'Mínimo 1 estrella')
  .max(5, 'Máximo 5 estrellas');

// ============================================================================
// SCHEMA DE CREACIÓN DE REVIEW (HU-38)
// ============================================================================

export const createReviewSchema = z.object({
  conversationId: z.string().uuid('ID de conversación inválido'),
  professionalRating: ratingField,
  fulfillmentRating: ratingField,
  communicationRating: ratingField,
  comment: z
    .string()
    .max(2000, 'El comentario no puede exceder 2000 caracteres')
    .optional()
    .or(z.literal('')),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
