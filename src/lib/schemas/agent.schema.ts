/**
 * Schemas de validación Zod para Agentes de IA.
 * Fuente: plan.txt Fase 3, HU-17 a HU-23.
 * Límites estrictos: nombre (100 char), desc corta (100), desc larga (10000).
 */
import { z } from 'zod';

// ============================================================================
// SCHEMA DE CREACIÓN DE AGENTE (HU-17)
// ============================================================================

export const createAgentSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  shortDescription: z
    .string()
    .min(10, 'La descripción corta debe tener al menos 10 caracteres')
    .max(100, 'La descripción corta no puede exceder 100 caracteres'),
  longDescription: z
    .string()
    .min(50, 'La descripción larga debe tener al menos 50 caracteres')
    .max(10000, 'La descripción larga no puede exceder 10000 caracteres'),
  categoryIds: z
    .array(z.string().uuid())
    .min(1, 'Selecciona al menos una categoría'),
  technologies: z
    .array(z.string().min(1))
    .min(1, 'Añade al menos una tecnología'),
  paymentType: z.enum(['FIXED', 'MONTHLY', 'HOURLY'], {
    message: 'Selecciona una modalidad de pago',
  }),
  price: z
    .number()
    .positive('El precio debe ser mayor que 0')
    .optional(),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;

// ============================================================================
// SCHEMA DE EDICIÓN DE AGENTE (HU-18)
// ============================================================================

export const updateAgentSchema = createAgentSchema.partial();

export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;

// ============================================================================
// SCHEMA DE FILTROS DE AGENTES (HU-20, HU-21)
// ============================================================================

export const agentFiltersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  paymentType: z.enum(['FIXED', 'MONTHLY', 'HOURLY']).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  technologies: z.array(z.string()).optional(),
  sortBy: z
    .enum(['recent', 'rating', 'mostHired', 'mostViewed'])
    .optional()
    .default('recent'),
});

export type AgentFiltersInput = z.infer<typeof agentFiltersSchema>;
