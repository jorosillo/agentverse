/**
 * Schemas de validación Zod para Ofertas de Trabajo (Jobs).
 * Fuente: plan.txt Fase 4, HU-24 a HU-30.
 * Estructura simétrica al schema de agentes.
 */
import { z } from 'zod';

// ============================================================================
// SCHEMA DE CREACIÓN DE OFERTA (HU-24)
// ============================================================================

export const createJobSchema = z.object({
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
  budget: z
    .number()
    .positive('El presupuesto debe ser mayor que 0')
    .optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

// ============================================================================
// SCHEMA DE EDICIÓN DE OFERTA (HU-25)
// ============================================================================

export const updateJobSchema = createJobSchema.partial();

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

// ============================================================================
// SCHEMA DE FILTROS DE OFERTAS (HU-27, HU-28)
// ============================================================================

export const jobFiltersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  paymentType: z.enum(['FIXED', 'MONTHLY', 'HOURLY']).optional(),
  minBudget: z.coerce.number().positive().optional(),
  maxBudget: z.coerce.number().positive().optional(),
  technologies: z.array(z.string()).optional(),
  industry: z
    .enum(['TECHNOLOGY', 'FINANCE', 'HEALTH', 'EDUCATION', 'RETAIL', 'OTHER'])
    .optional(),
  companySize: z
    .enum(['SIZE_1_10', 'SIZE_11_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_500'])
    .optional(),
  sortBy: z
    .enum(['recent', 'rating', 'mostViewed', 'highestBudget'])
    .optional()
    .default('recent'),
});

export type JobFiltersInput = z.infer<typeof jobFiltersSchema>;
