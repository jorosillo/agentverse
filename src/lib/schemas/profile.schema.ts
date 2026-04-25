/**
 * Schemas de validación Zod para Perfil de usuario.
 * Fuente: plan.txt Fase 2, HU-10 a HU-13.
 */
import { z } from 'zod';

// ============================================================================
// SCHEMA DE EDICIÓN DE PERFIL DEVELOPER (HU-11)
// ============================================================================

export const updateDeveloperProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  region: z.string().min(1, 'La región es obligatoria').optional(),
  githubUrl: z
    .string()
    .url('URL de GitHub inválida')
    .optional()
    .or(z.literal('')),
  skills: z
    .array(z.string())
    .min(1, 'Selecciona al menos una habilidad')
    .optional(),
  experienceLevel: z
    .enum(['YEARS_1_2', 'YEARS_2_4', 'YEARS_4_6', 'YEARS_6_10', 'YEARS_10'])
    .optional(),
  bio: z.string().max(2000, 'La bio no puede exceder 2000 caracteres').optional(),
  emailPreferences: z.boolean().optional(),
});

export type UpdateDeveloperProfileInput = z.infer<typeof updateDeveloperProfileSchema>;

// ============================================================================
// SCHEMA DE EDICIÓN DE PERFIL COMPANY (HU-11)
// ============================================================================

export const updateCompanyProfileSchema = z.object({
  companyName: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100)
    .optional(),
  industry: z
    .enum(['TECHNOLOGY', 'FINANCE', 'HEALTH', 'EDUCATION', 'RETAIL', 'OTHER'])
    .optional(),
  size: z
    .enum(['SIZE_1_10', 'SIZE_11_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_500'])
    .optional(),
  website: z
    .string()
    .url('URL del sitio web inválida')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  emailPreferences: z.boolean().optional(),
});

export type UpdateCompanyProfileInput = z.infer<typeof updateCompanyProfileSchema>;

// ============================================================================
// SCHEMA DE ELIMINACIÓN DE CUENTA (HU-13)
// ============================================================================

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine(
      (val) => val === 'ELIMINAR MI CUENTA',
      'Debes escribir "ELIMINAR MI CUENTA" para confirmar'
    ),
});

export type DeleteAccountInput = z.input<typeof deleteAccountSchema>;
