/**
 * Schemas de validación Zod para autenticación.
 * Compartidos isomórficamente entre frontend (React Hook Form) y backend (Server Actions).
 * Fuente: plan.txt Fase 1, HU-01 a HU-06.
 */
import { z } from 'zod';

// ============================================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================================

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
const PASSWORD_ERROR_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, un número y un símbolo';

// ============================================================================
// SCHEMAS BASE
// ============================================================================

export const emailSchema = z
  .string()
  .min(1, 'El correo electrónico es obligatorio')
  .email('Formato de correo electrónico inválido');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
  .regex(PASSWORD_REGEX, PASSWORD_ERROR_MESSAGE);

// ============================================================================
// SCHEMA DE LOGIN (HU-03)
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// SCHEMA DE REGISTRO DEVELOPER (HU-01)
// ============================================================================

export const registerDeveloperSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: emailSchema,
    region: z.string().min(1, 'La región es obligatoria'),
    githubUrl: z
      .string()
      .url('URL de GitHub inválida')
      .optional()
      .or(z.literal('')),
    experienceLevel: z.enum(['YEARS_1_2', 'YEARS_2_4', 'YEARS_4_6', 'YEARS_6_10', 'YEARS_10'], {
      message: 'El nivel de experiencia es obligatorio',
    }),
    skills: z
      .array(z.string())
      .min(1, 'Selecciona al menos una habilidad técnica'),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'Debes aceptar los Términos y Condiciones'),
    acceptPrivacy: z
      .boolean()
      .refine((val) => val === true, 'Debes aceptar la Política de Privacidad'),
    emailPreferences: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterDeveloperInput = z.infer<typeof registerDeveloperSchema>;

// ============================================================================
// SCHEMA DE REGISTRO COMPANY (HU-02)
// ============================================================================

export const registerCompanySchema = z
  .object({
    companyName: z
      .string()
      .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: emailSchema,
    website: z
      .string()
      .url('URL del sitio web inválida')
      .optional()
      .or(z.literal('')),
    industry: z.enum(
      ['TECHNOLOGY', 'FINANCE', 'HEALTH', 'EDUCATION', 'RETAIL', 'OTHER'],
      { message: 'El sector es obligatorio' }
    ),
    size: z.enum(
      ['SIZE_1_10', 'SIZE_11_50', 'SIZE_51_200', 'SIZE_201_500', 'SIZE_500'],
      { message: 'El tamaño de la empresa es obligatorio' }
    ),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'Debes aceptar los Términos y Condiciones'),
    acceptPrivacy: z
      .boolean()
      .refine((val) => val === true, 'Debes aceptar la Política de Privacidad'),
    emailPreferences: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;

// ============================================================================
// SCHEMA DE RECUPERACIÓN DE CONTRASEÑA (HU-05)
// ============================================================================

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ============================================================================
// SCHEMA DE RESET DE CONTRASEÑA (HU-05)
// ============================================================================

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token inválido'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
